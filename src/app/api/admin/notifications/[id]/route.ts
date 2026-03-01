import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import Notification from '@/models/Notification'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const user = await requireAuth()
        const { id } = await params

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const updateData = await request.json()
        const notification = await Notification.findByIdAndUpdate(id, updateData, { new: true })

        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
        }

        return NextResponse.json(notification)
    } catch (error) {
        console.error('Update notification error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect()
        const user = await requireAuth()
        const { id } = await params

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const notification = await Notification.findByIdAndDelete(id)

        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Notification deleted successfully' })
    } catch (error) {
        console.error('Delete notification error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
