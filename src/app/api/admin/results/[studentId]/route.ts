import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import Student from '@/models/Student'
import Course from '@/models/Course'
import { requireAuth } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const { studentId } = await params
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const enrollments = await Enrollment.find({ studentId: studentId })
            .populate({ path: 'courseId', model: Course })
            .lean()

        // Group by Semester
        const grouped = enrollments.reduce((acc: any, curr: any) => {
            const year = curr.academicYear || 'Unknown'
            const semester = curr.semester || 'FIRST'

            if (!acc[year]) acc[year] = {}
            if (!acc[year][semester]) acc[year][semester] = []

            acc[year][semester].push(curr)
            return acc
        }, {})

        return NextResponse.json(grouped)
    } catch (error) {
        console.error('Admin results fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
