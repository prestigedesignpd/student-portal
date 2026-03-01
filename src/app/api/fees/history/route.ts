import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Payment from '@/models/Payment'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        // Search params for pagination/filtering could be added here
        const payments = await Payment.find({
            studentId: user.student._id
        }).sort({ createdAt: -1 }).lean()

        return NextResponse.json(payments)
    } catch (error) {
        console.error('Fetch payment history error:', error)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }
}
