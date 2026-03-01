'use client'

import { useState, useEffect } from 'react'
import { FiBell, FiCheckCircle, FiAlertTriangle, FiInfo, FiChevronRight, FiClock, FiTrash2, FiShield } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'URGENT';
    isGlobal: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/notifications')
            setNotifications(response.data)
        } catch (error) {
            console.error('Fetch notifications error:', error)
            toast.error('Could not sync notifications')
        } finally {
            setLoading(false)
        }
    }

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'URGENT':
                return {
                    icon: FiAlertTriangle,
                    bg: 'bg-rose-50',
                    text: 'text-rose-600',
                    border: 'border-rose-100',
                    accent: 'bg-rose-500'
                }
            case 'WARNING':
                return {
                    icon: FiInfo,
                    bg: 'bg-amber-50',
                    text: 'text-amber-600',
                    border: 'border-amber-100',
                    accent: 'bg-amber-500'
                }
            default:
                return {
                    icon: FiBell,
                    bg: 'bg-primary-50',
                    text: 'text-primary-600',
                    border: 'border-primary-100',
                    accent: 'bg-primary-500'
                }
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
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 blur-[100px] -z-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -z-10 rounded-full"></div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></span>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Institutional Intelligence</p>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Activity <span className="text-gray-400 font-medium italic">Feed</span></h1>
                </div>

                {notifications.length === 0 ? (
                    <div className="py-24 text-center bg-white border border-gray-100 rounded-[2.5rem] shadow-sm animate-in fade-in zoom-in-95 duration-700">
                        <div className="w-16 h-16 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FiShield size={28} className="text-primary-500 opacity-50" />
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Everything Clear</h3>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold">You're all caught up with institutional updates.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif, i) => {
                            const styles = getTypeStyles(notif.type)
                            const Icon = styles.icon
                            return (
                                <div
                                    key={notif._id}
                                    className="group p-6 rounded-[2rem] bg-white border border-gray-100 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-500 relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-6 animate-in slide-in-from-bottom-4 duration-700"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className={`w-14 h-14 shrink-0 rounded-2xl ${styles.bg} border ${styles.border} flex items-center justify-center ${styles.text} shadow-sm group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} />
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{notif.title}</h3>
                                            {!notif.isGlobal && (
                                                <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-500 border border-indigo-100 text-[8px] font-black uppercase tracking-widest">PRIVATE</span>
                                            )}
                                            <span className={`w-1.5 h-1.5 rounded-full ${styles.accent}`}></span>
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide leading-relaxed line-clamp-2 sm:line-clamp-1">{notif.message}</p>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-4 sm:border-l border-gray-50 shrink-0">
                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-0.5">
                                                {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 sm:justify-end">
                                                <FiClock size={8} /> {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary-600 group-hover:bg-primary-50 group-hover:border-primary-100 transition-all cursor-pointer">
                                            <FiChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="mt-20 p-8 rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 blur-[60px] group-hover:bg-primary-500/30 transition-colors"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="text-center sm:text-left">
                            <h3 className="text-xl font-black tracking-tight mb-2">Notification Preferences</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-relaxed max-w-sm">Manage how you receive alerts from the university board across different platforms.</p>
                        </div>
                        <button className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 active:scale-95 whitespace-nowrap">
                            Global Settings
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
