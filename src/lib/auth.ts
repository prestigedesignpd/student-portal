import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from './mongodb'
import User from '@/models/User'
import Student from '@/models/Student'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch {
        return null
    }
}

export async function getSession() {
    await dbConnect()
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const user = await User.findById(payload.userId).lean()
    if (!user) return null

    const student = await Student.findOne({ userId: user._id }).lean()

    return { ...user, student }
}

export async function requireAuth() {
    const user = await getSession()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}
