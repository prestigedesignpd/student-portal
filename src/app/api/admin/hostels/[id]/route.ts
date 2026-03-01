import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Hostel } from '@/models/Hostel'
import { requireAuth } from '@/lib/auth'

export async function GET(
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

        const hostel = await Hostel.findById(id).lean()

        if (!hostel) {
            return NextResponse.json({ error: 'Hostel not found' }, { status: 404 })
        }

        return NextResponse.json(hostel)
    } catch (error) {
        console.error('Fetch individual hostel error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
