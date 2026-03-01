import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Notification from '@/models/Notification'
import Student from '@/models/Student'
import Course from '@/models/Course'
import { requireAuth } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { enrollmentId, midtermScore, finalScore, attendanceStatus, grade } = await request.json()

        // Calculate total and grade point (simplified)
        const totalScore = (midtermScore || 0) + (finalScore || 0)

        // Basic grading scale
        const calculatedGrade = grade || (
            totalScore >= 70 ? 'A' :
                totalScore >= 60 ? 'B' :
                    totalScore >= 50 ? 'C' :
                        totalScore >= 45 ? 'D' :
                            totalScore >= 40 ? 'E' : 'F'
        )

        const enrollment = await Enrollment.findByIdAndUpdate(enrollmentId, {
            midtermScore,
            finalScore,
            totalScore,
            attendanceStatus,
            grade: attendanceStatus === 'ABSENT' ? 'NG' : calculatedGrade,
            isCompleted: attendanceStatus !== 'ABSENT' && !['F', 'NG'].includes(calculatedGrade),
            gradeUploadedAt: new Date()
        }, { new: true }).populate({ path: 'studentId', model: Student }).populate({ path: 'courseId', model: Course })

        if (!enrollment) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
        }

        // Notify student
        await Notification.create({
            userId: enrollment.studentId.userId,
            title: 'Grade Uploaded',
            message: `Your grade for ${enrollment.courseId.courseCode} has been uploaded.`,
            type: 'INFO'
        })

        return NextResponse.json(enrollment)
    } catch (error) {
        console.error('Grade upload error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
