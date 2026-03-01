import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import Notification from '@/models/Notification'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const notifications = await Notification.find({}).sort({ createdAt: -1 })
        return NextResponse.json(notifications)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { title, message, type, isGlobal, targetDepartment, targetLevel } = await req.json()

        const notification = await Notification.create({
            title,
            message,
            type,
            isGlobal,
            targetDepartment,
            targetLevel
        })

        return NextResponse.json(notification)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
