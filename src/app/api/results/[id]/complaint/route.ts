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

        const { message } = await request.json()

        const enrollment = await Enrollment.findOne({
            _id: id,
            studentId: user.student._id
        })

        if (!enrollment) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
        }

        // Check 20-day limit
        if (enrollment.gradeUploadedAt) {
            const uploadDate = new Date(enrollment.gradeUploadedAt)
            const now = new Date()
            const diffInDays = (now.getTime() - uploadDate.getTime()) / (1000 * 3600 * 24)

            if (diffInDays > 20) {
                return NextResponse.json({
                    error: 'Complaint window closed (20 days passed since grade upload)'
                }, { status: 400 })
            }
        }

        enrollment.complaint = {
            message,
            status: 'PENDING',
            createdAt: new Date()
        }

        await enrollment.save()

        return NextResponse.json(enrollment)
    } catch (error) {
        console.error('Complaint submission error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
