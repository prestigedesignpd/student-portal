'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiUsers, FiBook, FiDollarSign, FiHome, FiTrendingUp, FiActivity, FiArrowUpRight, FiSearch, FiZap, FiTarget, FiBox, FiCheckSquare, FiLayers, FiLock, FiUnlock } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AdminDashboard() {
    const [dashboardStats, setDashboardStats] = useState<any>({
        students: 0,
        courses: 0,
        departments: 0,
        faculties: 0,
        collections: 0,
        hostelRate: '0%',
        pendingRegistrations: 0
    })
    const [recentStudents, setRecentStudents] = useState<any[]>([])
    const [systemSettings, setSystemSettings] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const [isScanning, setIsScanning] = useState(true)

    useEffect(() => {
        fetchDashboardData()
        setTimeout(() => setIsScanning(false), 2000)
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [statsRes, studentsRes, settingsRes] = await Promise.all([
                axios.get('/api/admin/stats'),
                axios.get('/api/admin/students'),
                axios.get('/api/admin/settings').catch(() => ({ data: null }))
            ])
            setDashboardStats(statsRes.data)
            setRecentStudents(studentsRes.data.slice(0, 4))
            setSystemSettings(settingsRes.data)
        } catch (error) {
            console.error('Dashboard fetch error:', error)
            toast.error('Failed to sync data')
        } finally {
            setIsLoading(false)
        }
    }

    const statsConfig = [
        { label: 'All Students', value: dashboardStats.students.toLocaleString(), trend: '+0%', icon: FiUsers, color: 'text-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/10', href: '/admin/students' },
        { label: 'Available Courses', value: dashboardStats.courses.toLocaleString(), trend: '+0%', icon: FiBook, color: 'text-indigo-500', bg: 'bg-indigo-500/5', border: 'border-indigo-500/10', href: '/admin/courses' },
        { label: 'Hostel Use', value: dashboardStats.hostelRate, trend: '+0%', icon: FiHome, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10', href: '/admin/hostels' },
        {
            label: 'System Status',
            value: systemSettings?.registration_status?.isOpen ? 'READY' : 'LOCKED',
            trend: dashboardStats.pendingRegistrations > 0 ? `${dashboardStats.pendingRegistrations} NEW` : 'OK',
            icon: systemSettings?.registration_status?.isOpen ? FiUnlock : FiLock,
            color: systemSettings?.registration_status?.isOpen ? 'text-emerald-500' : 'text-rose-500',
            bg: systemSettings?.registration_status?.isOpen ? 'bg-emerald-500/5' : 'bg-rose-500/5',
            border: systemSettings?.registration_status?.isOpen ? 'border-emerald-500/10' : 'border-rose-500/10',
            href: '/admin/settings'
        },
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden selection:bg-rose-500/30 selection:text-rose-900">
            {/* System Scan Animation */}
            {isScanning && (
                <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500 shadow-[0_0_20px_#f43f5e] animate-scan opacity-50"></div>
                </div>
            )}

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]"></span>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Management Overview • {systemSettings?.academic_info?.session || 'Smart Campus'}</p>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Command <span className="text-gray-400 font-medium italic">Center</span></h1>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {statsConfig.map((stat, i) => (
                        <Link key={i} href={stat.href} className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden border border-white shadow-sm active:scale-[0.98]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 blur-[50px] group-hover:bg-rose-50 transition-colors"></div>
                            <div className="flex justify-between items-center mb-10 relative z-10">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.border} border rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                    <stat.icon className={`${stat.color} text-xl`} strokeWidth={2.5} />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-dashed border ${stat.trend.includes('NEW') ? 'bg-amber-50 text-amber-500 border-amber-200' :
                                    stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-500 border-emerald-200' :
                                        'bg-rose-50 text-rose-500 border-rose-200'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 relative z-10">{stat.label}</h3>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter relative z-10">{stat.value}</p>
                        </Link>
                    ))}
                </div>

                {/* University Reports - Advanced Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
                    {/* Money Flow */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-white shadow-sm relative overflow-hidden group/chart">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100 group-hover/chart:rotate-12 transition-transform">
                                    <FiTrendingUp className="text-emerald-500 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase">Money Trends</h2>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Earnings for this month</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-emerald-600 tracking-tight">₦4.2M <FiArrowUpRight className="inline" /></p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Target Met</p>
                            </div>
                        </div>

                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { name: 'W1', value: 400000 },
                                    { name: 'W2', value: 850000 },
                                    { name: 'W3', value: 620000 },
                                    { name: 'W4', value: 1200000 },
                                    { name: 'W5', value: 980000 },
                                    { name: 'W6', value: 1540000 },
                                ]}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                        dy={15}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-gray-950/90 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-white/10">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1.5">{payload[0].payload.name} Report</p>
                                                        <p className="text-sm font-black text-white">₦{payload[0].value.toLocaleString()}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10b981"
                                        strokeWidth={5}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        className="drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Split */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-white shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-5 mb-10">
                                <div className="p-4 bg-indigo-50 rounded-3xl border border-indigo-100">
                                    <FiLayers className="text-indigo-500 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase">Faculty Hub</h2>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Student Split</p>
                                </div>
                            </div>

                            <div className="h-[220px] flex items-center justify-center relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Tech', value: 45, color: '#f43f5e' },
                                                { name: 'Business', value: 25, color: '#6366f1' },
                                                { name: 'Science', value: 20, color: '#ec4899' },
                                                { name: 'Arts', value: 10, color: '#f59e0b' },
                                            ]}
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={10}
                                            dataKey="value"
                                        >
                                            {[
                                                { color: '#f43f5e' },
                                                { color: '#6366f1' },
                                                { color: '#ec4899' },
                                                { color: '#f59e0b' },
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                    <p className="text-2xl font-black text-gray-900 tracking-tight">100%</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Allocated</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {[
                                { name: 'Tech', dot: 'bg-rose-500' },
                                { name: 'Business', dot: 'bg-indigo-500' },
                                { name: 'Science', dot: 'bg-pink-500' },
                                { name: 'Arts', dot: 'bg-amber-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className={`w-2 h-2 rounded-full ${item.dot} shadow-sm`}></span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight truncate">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* New Students Feed */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-white relative overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-rose-50 rounded-3xl border border-rose-100">
                                    <FiActivity className="text-rose-500 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase">New Students</h2>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Recent Campus Boarding</p>
                                </div>
                            </div>
                            <Link href="/admin/students" className="text-[10px] font-black text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-5 py-3 rounded-2xl uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95">
                                View All <FiArrowUpRight size={14} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentStudents.map((stu, i) => (
                                <div key={stu._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100 group hover:bg-white hover:border-rose-100 hover:shadow-xl hover:shadow-rose-500/5 transition-all">
                                    <div className="flex items-center gap-5 mb-4 sm:mb-0">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-gray-900 text-base border border-gray-100 group-hover:bg-rose-50 group-hover:text-rose-500 transition-all shadow-sm">
                                            {stu.userId?.firstName?.[0] || 'S'}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-gray-900 group-hover:text-rose-600 transition-colors uppercase tracking-tight">{stu.userId?.firstName} {stu.userId?.lastName}</p>
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-3 mt-1">
                                                <span className="text-rose-500 font-black">{stu.matricNumber}</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                                                <span>{stu.department}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 pl-16 sm:pl-0">
                                        <div className="text-left sm:text-right">
                                            <div className="flex items-center sm:justify-end gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Registered {new Date(stu.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-rose-500 group-hover:border-rose-200 transition-all shadow-sm">
                                            <FiArrowUpRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access Tools */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-white relative overflow-hidden shadow-sm">
                            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Admin Tools</h2>
                            <div className="space-y-4">
                                {[
                                    { label: 'Courses Hub', icon: FiBox, href: '/admin/courses', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                                    { label: 'Money Reports', icon: FiTarget, href: '/admin/fees', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: 'Student List', icon: FiUsers, href: '/admin/students', color: 'text-rose-500', bg: 'bg-rose-500/10' }
                                ].map((act, i) => (
                                    <Link key={i} href={act.href} className="w-full text-left p-5 rounded-3xl bg-gray-50/50 border border-transparent hover:bg-white hover:border-rose-100 hover:shadow-xl transition-all group/btn flex justify-between items-center active:scale-[0.98]">
                                        <div className="flex items-center gap-5">
                                            <div className={`p-3 rounded-2xl ${act.bg} group-hover/btn:scale-110 transition-transform`}>
                                                <act.icon className={`${act.color} text-lg`} />
                                            </div>
                                            <span className="text-xs font-black text-gray-700 group-hover/btn:text-gray-900 uppercase tracking-widest">{act.label}</span>
                                        </div>
                                        <FiArrowUpRight size={18} className="text-gray-400 group-hover/btn:text-rose-500 group-hover/btn:translate-x-1 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Approvals Action */}
                        <Link href="/admin/registrations" className="bg-[#0a0a0b] rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl active:scale-95 transition-all block">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/20 blur-[60px] group-hover:bg-rose-500/30 transition-colors"></div>
                            <div className="relative z-10 h-full flex flex-col">
                                <FiCheckSquare className="text-4xl mb-8 text-rose-500 group-hover:scale-125 group-hover:-rotate-12 transition-transform" />
                                <h3 className="text-2xl font-black tracking-tight mb-3">Checking Approvals</h3>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed mb-10">Review new course requests from students</p>
                                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-rose-500 group-hover:text-rose-400 transition-colors mt-auto">
                                    Start Review <FiArrowUpRight size={16} />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
