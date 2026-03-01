import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        // Fetch ALL courses for the student's department across all levels
        const curriculum = await Course.find({
            department: user.student.department
        }).sort({ level: 1, semester: 1 }).lean()

        return NextResponse.json(curriculum)
    } catch (error) {
        console.error('Fetch curriculum error:', error)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }
}
