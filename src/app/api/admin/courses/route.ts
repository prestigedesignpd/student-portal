import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Course from '@/models/Course'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const courses = await Course.find({}).sort({ courseCode: 1 }).lean()

        // Enhance courses with enrollment data
        const enhancedCourses = await Promise.all(courses.map(async (course: any) => {
            const enrollmentCount = await Enrollment.countDocuments({
                courseId: course._id,
                status: 'APPROVED'
            })
            return {
                ...course,
                enrolled: enrollmentCount
            }
        }))

        return NextResponse.json(enhancedCourses)
    } catch (error: any) {
        console.error('Courses GET error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const data = await request.json()
        const { courseCode, courseTitle, creditUnits, level, semester, department } = data

        if (!courseCode || !courseTitle || !creditUnits || !level || !semester || !department) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        const course = await Course.create(data)
        return NextResponse.json(course)
    } catch (error: any) {
        console.error('Courses POST error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
