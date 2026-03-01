import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Message from '@/models/Message'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        let messages;
        if (user.role === 'ADMIN') {
            // Admin sees all messages sent to support or directed to them
            messages = await Message.find({
                $or: [
                    { isAdminSupport: true },
                    { receiver: user._id }
                ]
            })
                .populate({ path: 'sender', model: User, select: 'firstName lastName email role' })
                .sort({ createdAt: -1 })
                .lean()
        } else {
            // Student sees messages they sent OR messages directed to them from admin
            // EXCLUDE internal admin notes
            messages = await Message.find({
                $or: [
                    { sender: user._id },
                    { receiver: user._id }
                ],
                isInternal: { $ne: true }
            })
                .populate({ path: 'sender', model: User, select: 'firstName lastName role' })
                .populate({ path: 'receiver', model: User, select: 'firstName lastName role' })
                .sort({ createdAt: -1 })
                .lean()
        }

        return NextResponse.json(messages)
    } catch (error) {
        console.error('Fetch messages error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        const { content, subject, receiverId, isAdminSupport, threadId, isInternal } = await request.json()

        if (!content) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
        }

        // Generate a threadId for new conversations if none provided
        const finalThreadId = threadId || `THREAD-${Math.random().toString(36).substring(2, 11).toUpperCase()}`

        const messageData: any = {
            sender: user._id,
            content,
            subject: subject || 'No Subject',
            isAdminSupport: isAdminSupport || false,
            threadId: finalThreadId,
            isInternal: isInternal || false
        }

        if (receiverId) {
            messageData.receiver = receiverId
        }

        const message = await Message.create(messageData)

        return NextResponse.json(message)
    } catch (error) {
        console.error('Send message error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
