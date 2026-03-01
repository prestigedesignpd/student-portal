import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Room, Hostel } from '@/models/Hostel'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const hostelId = searchParams.get('hostelId')

        if (!hostelId) {
            return NextResponse.json({ error: 'Hostel ID is required' }, { status: 400 })
        }

        const rooms = await Room.find({ hostelId }).populate('occupants').lean()
        return NextResponse.json(rooms)
    } catch (error) {
        console.error('Fetch rooms error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const data = await request.json()
        const { hostelId, roomNumber, capacity, type } = data

        if (!hostelId || !roomNumber || !capacity || !type) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        const room = await Room.create({
            hostelId,
            roomNumber,
            capacity,
            type,
            occupants: [],
            isAvailable: true
        })

        return NextResponse.json(room)
    } catch (error) {
        console.error('Create room error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const data = await request.json()
        const { id, ...updateData } = data

        if (!id) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
        }

        const room = await Room.findByIdAndUpdate(id, updateData, { new: true })

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 })
        }

        return NextResponse.json(room)
    } catch (error) {
        console.error('Update room error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        const room = await Room.findById(id)
        if (room && room.occupants.length > 0) {
            return NextResponse.json({ error: 'Cannot delete room with active occupants' }, { status: 400 })
        }

        await Room.findByIdAndDelete(id)
        return NextResponse.json({ message: 'Room deleted' })
    } catch (error) {
        console.error('Delete room error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
