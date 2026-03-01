import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Department from '@/models/Department'
import Faculty from '@/models/Faculty'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const departments = await Department.find({}).populate({ path: 'facultyId', model: Faculty }).sort({ name: 1 }).lean()
        return NextResponse.json(departments)
    } catch (error: any) {
        console.error('Departments GET error:', error)
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

        const { name, code, facultyId } = await request.json()

        if (!name || !code || !facultyId) {
            return NextResponse.json({ error: 'Name, Code, and Faculty are required' }, { status: 400 })
        }

        const department = await Department.create({ name, code, facultyId })
        return NextResponse.json(department)
    } catch (error: any) {
        console.error('Departments POST error:', error)
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Department with this name or code already exists' }, { status: 400 })
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
