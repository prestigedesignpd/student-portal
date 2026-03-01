import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import Notification from '@/models/Notification'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        const notifications = await Notification.find({
            $or: [
                { recipientId: user._id },
                {
                    isGlobal: true,
                    $and: [
                        { $or: [{ targetDepartment: { $exists: false } }, { targetDepartment: null }, { targetDepartment: user.student?.department }] },
                        { $or: [{ targetLevel: { $exists: false } }, { targetLevel: null }, { targetLevel: user.student?.level }] }
                    ]
                }
            ]
        }).sort({ createdAt: -1 }).limit(30)
        return NextResponse.json(notifications)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
