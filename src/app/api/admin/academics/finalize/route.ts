import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import Enrollment from '@/models/Enrollment'
import Student from '@/models/Student'
import Course from '@/models/Course'
import { SettingsService } from '@/services/settingsService'
import mongoose from 'mongoose'

export async function POST() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const academicInfo = await SettingsService.getCurrentAcademicInfo()
        const { session: currentSession, semester: currentSemester } = academicInfo

        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // 1. Get all students
            const students = await Student.find({}).session(session)

            for (const student of students) {
                // 2. Get all enrollments for this session/semester
                const semesterEnrollments = await Enrollment.find({
                    studentId: student._id,
                    academicYear: currentSession,
                    semester: currentSemester,
                    status: 'APPROVED'
                }).session(session)

                if (semesterEnrollments.length === 0) continue

                // 3. Mark all APPROVED enrollments for this semester as isCompleted if they have a grade
                await Enrollment.updateMany(
                    {
                        studentId: student._id,
                        academicYear: currentSession,
                        semester: currentSemester,
                        status: 'APPROVED',
                        grade: { $exists: true, $ne: 'NG' }
                    },
                    { isCompleted: true },
                    { session }
                )

                // 4. Calculate New CGPA (aggregating all completed enrollments for this student)
                const allCompleted = await Enrollment.find({
                    studentId: student._id,
                    grade: { $exists: true, $ne: 'NG' }
                }).populate({ path: 'courseId', model: Course }).session(session)

                const totalPoints = allCompleted.reduce((sum, e) => sum + (e.gradePoint * (e.courseId?.creditUnits || 0)), 0)
                const totalUnits = allCompleted.reduce((sum, e) => sum + (e.courseId?.creditUnits || 0), 0)

                const newCgpa = totalUnits > 0 ? (totalPoints / totalUnits) : 0
                const newTotalCredits = totalUnits

                // 5. Promotion Logic (Only at the end of SECOND semester)
                let newLevel = student.level
                if (currentSemester === 'SECOND') {
                    // Simple promotion: If CGPA > 1.0, promote to next level (100 -> 200, etc.)
                    if (newCgpa >= 1.0 && student.level < 500) {
                        newLevel += 100
                    }
                }

                // 6. Update Student Profile
                await Student.findByIdAndUpdate(student._id, {
                    currentCgpa: Number(newCgpa.toFixed(2)),
                    totalCredits: newTotalCredits,
                    level: newLevel
                }).session(session)
            }

            await session.commitTransaction()

            // 7. Update System History
            await SettingsService.setSetting(`finalization_log_${currentSession}_${currentSemester}`, {
                timestamp: new Date(),
                status: 'COMPLETED',
                finalizedBy: user.email
            })

            return NextResponse.json({ message: `Semester ${currentSemester} (${currentSession}) finalized and promoted.` })
        } catch (txnError: any) {
            await session.abortTransaction()
            throw txnError
        } finally {
            session.endSession()
        }

    } catch (error: any) {
        console.error('Finalization error:', error)
        return NextResponse.json({ error: error.message || 'Finalization failed' }, { status: 500 })
    }
}
