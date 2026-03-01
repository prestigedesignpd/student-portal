import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import CalendarEvent from '@/models/CalendarEvent'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        const events = await CalendarEvent.find({}).sort({ date: 1 })
        return NextResponse.json(events)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
