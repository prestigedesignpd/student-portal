import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { requireAuth } from '@/lib/auth'
import { SettingsService } from '@/services/settingsService'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        // Allow any authenticated user to view the settings (needed by student dashboard)
        const info = await SettingsService.getCurrentAcademicInfo()
        const regStatus = await SettingsService.getSetting('registration_status', { isOpen: true })

        return NextResponse.json({
            academic_info: info,
            registration_status: regStatus
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { key, value } = await request.json()
        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 })
        }

        await SettingsService.setSetting(key, value)
        return NextResponse.json({ message: 'Setting updated successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
