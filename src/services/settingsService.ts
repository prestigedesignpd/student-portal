import dbConnect from '@/lib/mongodb'
import SystemSetting from '@/models/SystemSetting'

export class SettingsService {
    static async getSetting(key: string, defaultValue: any = null) {
        await dbConnect()
        const setting = await SystemSetting.findOne({ key }).lean()
        return setting ? setting.value : defaultValue
    }

    static async setSetting(key: string, value: any) {
        await dbConnect()
        return await SystemSetting.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        )
    }

    static async getCurrentAcademicInfo() {
        return await this.getSetting('academic_info', {
            session: '2023/2024',
            semester: 'FIRST'
        })
    }
}
