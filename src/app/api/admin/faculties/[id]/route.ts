import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Faculty from '@/models/Faculty'
import { requireAuth } from '@/lib/auth'

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
        const faculty = await Faculty.findByIdAndUpdate(id, data, { new: true })

        if (!faculty) {
            return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
        }

        return NextResponse.json(faculty)
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

        const faculty = await Faculty.findByIdAndDelete(id)

        if (!faculty) {
            return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Faculty deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
