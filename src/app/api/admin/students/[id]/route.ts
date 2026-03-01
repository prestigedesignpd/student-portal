import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Student from '@/models/Student'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'
import Enrollment from '@/models/Enrollment'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        let student = await Student.findById(id)
            .populate('userId', 'firstName lastName email')
            .lean()

        // Fallback: Check if the ID provided is actually the User ID
        if (!student) {
            student = await Student.findOne({ userId: id })
                .populate('userId', 'firstName lastName email')
                .lean()
        }

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        const registrations = await Enrollment.find({ studentId: student._id }).lean()

        // Transform for frontend expectation: { ...user, studentDetails: student, registrations }
        const userDoc = student.userId || {}
        const responseData = {
            _id: student._id,
            userId: userDoc,
            firstName: userDoc.firstName,
            lastName: userDoc.lastName,
            email: userDoc.email,
            studentDetails: {
                ...student,
                userId: userDoc._id
            },
            registrations
        }

        return NextResponse.json(responseData)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const data = await request.json()
        const student = await Student.findById(id)

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        // Update Student
        const updatedStudent = await Student.findByIdAndUpdate(id, data, { new: true })

        // Update associated User if name or email changed
        if (data.email || data.firstName || data.lastName) {
            await User.findByIdAndUpdate(student.userId, {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName
            })
        }

        return NextResponse.json(updatedStudent)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const student = await Student.findById(id)
        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        // Delete Student and User
        await Promise.all([
            Student.findByIdAndDelete(id),
            User.findByIdAndDelete(student.userId)
        ])

        return NextResponse.json({ message: 'Student and account deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
