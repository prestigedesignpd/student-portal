import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Department from '@/models/Department'
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
        const department = await Department.findByIdAndUpdate(id, data, { new: true })

        if (!department) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 })
        }

        return NextResponse.json(department)
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

        const department = await Department.findByIdAndDelete(id)

        if (!department) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Department deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
