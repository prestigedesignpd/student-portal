import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (!user || user.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const data = await request.json()
        const { currentPassword, newPassword } = data

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const dbUser = await User.findById(user._id)
        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if current password matches (using the model's comparePassword method)
        const isMatch = await dbUser.comparePassword(currentPassword)
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 })
        }

        // Update password (the pre-save hook in the User model will hash it)
        dbUser.password = newPassword
        await dbUser.save()

        return NextResponse.json({ message: 'Password updated successfully' })
    } catch (error) {
        console.error('Password change error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
