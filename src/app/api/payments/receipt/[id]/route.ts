import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payment from '@/models/Payment';
import { requireAuth } from '@/lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const user = await requireAuth();
        const { id } = await params;

        const payment = await Payment.findById(id)
            .populate({
                path: 'studentId',
                populate: { path: 'userId' }
            });

        if (!payment) {
            return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
        }

        // Security: Only allow the student who paid or an admin to see the receipt
        if (user.role !== 'ADMIN' && payment.studentId.userId._id.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json(payment);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch receipt data' }, { status: 500 });
    }
}
