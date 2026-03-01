import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Fee from '@/models/Fee';
import { requireAuth } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const user = await requireAuth();

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const fees = await Fee.find({}).sort({ createdAt: -1 });
        return NextResponse.json(fees);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const user = await requireAuth();

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const data = await req.json();
        const fee = await Fee.findOneAndUpdate(
            { type: data.type },
            { ...data },
            { new: true, upsert: true }
        );

        return NextResponse.json(fee);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update fee' }, { status: 500 });
    }
}
