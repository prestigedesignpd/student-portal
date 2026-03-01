import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Student from '@/models/Student'
import User from '@/models/User'
import { Hostel, Room } from '@/models/Hostel'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const students = await Student.find({}).populate({ path: 'userId', model: User }).sort({ matricNumber: 1 }).lean()

        // Transform for frontend expectation: { ...user, studentDetails: student }
        const transformedStudents = students.map((s: any) => {
            const user = s.userId || {}
            return {
                _id: s._id,
                userId: user,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                studentDetails: {
                    ...s,
                    userId: user._id
                }
            }
        })

        return NextResponse.json(transformedStudents)
    } catch (error: any) {
        console.error('Students GET error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
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
        const { matricNumber, department, level, email, firstName, lastName, password } = data

        if (!matricNumber || !department || !level || !email || !firstName || !lastName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Create User
        const newUser = await User.create({
            email,
            username: matricNumber,
            password: password || 'student123', // Default password
            firstName,
            lastName,
            role: 'STUDENT'
        })

        // 2. Create Student
        const newStudent = await Student.create({
            userId: newUser._id,
            matricNumber,
            department,
            level: Number(level)
        })

        return NextResponse.json({ student: newStudent, user: newUser })
    } catch (error: any) {
        console.error('Students POST error:', error)
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Student with this email or matric number already exists' }, { status: 400 })
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
