import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Student from '@/models/Student'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
    console.log('--- LOGIN API START ---');
    try {
        let body;
        try {
            body = await request.json();
            console.log('Request body parsed');
        } catch (e: any) {
            console.error('Failed to parse request body:', e.message);
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const { username, password } = body;
        console.log('Login attempt for:', username);

        try {
            await dbConnect();
            console.log('DB Connection successful');
        } catch (e: any) {
            console.error('DB Connection failed:', e.message);
            throw new Error('Database connection failed: ' + e.message);
        }

        const user = await User.findOne({ username }).lean() as any;
        console.log('User search finished. Found:', !!user);

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        console.log('Comparing passwords...');
        let isValid = false;
        try {
            isValid = await comparePassword(password, user.password);
            console.log('Password comparison finished:', isValid);
        } catch (e: any) {
            console.error('Compare password threw:', e.message);
            throw new Error('Password verification error: ' + e.message);
        }

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        console.log('Generating token...');
        const token = generateToken(user._id.toString());

        console.log('Attempting to set cookies...');
        try {
            const cookieStore = await cookies();
            cookieStore.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
            console.log('Cookies set success');
        } catch (e: any) {
            console.error('Cookie setting failed:', e.message);
            // We can still proceed if cookies fail
        }

        const student = await Student.findOne({ userId: user._id }).lean();
        const { password: _, ...userWithoutPassword } = user;

        console.log('Login logic complete, returning success');
        return NextResponse.json({
            success: true,
            user: { ...userWithoutPassword, student },
            token
        });

    } catch (error: any) {
        console.error('CRITICAL LOGIN ERROR:', error.message || error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message || String(error) },
            { status: 500 }
        );
    }
}
