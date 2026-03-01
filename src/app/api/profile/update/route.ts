import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import User from '@/models/User'

export async function PUT(request: Request) {
    try {
        await dbConnect()
        const authUser = await requireAuth()

        const body = await request.json()
        const { phone, address, avatar } = body

        // Only allow updating specific, non-critical fields for now
        const updateData: any = {}
        if (phone !== undefined) updateData.phone = phone
        if (address !== undefined) updateData.address = address
        if (avatar !== undefined) {
            updateData.avatar = avatar
            console.log(`[DEBUG] Profile PUT: Avatar length ${avatar.length}`)
        }

        let updatedUser;
        try {
            updatedUser = await User.findByIdAndUpdate(
                authUser._id,
                { $set: updateData },
                { returnDocument: 'after', runValidators: true }
            ).select('-password').lean()

            console.log(`[DEBUG] Profile PUT Success: Updated user ${authUser._id}, Avatar length: ${updatedUser?.avatar?.length || 0}`)
        } catch (dbError: any) {
            console.error('[DATABASE ERROR] Failed to update user profile:', dbError.message)
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser })
    } catch (error) {
        console.error('Update profile error:', error)
        return NextResponse.json(
            { error: 'Failed to update profile data' },
            { status: 500 }
        )
    }
}
