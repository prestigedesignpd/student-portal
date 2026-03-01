import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Hostel, Room } from '@/models/Hostel'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        await requireAuth()

        const hostels = await Hostel.find().lean()

        // Fetch rooms to aggregate availability
        const rooms = await Room.find().lean()

        const hostelsWithCapacity = hostels.map(hostel => {
            const hostelRooms = rooms.filter(r => r.hostelId.toString() === hostel._id.toString())

            let totalCapacity = 0
            let currentOccupants = 0

            hostelRooms.forEach(room => {
                totalCapacity += room.capacity
                currentOccupants += room.occupants.length
            })

            const availableSlots = totalCapacity - currentOccupants

            // Map the base prices based on the hostel name for this demo
            const price = hostel.name === 'Emerald Hall' ? 65000 :
                hostel.name === 'Legacy Hall' ? 50000 : 45000

            return {
                ...hostel,
                price,
                availableSlots,
                totalCapacity,
                status: availableSlots > 0 ? 'Available' : 'Full'
            }
        })

        return NextResponse.json(hostelsWithCapacity)
    } catch (error) {
        console.error('Fetch hostels error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch accommodation data' },
            { status: 500 }
        )
    }
}
