import { NextRequest } from 'next/server';

/**
 * Extracts the JWT token from the Authorization header or cookies of a NextRequest.
 * 
 * @param req The incoming NextRequest object.
 * @returns The token string if found, otherwise null.
 */
export async function extractToken(req: NextRequest): Promise<string | null> {
    // 1. Try to get token from Authorization header (Bearer token)
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    // 2. Try to get token from cookies
    const cookieToken = req.cookies.get('token')?.value;
    if (cookieToken) {
        return cookieToken;
    }

    return null;
}
