import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Hostel, Room } from '@/models/Hostel'
import { requireAuth } from '@/lib/auth'
import mongoose from 'mongoose'
import Student from '@/models/Student'

export async function POST(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        const { hostelId } = await request.json()

        if (!hostelId) {
            return NextResponse.json({ error: 'Hostel ID is required' }, { status: 400 })
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            // Check if student already has a room
            const existingRoom = await Room.findOne({ occupants: user.student._id }).session(session)
            if (existingRoom) {
                throw new Error('You already have an active room allocation.')
            }

            const hostel = await Hostel.findById(hostelId).session(session)
            if (!hostel) {
                throw new Error('Hostel not found.')
            }

            // Find an available room in this hostel (where occupants < capacity)
            // Using aggregation to find a valid room
            const availableRooms = await Room.aggregate([
                { $match: { hostelId: new mongoose.Types.ObjectId(hostelId) } },
                {
                    $addFields: {
                        occupantCount: { $size: { $ifNull: ["$occupants", []] } }
                    }
                },
                {
                    $match: {
                        $expr: { $lt: ["$occupantCount", "$capacity"] }
                    }
                },
                { $limit: 1 }
            ]).session(session)

            if (!availableRooms || availableRooms.length === 0) {
                throw new Error('No available slots in this hostel.')
            }

            const roomToBook = availableRooms[0]

            // 1. Update the room by pushing the student ID
            await Room.findByIdAndUpdate(
                roomToBook._id,
                { $push: { occupants: user.student._id } },
                { session, new: true }
            )

            // 2. Update the student profile with hostel and room IDs
            await Student.findByIdAndUpdate(
                user.student._id,
                {
                    hostelId: hostel._id,
                    roomId: roomToBook._id
                },
                { session }
            )

            await session.commitTransaction()
            return NextResponse.json({
                message: 'Room successfully booked',
                roomNumber: roomToBook.roomNumber,
                hostelName: hostel.name
            })
        } catch (txnError: any) {
            await session.abortTransaction()
            throw txnError
        } finally {
            session.endSession()
        }

    } catch (error: any) {
        console.error('Booking error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to process booking' },
            { status: 400 }
        )
    }
}
