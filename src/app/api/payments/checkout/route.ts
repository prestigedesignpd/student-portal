import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Payment from '@/models/Payment'
import Message from '@/models/Message'
import Notification from '@/models/Notification'
import { requireAuth } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        const { feeType, amount, paymentMethod } = await request.json()

        if (!feeType || !amount || !paymentMethod) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        // Generate a mock payment reference
        const reference = `REF-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString().slice(-4)}`
        const transactionId = `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`

        // Create the payment record
        const payment = await Payment.create({
            reference,
            studentId: user.student._id,
            amount: Number(amount),
            feeType,
            status: 'SUCCESS', // Mock successful payment
            paymentMethod,
            transactionId,
            paidAt: new Date()
        })

        // Notify student of successful payment
        await Notification.create({
            userId: user._id,
            title: 'Payment Successful',
            message: `Your payment of ₦${Number(amount).toLocaleString()} for ${feeType} was successful. (Ref: ${reference})`,
            type: 'FINANCIAL'
        })

        // Also send a Message (Inbox) confirmation
        await Message.create({
            sender: user._id, // System or current user context for simplicity
            receiver: user._id,
            isAdminSupport: false,
            subject: `Official Payment Confirmation: ${feeType}`,
            content: `Hello ${user.firstName},\n\nThis is an automated confirmation of your payment for ${feeType} Fee.\n\nTransaction Amount: ₦${Number(amount).toLocaleString()}\nTransaction Reference: ${reference}\nTransaction ID: ${transactionId}\nDate: ${new Date().toLocaleString()}\n\nYou can access your official printable receipt in the Payments history section.\n\nThank you,\nNexus University Finance Dept.`,
            threadId: `PAYMENT-${reference}`,
            isRead: false
        })

        return NextResponse.json(payment)
    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
