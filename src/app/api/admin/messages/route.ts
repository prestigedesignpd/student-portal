import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Message from '@/models/Message'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Aggregate unique threads
        const messages = await Message.find({
            $or: [
                { isAdminSupport: true },
                { receiver: user._id }
            ]
        })
            .populate({ path: 'sender', model: User, select: 'firstName lastName email avatar role' })
            .populate({ path: 'receiver', model: User, select: 'firstName lastName email avatar role' })
            .sort({ createdAt: -1 })
            .lean()

        // Simple grouping by threadId in memory for the demo
        const threadsMap = new Map()
        messages.forEach((msg: any) => {
            if (!threadsMap.has(msg.threadId)) {
                threadsMap.set(msg.threadId, {
                    threadId: msg.threadId,
                    lastMessage: msg,
                    messages: [],
                    student: msg.sender.role === 'STUDENT' ? msg.sender : (msg.receiver?.role === 'STUDENT' ? msg.receiver : null),
                    unreadCount: msg.isRead ? 0 : 1,
                    subject: msg.subject
                })
            }
            threadsMap.get(msg.threadId).messages.push(msg)
            if (!msg.isRead && msg.receiver?.toString() === user._id.toString()) {
                threadsMap.get(msg.threadId).unreadCount++
            }
        })

        return NextResponse.json(Array.from(threadsMap.values()))
    } catch (error) {
        console.error('Admin Fetch threads error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
