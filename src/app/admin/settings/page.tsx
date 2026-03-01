'use client'

import { useState, useEffect } from 'react'
import { FiSettings, FiSave, FiLock, FiUnlock, FiCalendar, FiBookOpen, FiActivity, FiRefreshCw } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        academic_info: { session: '2023/2024', semester: 'FIRST' },
        registration_status: { isOpen: true }
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/admin/settings')
            setSettings(response.data)
        } catch (error) {
            toast.error('Failed to load system settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (key: string, value: any) => {
        setSaving(true)
        try {
            await axios.post('/api/admin/settings', { key, value })
            toast.success('Configuration updated successfully')
            fetchSettings()
        } catch (error) {
            toast.error('Failed to update configuration')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-24 md:pb-12 relative z-10">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></span>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Platform Governance</p>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-4">System <span className="text-gray-400 font-medium italic">Settings</span></h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest max-w-md">Global controls for academic periods and registration protocols.</p>
                </div>

                <div className="space-y-8">
                    {/* Academic Window Section */}
                    <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform shadow-inner">
                                    <FiCalendar size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Current Academic Window</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Define active session and semester</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-2">Academic Session</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-black text-gray-900 outline-none focus:border-indigo-300 transition-colors"
                                    value={settings.academic_info.session}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        academic_info: { ...settings.academic_info, session: e.target.value }
                                    })}
                                    placeholder="e.g. 2023/2024"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-2">Active Semester</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm font-black text-gray-900 outline-none focus:border-indigo-300 transition-colors uppercase"
                                    value={settings.academic_info.semester}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        academic_info: { ...settings.academic_info, semester: e.target.value }
                                    })}
                                >
                                    <option value="FIRST">First Semester</option>
                                    <option value="SECOND">Second Semester</option>
                                </select>
                            </div>
                        </div>

                        <button
                            disabled={saving}
                            onClick={() => handleSave('academic_info', settings.academic_info)}
                            className="w-full py-5 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-98 disabled:bg-gray-400"
                        >
                            {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave size={16} />}
                            Update Academic Window
                        </button>
                    </section>

                    {/* Registration Protocol Section */}
                    <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-[1.5rem] bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform shadow-inner">
                                    <FiBookOpen size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Registration Protocol</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Toggle global enrollment accessibility</p>
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${settings.registration_status.isOpen ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {settings.registration_status.isOpen ? 'PROTOCOL OPEN' : 'PROTOCOL LOCKED'}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mb-10">
                            <button
                                onClick={() => handleSave('registration_status', { isOpen: true })}
                                disabled={settings.registration_status.isOpen || saving}
                                className={`flex-1 py-10 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group/btn ${settings.registration_status.isOpen ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-emerald-200 hover:text-emerald-500'}`}
                            >
                                <FiUnlock size={32} className={settings.registration_status.isOpen ? 'animate-bounce' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Enable Registration</span>
                            </button>
                            <button
                                onClick={() => handleSave('registration_status', { isOpen: false })}
                                disabled={!settings.registration_status.isOpen || saving}
                                className={`flex-1 py-10 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group/btn ${!settings.registration_status.isOpen ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-rose-200 hover:text-rose-500'}`}
                            >
                                <FiLock size={32} className={!settings.registration_status.isOpen ? 'animate-bounce' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Disable Registration</span>
                            </button>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                            <FiActivity size={20} className="text-gray-400 mt-1" />
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight leading-relaxed">
                                Note: Disabling registration will hide the selection grid for all students. Active/Submitted registrations will still be processed.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
