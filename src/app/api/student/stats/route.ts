import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Payment from '@/models/Payment'
import Course from '@/models/Course'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        const studentId = user.student._id

        // Fetch all relevant data for synchronization
        const [enrollments, payments] = await Promise.all([
            Enrollment.find({ studentId }).populate('courseId').lean(),
            Payment.find({ studentId }).lean()
        ])

        // 1. Calculate CGPA & Total Credits
        // Filter only completed (passed/failed) enrollments for GPA calculation
        const completedEnrollments = enrollments.filter(e => e.grade && e.grade !== 'NG')
        const totalCreditsAchieved = enrollments
            .filter(e => e.status === 'APPROVED' && e.isCompleted)
            .reduce((sum, e: any) => sum + (e.courseId?.creditUnits || 0), 0)

        // Simple GPA calculation (Nigerian Scale 5.0)
        // Note: In a production app, this would use a more complex ResultService
        const totalPoints = completedEnrollments.reduce((sum, e) => sum + (e.gradePoint * (e.courseId?.creditUnits || 0)), 0)
        const totalUnits = completedEnrollments.reduce((sum, e) => sum + (e.courseId?.creditUnits || 0), 1) // Avoid div by 0
        const calculatedGpa = totalUnits > 1 ? (totalPoints / (totalUnits - 1)) : 0

        // 2. Count Active Courses (Approved but not yet completed)
        const activeCoursesCount = enrollments.filter(e => e.status === 'APPROVED' && !e.isCompleted).length

        // 3. Pending Fees
        // Sum up all payments where status is NOT 'SUCCESS' or 'VERIFIED'
        // For the sake of this demo, we'll assume a pending balance based on FeeStructure or specific Payment documents
        const pendingAmount = payments
            .filter(p => p.status !== 'SUCCESS' && p.status !== 'VERIFIED')
            .reduce((sum, p) => sum + p.amount, 0)

        return NextResponse.json({
            cgpa: user.student.currentCgpa || calculatedGpa || 0,
            credits: totalCreditsAchieved || 0,
            activeCourses: activeCoursesCount || 0,
            pendingFees: pendingAmount || 0
        })

    } catch (error) {
        console.error('Fetch student stats error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
