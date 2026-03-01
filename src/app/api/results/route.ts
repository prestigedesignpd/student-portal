import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { ResultService } from '@/services/resultService'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        const { searchParams } = new URL(request.url)
        const isLatest = searchParams.get('latest') === 'true'

        if (isLatest) {
            const results = await ResultService.getLatestResults(user.student._id.toString())
            return NextResponse.json(results)
        }

        const results = await ResultService.getStudentResults(user.student._id.toString())
        return NextResponse.json(results)
    } catch (error) {
        console.error('Fetch results error:', error)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }
}
