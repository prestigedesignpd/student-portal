'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { FiBook, FiAward, FiClock, FiDollarSign, FiArrowRight, FiActivity, FiZap, FiCheckCircle, FiHome, FiLock, FiUnlock } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'

export default function StudentDashboard() {
    const { user } = useAuth() as any
    const [stats, setStats] = useState({
        gpa: 0,
        credits: 0,
        pendingFees: 0,
        enrolledCourses: 0
    })
    const [recentResults, setRecentResults] = useState<any[]>([])
    const [systemInfo, setSystemInfo] = useState<any>(null)
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState('')

    useEffect(() => {
        const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        setCurrentDate(new Date().toLocaleDateString('en-US', dateOptions))
        fetchDashboardData()
    }, [user])

    const fetchDashboardData = async () => {
        try {
            const [statsRes, latestRes, settingsRes, notifsRes] = await Promise.all([
                axios.get('/api/student/stats'),
                axios.get('/api/results?latest=true').catch(() => ({ data: [] })),
                axios.get('/api/admin/settings').catch(() => ({ data: null })),
                axios.get('/api/notifications').catch(() => ({ data: [] }))
            ])

            setRecentResults(latestRes.data || [])
            setSystemInfo(settingsRes.data)
            setNotifications(notifsRes.data || [])

            const liveStats = statsRes.data
            setStats({
                gpa: liveStats.cgpa,
                credits: liveStats.credits,
                pendingFees: liveStats.pendingFees,
                enrolledCourses: liveStats.activeCourses
            })
        } catch (error) {
            console.error('Dashboard fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    const cards = useMemo(() => [
        { title: 'Current CGPA', value: stats.gpa.toFixed(2), subtitle: 'Out of 5.00', icon: FiAward, bg: 'bg-primary-500', text: 'text-white', iconColor: 'text-primary-200' },
        { title: 'Credit Units', value: stats.credits, subtitle: 'Total Accumulated', icon: FiBook, bg: 'bg-white', text: 'text-gray-900', iconColor: 'text-indigo-500' },
        { title: 'Pending Fees', value: `₦${(stats.pendingFees / 1000).toFixed(0)}k`, subtitle: 'Outstanding Balance', icon: FiDollarSign, bg: 'bg-white', text: 'text-gray-900', iconColor: 'text-rose-500' },
        { title: 'Active Courses', value: stats.enrolledCourses, subtitle: 'Current Semester', icon: FiClock, bg: 'bg-white', text: 'text-gray-900', iconColor: 'text-emerald-500' },
    ], [stats])

    return (
        <div className="relative overflow-hidden min-h-screen">
            <main className="max-w-6xl mx-auto px-3 sm:px-5 py-4 pb-20 md:pb-12">
                {/* Premium Welcome Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
                    <div className="animate-in slide-in-from-bottom-2 duration-700">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                            <FiZap className="text-primary-500" /> Dashboard Overview
                            {systemInfo && (
                                <span className="flex items-center gap-1.5 ml-3 px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 tracking-widest text-[7px] font-black border border-gray-200">
                                    {systemInfo.registration_status?.isOpen ? <FiUnlock size={8} className="text-emerald-500" /> : <FiLock size={8} className="text-rose-500" />}
                                    REGISTRATION {systemInfo.registration_status?.isOpen ? 'OPEN' : 'LOCKED'}
                                </span>
                            )}
                        </p>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight leading-none mb-1.5">
                            Good day, {user?.firstName}
                        </h1>
                        <p className="text-[10px] font-bold text-gray-500 tracking-wide">
                            {currentDate} • <span className="text-primary-600 font-extrabold uppercase">{systemInfo?.academic_info?.session || 'Nexus'} Session</span>
                        </p>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                        {systemInfo?.registration_status?.isOpen && (
                            <Link href="/courses" className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md shadow-primary-500/20 transition-all active:scale-95 flex items-center gap-1.5">
                                <FiBook size={12} /> Register Courses
                            </Link>
                        )}
                    </div>
                </div>

                {/* Premium Stat Nodes */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {cards.map((card, index) => (
                        <div key={index}
                            className={`${card.bg} rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group 
                                       ${card.bg === 'bg-white' ? 'border border-gray-100 shadow-sm hover:shadow-md hover:shadow-gray-200/50' : 'shadow-md shadow-primary-500/20'} 
                                       transition-all duration-300 hover:-translate-y-0.5`}>
                            {/* Decorative Background Icon */}
                            <card.icon className={`absolute -right-3 -bottom-3 text-[60px] opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-500 ${card.bg === 'bg-white' ? card.iconColor : 'text-white'}`} />

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg === 'bg-white' ? 'bg-gray-50' : 'bg-primary-600'}`}>
                                    <card.icon className={`text-sm ${card.bg === 'bg-white' ? card.iconColor : 'text-white'}`} strokeWidth={2.5} />
                                </div>
                                {card.bg === 'bg-white' && <div className="w-1 h-1 rounded-full bg-gray-200 group-hover:bg-primary-500 transition-colors"></div>}
                            </div>
                            <div className="relative z-10">
                                <h3 className={`text-xl font-black tracking-tighter mb-0.5 ${card.text}`}>{card.value}</h3>
                                <p className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${card.bg === 'bg-white' ? 'text-gray-400' : 'text-primary-100'}`}>{card.title}</p>
                                <p className={`text-[6px] font-bold uppercase tracking-widest ${card.bg === 'bg-white' ? 'text-gray-300' : 'text-primary-300'}`}>{card.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Academic Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                                        <FiActivity size={12} className="text-emerald-500" />
                                    </div>
                                    <h2 className="text-[9px] font-black text-gray-900 uppercase tracking-[0.1em]">Recent Results</h2>
                                </div>
                                <Link href="/results" className="text-[8px] font-black text-primary-500 hover:text-primary-600 uppercase tracking-widest transition-colors flex items-center gap-1 group">
                                    View Full Transcript <FiArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="p-4 space-y-3">
                                {recentResults.map((item, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:border-primary-100 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center font-black text-xs text-gray-900 border border-gray-100 group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-100 transition-colors shrink-0">
                                                {item.grade}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-gray-900 leading-tight mb-0.5 group-hover:text-primary-700 transition-colors">{item.courseId?.courseTitle || 'Unknown Course'}</p>
                                                <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest">
                                                    <span className="text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-md">{item.courseId?.courseCode || 'XXX 000'}</span>
                                                    <span className="text-gray-400">{item.academicYear} • {item.semester}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pl-14 sm:pl-0 shrink-0">
                                            {item.isCompleted ? (
                                                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-widest">
                                                    <FiCheckCircle size={10} /> Passed
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/10 text-rose-600 text-[8px] font-black uppercase tracking-widest">
                                                    Failed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {recentResults.length === 0 && !loading && (
                                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                                            <FiAward className="text-gray-300 text-sm" />
                                        </div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No recent records</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side Stack */}
                    <div className="space-y-6">
                        {/* Modern System Panel */}
                        <div className="bg-gray-950 rounded-2xl p-5 text-white relative overflow-hidden group shadow-lg">
                            {/* Glass background effects */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 pointer-events-none mix-blend-overlay"></div>

                            <div className="relative z-10">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-400 mb-5 flex items-center justify-between">
                                    <span>Portal Announcements</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                                </h3>
                                <div className="space-y-4">
                                    {notifications.map((notif, idx) => (
                                        <div key={idx} className="group/item cursor-pointer">
                                            <p className="text-[10px] font-medium text-gray-100 leading-snug mb-2 group-hover/item:text-primary-300 transition-colors">{notif.message}</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1 h-1 rounded-full ${notif.type === 'URGENT' ? 'bg-rose-500' : notif.type === 'WARNING' ? 'bg-amber-500' : 'bg-primary-500'}`}></div>
                                                <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest">{formatDistanceToNow(new Date(notif.createdAt))} ago</p>
                                            </div>
                                            {idx < notifications.length - 1 && <div className="h-[1px] bg-gray-800 mt-4"></div>}
                                        </div>
                                    ))}
                                    {notifications.length === 0 && (
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center py-4">No new announcements at this time</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Services Node */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100/50 p-4 flex flex-col gap-2">
                            <p className="text-[8px] font-black text-indigo-900/40 uppercase tracking-[0.2em] px-1 pt-1 mb-1">Quick Services</p>

                            <Link href="/library" className="flex items-center justify-between p-3 rounded-xl bg-white border border-white hover:border-indigo-100 shadow-sm hover:shadow-indigo-500/10 transition-all group active:scale-[0.98]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shrink-0">
                                        <FiBook size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-900">Library</p>
                                        <p className="text-[8px] font-bold text-gray-400">Inventory & Loans</p>
                                    </div>
                                </div>
                                <FiArrowRight size={12} className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link href="/messages" className="flex items-center justify-between p-3 rounded-xl bg-white border border-white hover:border-indigo-100 shadow-sm hover:shadow-indigo-500/10 transition-all group active:scale-[0.98]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform shrink-0">
                                        <FiActivity size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-900">Support</p>
                                        <p className="text-[8px] font-bold text-gray-400">Institutional Help Desk</p>
                                    </div>
                                </div>
                                <FiArrowRight size={12} className="text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link href="/payments" className="flex items-center justify-between p-3 rounded-xl bg-white border border-white hover:border-indigo-100 shadow-sm hover:shadow-indigo-500/10 transition-all group active:scale-[0.98]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-md bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform shrink-0">
                                        <FiDollarSign size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-900">Clear Fees</p>
                                        <p className="text-[8px] font-bold text-gray-400">View Pending Invoices</p>
                                    </div>
                                </div>
                                <FiArrowRight size={12} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link href="/hostels" className="flex items-center justify-between p-3 rounded-xl bg-white border border-white hover:border-indigo-100 shadow-sm hover:shadow-indigo-500/10 transition-all group active:scale-[0.98]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shrink-0">
                                        <FiHome size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-900">Book Hostel</p>
                                        <p className="text-[8px] font-bold text-gray-400">Secure Accommodation</p>
                                    </div>
                                </div>
                                <FiArrowRight size={12} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}