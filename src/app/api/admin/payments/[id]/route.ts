import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Payment from '@/models/Payment'
import { requireAuth } from '@/lib/auth'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { status } = await request.json()

        if (!['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const updatedPayment = await Payment.findByIdAndUpdate(
            id,
            { status, paidAt: status === 'SUCCESS' ? new Date() : undefined },
            { new: true }
        )

        return NextResponse.json(updatedPayment)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
