import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Student from '@/models/Student'
import Course from '@/models/Course'
import User from '@/models/User'
import Notification from '@/models/Notification'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'PENDING'
        const grouped = searchParams.get('grouped') !== 'false'

        const enrollments = await Enrollment.find({
            status
        })
            .populate({
                path: 'studentId',
                model: Student,
                populate: { path: 'userId', model: User }
            })
            .populate({ path: 'courseId', model: Course })
            .lean()

        if (!grouped) {
            const flatResult = enrollments.map((e: any) => ({
                ...e,
                studentId: {
                    ...e.studentId,
                    fullName: `${e.studentId?.userId?.firstName} ${e.studentId?.userId?.lastName}`,
                    studentId: e.studentId?.matricNumber
                }
            }))
            return NextResponse.json(flatResult)
        }

        const studentGroups: Record<string, any> = {}
        enrollments.forEach((enrollment: any) => {
            const studentId = enrollment.studentId?._id?.toString()
            if (!studentId) return

            if (!studentGroups[studentId]) {
                studentGroups[studentId] = {
                    student: enrollment.studentId,
                    enrollments: [],
                    totalCredits: 0
                }
            }
            studentGroups[studentId].enrollments.push(enrollment)
            studentGroups[studentId].totalCredits += enrollment.courseId?.creditUnits || 0
        })

        const result = Object.values(studentGroups)
        return NextResponse.json(result)
    } catch (error) {
        console.error('Fetch registrations error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { enrollmentIds, action } = await request.json()

        if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
            return NextResponse.json({ error: 'Invalid enrollment IDs' }, { status: 400 })
        }

        if (!['APPROVED', 'REJECTED'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        if (action === 'APPROVED') {
            const candidateEnrollments = await Enrollment.find({ _id: { $in: enrollmentIds } })
                .populate({ path: 'courseId', model: Course })
                .populate({ path: 'studentId', model: Student, populate: { path: 'userId', model: User } })
                .lean()

            const studentGroups: Record<string, any> = {}
            candidateEnrollments.forEach((enroll: any) => {
                const sid = enroll.studentId?._id?.toString()
                if (!sid) return
                if (!studentGroups[sid]) {
                    studentGroups[sid] = {
                        student: enroll.studentId,
                        candidates: [],
                        candidateCredits: 0
                    }
                }
                studentGroups[sid].candidates.push(enroll)
                studentGroups[sid].candidateCredits += enroll.courseId?.creditUnits || 0
            })

            for (const sid in studentGroups) {
                const group = studentGroups[sid]
                const studentName = `${group.student.userId.firstName} ${group.student.userId.lastName}`
                const { department, level } = group.student

                const semestersInBatch = [...new Set(group.candidates.map((c: any) => c.semester))]

                for (const semester of semestersInBatch) {
                    const programCourses = await Course.find({ department, level, semester }).lean()
                    const programTotalUnits = programCourses.reduce((sum, c) => sum + (c.creditUnits || 0), 0)
                    const dynamicMaxCredits = programTotalUnits > 0 ? programTotalUnits + 2 : 24

                    const semesterCandidates = group.candidates.filter((c: any) => c.semester === semester)
                    const candidateCreditsForSemester = semesterCandidates.reduce((sum: number, c: any) => sum + (c.courseId?.creditUnits || 0), 0)
                    const candidateCourseIds = [...new Set(semesterCandidates.map((c: any) => c.courseId?._id?.toString()))]

                    const existingApproved = await Enrollment.find({
                        studentId: sid,
                        status: 'APPROVED',
                        academicYear: group.candidates[0].academicYear,
                        semester: semester,
                        courseId: { $in: candidateCourseIds }
                    }).populate({ path: 'courseId', model: Course }).lean()

                    if (existingApproved.length > 0) {
                        const duplicateCodes = existingApproved.map(e => e.courseId?.courseCode).join(', ')
                        return NextResponse.json({
                            error: `Validation Failed: ${studentName} already has an approved record for ${semester} Semester: ${duplicateCodes}.`
                        }, { status: 400 })
                    }

                    const currentApproved = await Enrollment.find({
                        studentId: sid,
                        status: 'APPROVED',
                        academicYear: group.candidates[0].academicYear,
                        semester: semester
                    }).populate({ path: 'courseId', model: Course }).lean()

                    const currentApprovedCredits = currentApproved.reduce((sum, e) => sum + (e.courseId?.creditUnits || 0), 0)

                    if (currentApprovedCredits + candidateCreditsForSemester > dynamicMaxCredits) {
                        return NextResponse.json({
                            error: `Validation Failed: Approving these courses would put ${studentName} at ${currentApprovedCredits + candidateCreditsForSemester} units for ${semester} Semester. The current curriculum limit for ${department} ${level}L (${semester} Semester) is ${programTotalUnits} units + 2 allowance (Total Max: ${dynamicMaxCredits}).`
                        }, { status: 400 })
                    }
                }
            }
        }

        const result = await Enrollment.updateMany(
            { _id: { $in: enrollmentIds } },
            { status: action }
        )

        if (result.modifiedCount > 0) {
            const affectedEnrollments = await Enrollment.find({ _id: { $in: enrollmentIds } })
                .populate({ path: 'studentId', model: Student })
                .lean()

            const studentNotifications: Record<string, boolean> = {}
            const notificationItems = []

            for (const enroll of affectedEnrollments) {
                const studentId = enroll.studentId?._id?.toString()
                const userId = enroll.studentId?.userId?.toString()

                if (studentId && userId && !studentNotifications[studentId]) {
                    studentNotifications[studentId] = true
                    notificationItems.push({
                        recipientId: userId,
                        title: action === 'APPROVED' ? 'Enrollment Approved' : 'Registration Declined',
                        message: action === 'APPROVED'
                            ? 'Your semester course registration has been officially approved. Check your portal for the full schedule.'
                            : 'One or more of your course registration requests were declined. Please review and re-submit.',
                        type: action === 'APPROVED' ? 'INFO' : 'URGENT',
                        isGlobal: false
                    })
                }
            }

            if (notificationItems.length > 0) {
                await Notification.insertMany(notificationItems)
            }
        }

        return NextResponse.json({ success: true, count: result.modifiedCount })
    } catch (error) {
        console.error('Batch registration error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
