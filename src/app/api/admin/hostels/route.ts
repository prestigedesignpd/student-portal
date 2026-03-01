import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Hostel, Room } from '@/models/Hostel'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const hostels = await Hostel.find().lean()
        const rooms = await Room.find().lean()

        const hostelsWithStats = hostels.map(hostel => {
            const hostelRooms = rooms.filter(r => r.hostelId.toString() === hostel._id.toString())
            let totalCapacity = 0
            let occupied = 0

            hostelRooms.forEach(room => {
                totalCapacity += room.capacity
                occupied += room.occupants.length
            })

            return {
                ...hostel,
                occupied,
                capacity: totalCapacity,
                status: totalCapacity > occupied ? 'AVAILABLE' : 'FULL'
            }
        })

        return NextResponse.json(hostelsWithStats)
    } catch (error) {
        console.error('Fetch admin hostels error:', error)
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
        const { name, location, totalRooms, type, price } = data

        if (!name || !location || !totalRooms || !type || !price) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        const hostel = await Hostel.create({ name, location, totalRooms, type, price })
        return NextResponse.json(hostel)
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Hostel with this name already exists' }, { status: 400 })
        }
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

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        const data = await request.json()
        const hostel = await Hostel.findByIdAndUpdate(id, data, { new: true })

        return NextResponse.json(hostel)
    } catch (error) {
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
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        // Check if there are rooms associated with this hostel
        const roomsCount = await Room.countDocuments({ hostelId: id })
        if (roomsCount > 0) {
            return NextResponse.json({ error: 'Cannot delete hostel with active rooms' }, { status: 400 })
        }

        await Hostel.findByIdAndDelete(id)
        return NextResponse.json({ message: 'Hostel deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
