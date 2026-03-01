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

        const { updates } = await request.json()

        if (!Array.isArray(updates) || updates.length === 0) {
            return NextResponse.json({ error: 'No grade updates provided' }, { status: 400 })
        }

        const updatedEnrollments = []
        const notifications = []

        for (const update of updates) {
            const { enrollmentId, midtermScore, finalScore, attendanceStatus, grade } = update

            // Calculate total and grade point
            const totalScore = (midtermScore || 0) + (finalScore || 0)

            const getCalculatedGrade = (score: number) => {
                if (attendanceStatus === 'ABSENT') return 'NG'
                if (score >= 70) return 'A'
                if (score >= 60) return 'B'
                if (score >= 50) return 'C'
                if (score >= 45) return 'D'
                if (score >= 40) return 'E'
                return 'F'
            }

            const calculatedGrade = getCalculatedGrade(totalScore)

            const getGradePoint = (g: string) => {
                switch (g) {
                    case 'A': return 5
                    case 'B': return 4
                    case 'C': return 3
                    case 'D': return 2
                    case 'E': return 1
                    default: return 0
                }
            }

            const enrollment = await Enrollment.findByIdAndUpdate(enrollmentId, {
                midtermScore,
                finalScore,
                totalScore,
                attendanceStatus,
                grade: calculatedGrade,
                gradePoint: getGradePoint(calculatedGrade),
                isCompleted: !['F', 'NG'].includes(calculatedGrade),
                gradeUploadedAt: new Date()
            }, { new: true })
                .populate({ path: 'studentId', model: Student })
                .populate({ path: 'courseId', model: Course })

            if (enrollment) {
                updatedEnrollments.push(enrollment)
                notifications.push({
                    userId: enrollment.studentId?.userId,
                    title: 'Grade Uploaded',
                    message: `Official grade for ${enrollment.courseId?.courseCode} has been released.`,
                    type: 'INFO',
                    isGlobal: false
                })
            }
        }

        if (notifications.length > 0) {
            await Notification.insertMany(notifications)
        }

        return NextResponse.json({
            message: `Successfully updated ${updatedEnrollments.length} records.`,
            updated: updatedEnrollments.length
        })
    } catch (error) {
        console.error('Batch grade upload error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
