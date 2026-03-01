import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Payment from '@/models/Payment'
import Student from '@/models/Student'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const user = await requireAuth()
        const { id } = await params

        const payment = await Payment.findById(id)
            .populate({
                path: 'studentId',
                model: Student,
                populate: { path: 'userId', model: User }
            })
            .lean()

        if (!payment) {
            return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
        }

        // Authorization check: Only the student who made the payment or an admin can view receipt
        if (user.role !== 'ADMIN' && payment.studentId?.userId?._id.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 403 })
        }

        if (payment.status !== 'SUCCESS') {
            return NextResponse.json({ error: 'Receipt only available for successful payments' }, { status: 400 })
        }

        // In a real app, we might generate a PDF here. 
        // For this implementation, we return structured receipt data for a professional UI view.
        const receiptData = {
            receiptNumber: `RCPT-${payment._id.toString().slice(-6).toUpperCase()}`,
            date: payment.paidAt || payment.updatedAt,
            studentName: `${payment.studentId?.userId?.firstName} ${payment.studentId?.userId?.lastName}`,
            matricNumber: payment.studentId?.matricNumber,
            amount: payment.amount,
            purpose: payment.type, // e.g., 'TUITION', 'HOSTEL'
            reference: payment.reference,
            institution: "Nexus Institutional Portal",
            status: "OFFICIALLY VERIFIED"
        }

        return NextResponse.json(receiptData)
    } catch (error) {
        console.error('Receipt generation error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
