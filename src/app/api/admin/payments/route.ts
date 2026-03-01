import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Payment from '@/models/Payment'
import Student from '@/models/Student'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const studentId = searchParams.get('studentId')

        const query: any = {}
        if (studentId) query.studentId = studentId

        const payments = await Payment.find(query)
            .populate({
                path: 'studentId',
                model: Student,
                populate: { path: 'userId', model: User }
            })
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json(payments)
    } catch (error) {
        console.error('Payment fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
