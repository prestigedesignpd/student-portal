import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Enrollment from '@/models/Enrollment'
import { requireAuth } from '@/lib/auth'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await dbConnect()
        const user = await requireAuth()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        const { rating, comment } = await request.json()

        const enrollment = await Enrollment.findOneAndUpdate(
            { _id: id, studentId: user.student._id },
            {
                studentReview: { rating, comment }
            },
            { new: true }
        )

        if (!enrollment) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
        }

        return NextResponse.json(enrollment)
    } catch (error) {
        console.error('Review submission error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
