import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import User from '@/models/User'
import Student from '@/models/Student'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        await dbConnect()
        const authUser = await requireAuth()

        // Fetch complete user data
        const user = await User.findById(authUser._id)
            .select('email username firstName lastName phone address avatar role isActive createdAt updatedAt')
            .lean()
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        console.log(`[DEBUG] Profile GET for ${user.email}: Avatar exists? ${!!user.avatar}`)

        // Fetch linked student data
        let studentData = null
        if (user.role === 'STUDENT') {
            studentData = await Student.findOne({ userId: user._id }).lean()
        }

        // Combine data
        const profileData = {
            ...user,
            studentDetails: studentData
        }

        return NextResponse.json(profileData)
    } catch (error) {
        console.error('Fetch profile error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch profile data' },
            { status: 500 }
        )
    }
}
