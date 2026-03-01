import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Student from '@/models/Student'
import Course from '@/models/Course'
import Department from '@/models/Department'
import Faculty from '@/models/Faculty'
import Payment from '@/models/Payment'
import { Hostel, Room } from '@/models/Hostel'
import Enrollment from '@/models/Enrollment'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const [studentCount, courseCount, deptCount, facultyCount, successfulPayments, allRooms, pendingRegCount] = await Promise.all([
            Student.countDocuments(),
            Course.countDocuments(),
            Department.countDocuments(),
            Faculty.countDocuments(),
            Payment.find({ status: 'SUCCESS' }),
            Room.find({}),
            Enrollment.countDocuments({ status: 'PENDING' })
        ])

        const totalCollected = successfulPayments.reduce((acc, p) => acc + p.amount, 0)

        const totalCapacity = allRooms.reduce((acc, r) => acc + r.capacity, 0)
        const totalOccupied = allRooms.reduce((acc, r) => acc + (r.occupants?.length || 0), 0)
        const hostelRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0

        return NextResponse.json({
            students: studentCount,
            courses: courseCount,
            departments: deptCount,
            faculties: facultyCount,
            collections: totalCollected,
            hostelRate: `${hostelRate}%`,
            pendingRegistrations: pendingRegCount
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
