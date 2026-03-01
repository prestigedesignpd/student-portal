'use client'

import { useState, useEffect } from 'react'
import { FiSend, FiUsers, FiBell, FiInfo, FiAlertTriangle, FiTarget, FiTrash2, FiClock, FiCheckCircle, FiSearch, FiPrinter, FiMail, FiMessageSquare, FiEdit2, FiActivity, FiShield, FiRadio, FiZap, FiCpu, FiHash } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'URGENT';
    isGlobal: boolean;
    targetDepartment?: string;
    targetLevel?: number;
    createdAt: string;
}

export default function AdminCommunications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [departments, setDepartments] = useState<string[]>([])
    const [isSyncing, setIsSyncing] = useState(false)

    // Form State
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [type, setType] = useState<'INFO' | 'WARNING' | 'URGENT'>('INFO')
    const [targetDepartment, setTargetDepartment] = useState('ALL')
    const [targetLevel, setTargetLevel] = useState('ALL')
    const [editingId, setEditingId] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [notifRes, deptRes] = await Promise.all([
                axios.get('/api/admin/notifications'),
                axios.get('/api/admin/departments')
            ])
            setNotifications(notifRes.data)
            setDepartments(deptRes.data.map((d: any) => d.name))
        } catch (error) {
            toast.error('Announcement sync failed')
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !message) return toast.error('Check signal parameters')

        setSending(true)
        setIsSyncing(true)
        try {
            const payload = {
                title,
                message,
                type,
                isGlobal: true,
                targetDepartment: targetDepartment === 'ALL' ? null : targetDepartment,
                targetLevel: targetLevel === 'ALL' ? null : Number(targetLevel)
            }

            if (editingId) {
                await axios.patch(`/api/admin/notifications/${editingId}`, payload)
                toast.success('Announcement updated')
            } else {
                await axios.post('/api/admin/notifications', payload)
                toast.success('Announcement sent successfully')
            }

            handleReset()
            fetchData()
        } catch (error) {
            toast.error(editingId ? 'Update failed' : 'Dispatch protocol error')
        } finally {
            setTimeout(() => {
                setSending(false)
                setIsSyncing(false)
            }, 1000)
        }
    }

    const handleEdit = (notif: Notification) => {
        setEditingId(notif._id)
        setTitle(notif.title)
        setMessage(notif.message)
        setType(notif.type)
        setTargetDepartment(notif.targetDepartment || 'ALL')
        setTargetLevel(notif.targetLevel?.toString() || 'ALL')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleReset = () => {
        setEditingId(null)
        setTitle('')
        setMessage('')
        setType('INFO')
        setTargetDepartment('ALL')
        setTargetLevel('ALL')
    }

    const deleteNotification = async (id: string) => {
        if (!confirm('Permanently delete this announcement?')) return
        try {
            setIsSyncing(true)
            await axios.delete(`/api/admin/notifications/${id}`)
            toast.success('Announcement deleted')
            fetchData()
        } catch (error) {
            toast.error('Delete failed')
        } finally {
            setTimeout(() => setIsSyncing(false), 800)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin shadow-[0_0_30px_rgba(245,158,11,0.2)]"></div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-[#fbfcfd] font-outfit overflow-hidden">
            {/* Background System Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">
                {/* Broadcast Hub Header */}
                <div className="bg-[#0a0a0b] rounded-[3rem] p-12 mb-12 shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[150px] pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'bg-indigo-500 animate-ping' : 'bg-amber-500 animate-pulse'} shadow-[0_0_15px_#f59e0b]`}></div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">
                                    {isSyncing ? 'Sending announcement...' : 'Message Center'}
                                </p>
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-6 uppercase">Announcements</h1>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <FiRadio className="text-amber-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{notifications.length} Sent Messages</span>
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <FiZap className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">System Status: Normal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Transmission Console */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                        <section className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 blur-[50px] pointer-events-none"></div>

                            <div className="flex items-center justify-between gap-3 mb-10 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#0a0a0b] flex items-center justify-center text-amber-500 shadow-xl border border-white/5">
                                        <FiSend size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-950 uppercase tracking-tighter leading-none">
                                            {editingId ? 'Edit' : 'Create'} <span className="text-amber-600">Announcement</span>
                                        </h2>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Direct Message Form</p>
                                    </div>
                                </div>
                                {editingId && (
                                    <button
                                        onClick={handleReset}
                                        className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                        title="Abort Edit"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSend} className="space-y-8 relative z-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Signal Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Announcement Title..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-8 py-5 text-sm font-black text-gray-950 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-100 transition-all outline-none placeholder:text-gray-300 uppercase tracking-tight"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Priority Level</label>
                                        <select
                                            value={type}
                                            onChange={(e: any) => setType(e.target.value)}
                                            className={`w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-[10px] font-black uppercase tracking-widest outline-none transition-all ${type === 'URGENT' ? 'text-rose-600' : type === 'WARNING' ? 'text-amber-600' : 'text-indigo-600'
                                                }`}
                                        >
                                            <option value="INFO">General Information</option>
                                            <option value="WARNING">Warning/Alert</option>
                                            <option value="URGENT">Emergency Announcement</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Academic Tier</label>
                                        <select
                                            value={targetLevel}
                                            onChange={(e) => setTargetLevel(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-[10px] font-black uppercase tracking-widest outline-none"
                                        >
                                            <option value="ALL">All Levels</option>
                                            <option value="100">100 Level</option>
                                            <option value="200">200 Level</option>
                                            <option value="300">300 Level</option>
                                            <option value="400">400 Level</option>
                                            <option value="500">500 Level</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Target Department</label>
                                    <select
                                        value={targetDepartment}
                                        onChange={(e) => setTargetDepartment(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-[10px] font-black uppercase tracking-widest outline-none"
                                    >
                                        <option value="ALL">All Sectors</option>
                                        {departments.map(d => (
                                            <option key={d} value={d}>{d} Sector</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Message Content</label>
                                    <textarea
                                        rows={6}
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type message here..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-8 py-6 text-sm font-bold text-gray-950 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-100 transition-all resize-none outline-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full py-6 bg-gray-950 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center gap-4 hover:bg-black active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.15)] disabled:opacity-50"
                                >
                                    {sending ? (
                                        <FiClock className="animate-spin" />
                                    ) : (
                                        <>
                                            <FiActivity className="text-amber-500" />
                                            {editingId ? 'Update Announcement' : 'Send Announcement'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </section>
                    </div>

                    {/* Frequency Feed */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                        <section className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full max-h-[900px]">
                            <div className="p-10 border-b border-gray-50 bg-[#0a0a0b] flex items-center justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 blur-[40px] pointer-events-none"></div>
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-amber-500 border border-white/10">
                                        <FiClock size={22} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">History</h2>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">Previous Portal Messages</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <span className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">{notifications.length} Messages</span>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto no-scrollbar p-10 space-y-6 bg-gray-50/20">
                                {loading ? (
                                    <div className="py-24 flex justify-center">
                                        <FiActivity className="animate-pulse text-amber-500" size={48} />
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="py-32 text-center">
                                        <FiCpu className="mx-auto text-gray-200 mb-6 animate-pulse" size={64} />
                                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.4em] italic leading-tight">No announcements found</h3>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div key={notif._id} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 transition-all hover:border-amber-200 hover:shadow-2xl relative overflow-hidden hover:-translate-y-1">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/50 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                            <div className="flex items-start justify-between gap-6 mb-6 relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-3 h-3 rounded-full ${notif.type === 'URGENT' ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' :
                                                        notif.type === 'WARNING' ? 'bg-amber-500 shadow-[0_0_15px_#f59e0b]' : 'bg-indigo-500 shadow-[0_0_15px_#6366f1]'
                                                        } animate-pulse`}></div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-gray-950 uppercase tracking-tighter leading-none group-hover:text-amber-600 transition-colors">{notif.title}</h3>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Ref: {notif._id.slice(-8).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(notif)}
                                                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 transition-all active:scale-90"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteNotification(notif._id)}
                                                        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-100 transition-all active:scale-90"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-sm font-bold text-gray-500 leading-relaxed mb-8 relative z-10 uppercase tracking-tight">
                                                {notif.message}
                                            </p>

                                            <div className="flex flex-wrap items-center justify-between pt-6 border-t border-gray-50 gap-4 relative z-10">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${notif.type === 'URGENT' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        notif.type === 'WARNING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                        }`}>
                                                        {notif.type}
                                                    </span>
                                                    {notif.targetDepartment && (
                                                        <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 bg-gray-900 text-white rounded-lg">
                                                            {notif.targetDepartment}
                                                        </span>
                                                    )}
                                                    {notif.targetLevel && (
                                                        <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg font-black">
                                                            {notif.targetLevel} LEVEL
                                                        </span>
                                                    )}
                                                    {!notif.targetDepartment && !notif.targetLevel && (
                                                        <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg">
                                                            GLOBAL
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                                    <FiHash size={12} />
                                                    {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
