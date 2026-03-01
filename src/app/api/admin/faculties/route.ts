import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Faculty from '@/models/Faculty'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const faculties = await Faculty.find({}).sort({ name: 1 }).lean()
        return NextResponse.json(faculties)
    } catch (error: any) {
        console.error('Faculties GET error:', error)
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

        const { name, code } = await request.json()

        if (!name || !code) {
            return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 })
        }

        const faculty = await Faculty.create({ name, code })
        return NextResponse.json(faculty)
    } catch (error: any) {
        console.error('Faculties POST error:', error)
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Faculty with this name or code already exists' }, { status: 400 })
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
