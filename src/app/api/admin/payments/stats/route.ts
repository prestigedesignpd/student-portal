import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Payment from '@/models/Payment'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Calculate total successful collections
        const successfulPayments = await Payment.find({ status: 'SUCCESS' })
        const totalCollected = successfulPayments.reduce((acc, p) => acc + p.amount, 0)

        // Count pending verifications
        const pendingCount = await Payment.countDocuments({ status: 'PENDING' })

        // Calculate growth (Comparing this month vs last month)
        const now = new Date()
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

        const thisMonthTotal = (await Payment.find({
            status: 'SUCCESS',
            createdAt: { $gte: startOfThisMonth }
        })).reduce((acc, p) => acc + p.amount, 0)

        const lastMonthTotal = (await Payment.find({
            status: 'SUCCESS',
            createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
        })).reduce((acc, p) => acc + p.amount, 0)

        let growth = '+0%'
        if (lastMonthTotal > 0) {
            growth = `+${((thisMonthTotal / lastMonthTotal) * 100).toFixed(1)}%`
        } else if (thisMonthTotal > 0) {
            growth = '+100%'
        }

        return NextResponse.json({
            totalCollected,
            pendingCount,
            growth
        })
    } catch (error) {
        console.error('Stats calculation error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
