import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import Fee from '@/models/Fee'

// In a real app, this would be fetched from a database collection like 'FeeStructure'
// managed by admins, but we'll use a constant map for this implementation.
export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        let fees = await Fee.find({ isActive: true })

        // If no fees in DB, seed defaults (for first-time setup)
        if (fees.length === 0) {
            const defaults = [
                { type: 'TUITION', title: 'Tuition Fee (Per Session)', baseAmount: 250000, description: 'Mandatory academic instruction fee.' },
                { type: 'ACCOMMODATION', title: 'Hostel Maintenance', baseAmount: 65000, description: 'Annual residential infrastructure levy.' },
                { type: 'LIBRARY', title: 'Library Access Dues', baseAmount: 15000, description: 'Access to physical and digital library resources.' },
                { type: 'TRANSCRIPT', title: 'Official Transcript Fee', baseAmount: 10000, description: 'Processing and generation of official result history.' },
                { type: 'GRADUATION', title: 'Graduation & Clearance', baseAmount: 45000, description: 'Final clearance, gown, and certificate processing.' },
                { type: 'SPORTS', title: 'Sports & Recreation Dues', baseAmount: 5000, description: 'Maintenance of university sporting facilities.' },
            ]
            await Fee.insertMany(defaults)
            fees = await Fee.find({ isActive: true })
        }

        const isFinalYear = user.student.level === 400 || user.student.level === 500

        const availableFees = fees.map(fee => ({
            id: fee.type,
            title: fee.title,
            amount: fee.baseAmount,
            description: fee.description,
            isRecommended: fee.type === 'TUITION' || (isFinalYear && fee.type === 'GRADUATION')
        }))

        return NextResponse.json(availableFees)
    } catch (error) {
        console.error('Fetch fee structure error:', error)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }
}
