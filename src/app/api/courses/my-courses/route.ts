import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Course from '@/models/Course'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        // Fetch enrollments with populated course details
        const enrollments = await Enrollment.find({
            studentId: user.student._id,
        }).populate({ path: 'courseId', model: Course }).lean()

        return NextResponse.json(enrollments)
    } catch (error) {
        console.error('Fetch my courses error:', error)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }
}
