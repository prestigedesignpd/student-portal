import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Book, Loan } from '@/models/Library'
import Student from '@/models/Student'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'
import mongoose from 'mongoose'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const loans = await Loan.find()
            .populate({ path: 'bookId', model: Book })
            .populate({
                path: 'studentId',
                model: Student,
                populate: { path: 'userId', model: User }
            })
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json(loans)
    } catch (error) {
        console.error('Fetch loans error:', error)
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

        const { studentId, bookId, dueDate } = await request.json()

        if (!studentId || !bookId || !dueDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const book = await Book.findById(bookId).session(session)
            if (!book || book.availableQuantity <= 0) {
                throw new Error('Book is not available for loan')
            }

            // Check if student already has this book borrowed
            const existingLoan = await Loan.findOne({
                studentId,
                bookId,
                status: { $ne: 'RETURNED' }
            }).session(session)

            if (existingLoan) {
                throw new Error('Student already has an active loan for this book')
            }

            // 1. Create Load
            const loan = await Loan.create([{
                bookId,
                studentId,
                dueDate: new Date(dueDate),
                status: 'BORROWED'
            }], { session })

            // 2. Decrement availability
            await Book.findByIdAndUpdate(bookId, {
                $inc: { availableQuantity: -1 }
            }, { session })

            await session.commitTransaction()
            return NextResponse.json(loan[0])
        } catch (txnError: any) {
            await session.abortTransaction()
            return NextResponse.json({ error: txnError.message }, { status: 400 })
        } finally {
            session.endSession()
        }
    } catch (error) {
        console.error('Issue loan error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ status: 403 })
        }

        const { id, action } = await request.json() // action: 'RETURN'

        if (action === 'RETURN') {
            const session = await mongoose.startSession()
            session.startTransaction()
            try {
                const loan = await Loan.findById(id).session(session)
                if (!loan || loan.status === 'RETURNED') {
                    throw new Error('Invalid loan or already returned')
                }

                await Loan.findByIdAndUpdate(id, {
                    status: 'RETURNED',
                    returnDate: new Date()
                }, { session })

                await Book.findByIdAndUpdate(loan.bookId, {
                    $inc: { availableQuantity: 1 }
                }, { session })

                await session.commitTransaction()
                return NextResponse.json({ message: 'Book returned successfully' })
            } catch (txnError: any) {
                await session.abortTransaction()
                return NextResponse.json({ error: txnError.message }, { status: 400 })
            } finally {
                session.endSession()
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
