import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Book, Loan } from '@/models/Library'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        const loans = await Loan.find({ studentId: user.student._id })
            .populate({ path: 'bookId', model: Book })
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json(loans)
    } catch (error) {
        console.error('Fetch my loans error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
