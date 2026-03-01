import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Enrollment from '@/models/Enrollment'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        const courses = await Course.find({
            level: user.student?.level
        }).populate({ path: 'prerequisites', model: Course }).lean()

        return NextResponse.json(courses)
    } catch (error) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()
        const { courseIds } = await request.json()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        // Check for existing enrollments for these specific courses to prevent duplicates
        const existingEnrollments = await Enrollment.find({
            studentId: user.student._id,
            courseId: { $in: courseIds },
            academicYear: '2023/2024', // Use current session
            semester: 'FIRST',
            status: { $in: ['PENDING', 'APPROVED'] }
        }).populate({ path: 'courseId', model: Course }).lean()

        if (existingEnrollments.length > 0) {
            const duplicateCodes = existingEnrollments.map(e => e.courseId?.courseCode).join(', ')
            return NextResponse.json({
                error: `You already have an active or approved registration for: ${duplicateCodes}`
            }, { status: 400 })
        }

        // Verify prerequisites
        const courses = await Course.find({
            _id: { $in: courseIds }
        }).populate({ path: 'prerequisites', model: Course }).lean()

        // Check if student has completed prerequisites
        const completedEnrollments = await Enrollment.find({
            studentId: user.student._id,
            isCompleted: true
        }).lean()

        const completedCourseIds = completedEnrollments.map(e => e.courseId.toString())

        let totalCredits = 0
        for (const course of courses) {
            totalCredits += course.creditUnits

            const missingPrereqs = (course.prerequisites || [] as any[]).filter(
                (prereq: any) => !completedCourseIds.includes(prereq?._id?.toString() || '')
            )

            if (missingPrereqs.length > 0) {
                return NextResponse.json({
                    error: `Missing prerequisites for ${course.courseCode}: ${missingPrereqs.map((p: any) => p.courseCode).join(', ')
                        }`
                }, { status: 400 })
            }
        }

        if (totalCredits > 24) {
            return NextResponse.json({ error: 'Credit limit exceeded (Max 24 Units)' }, { status: 400 })
        }

        // Create enrollments with PENDING status
        const enrollmentPromises = courseIds.map((courseId: string) =>
            Enrollment.create({
                studentId: user.student._id,
                courseId,
                semester: 'FIRST',
                academicYear: '2023/2024',
                status: 'PENDING'
            })
        )

        const enrollments = await Promise.all(enrollmentPromises)

        return NextResponse.json(enrollments)
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Failed to register courses' },
            { status: 500 }
        )
    }
}
