'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiUser, FiBook, FiDollarSign, FiHome, FiMapPin, FiCalendar, FiActivity, FiTrendingUp, FiCreditCard, FiAlertCircle, FiCheckCircle, FiArrowUpRight } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Student360() {
    const { id } = useParams()
    const router = useRouter()
    const [student, setStudent] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchStudentData()
    }, [id])

    const fetchStudentData = async () => {
        try {
            setIsLoading(true)
            // We need a dedicated profile API or handle multiple requests
            // For now, let's fetch from our existing admin student detail if it exists, or aggregate
            const response = await axios.get(`/api/admin/students/${id}`)
            setStudent(response.data)
        } catch (error) {
            toast.error('Failed to load profile')
            // router.push('/admin/students')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!student) return null

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-[50]">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/admin/students" className="p-3 bg-gray-50 text-gray-400 hover:text-primary-600 rounded-2xl transition-all border border-transparent hover:border-primary-100 active:scale-95">
                            <FiArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none uppercase">{student.userId?.firstName} {student.userId?.lastName}</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{student.matricNumber} • {student.department}</p>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${student.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        <span className={`w-2 h-2 rounded-full ${student.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                        {student.status}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Sidebar: Profile Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm text-center relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-50 blur-[40px] group-hover:bg-primary-100 transition-colors"></div>
                            <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-[2rem] mx-auto flex items-center justify-center text-3xl font-black border-4 border-white shadow-xl mb-6 relative z-10">
                                {student.userId?.firstName?.[0]}
                            </div>
                            <h2 className="text-xl font-black text-gray-900 mb-1 relative z-10">{student.userId?.firstName} {student.userId?.lastName}</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10">{student.level} Level Student</p>

                            <div className="space-y-3 relative z-10">
                                <div className="p-4 bg-gray-50 rounded-2xl text-left border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-xs font-bold text-gray-900 break-all">{student.userId?.email}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl text-left border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                                    <p className="text-xs font-bold text-gray-900">{student.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                            <FiActivity className="absolute bottom-[-20px] right-[-20px] text-white/5 text-8xl" />
                            <h3 className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Lifecycle Stats</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">GPA Stability</p>
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl font-black text-white">4.2<span className="text-xs text-primary-400">/5</span></div>
                                        <div className="flex items-center text-[10px] font-black text-emerald-400 gap-1 bg-emerald-400/10 px-2 py-1 rounded-lg">
                                            <FiTrendingUp /> +0.4
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Completion</p>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-500 w-[65%]" />
                                    </div>
                                    <p className="text-[10px] font-black text-right mt-2 text-primary-400">65% Progress</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Deep Insights */}
                    <div className="lg:col-span-3 space-y-10">
                        {/* Section Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Academic Snapshot */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm group hover:border-primary-100 transition-all">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 transition-transform group-hover:scale-110">
                                        <FiBook size={20} />
                                    </div>
                                    <FiArrowUpRight className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">Academic <span className="text-gray-400 font-medium italic underline decoration-primary-500/30">Record</span></h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Current Enrolment Details</p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Enrolled Courses</span>
                                        <span className="text-sm font-black text-gray-900">{student.registrations?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Major Dept</span>
                                        <span className="text-[11px] font-black text-gray-900 uppercase">{student.department}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Standing */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm group hover:border-emerald-100 transition-all">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 transition-transform group-hover:scale-110">
                                        <FiDollarSign size={20} />
                                    </div>
                                    <FiArrowUpRight className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">Financial <span className="text-gray-400 font-medium italic underline decoration-emerald-500/30">Ledger</span></h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Billing & Payments History</p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Paid (YTD)</span>
                                        <span className="text-sm font-black text-emerald-600">₦245,000</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Outstanding Bill</span>
                                        <span className="text-sm font-black text-rose-600">₦0.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hostel / Residential Information */}
                        <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/30 blur-[100px] pointer-events-none"></div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-primary-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-primary-500/20 transition-transform group-hover:rotate-12">
                                        <FiHome size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Residential <span className="text-gray-400 font-medium italic underline decoration-primary-500/30">Unit</span></h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Campus Housing Allocation</p>
                                    </div>
                                </div>
                                <button className="px-8 py-4 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-600 transition-all active:scale-95 shadow-xl">
                                    Reassign Room
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group/card hover:bg-white hover:border-primary-100 transition-all">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Allocation</p>
                                    <h4 className="text-xl font-black text-gray-900 mb-1 group-hover/card:text-primary-600 transition-colors">Alumni Hall</h4>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Male Wing • North Campus</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group/card hover:bg-white hover:border-primary-100 transition-all">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Specific Room</p>
                                    <h4 className="text-xl font-black text-gray-900 mb-1 group-hover/card:text-primary-600 transition-colors">Room A-212</h4>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest underline decoration-emerald-500/30">Cleared for Stay</p>
                                </div>
                                <div className="p-6 bg-gray-900 text-white rounded-3xl group/card shadow-xl relative overflow-hidden">
                                    <FiMapPin className="absolute top-4 right-4 text-white/10 text-4xl" />
                                    <p className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em] mb-4">Emergency Contact</p>
                                    <h4 className="text-lg font-black mb-1">08061234567</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Parent / Guardian</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Feed */}
                        <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm group">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Audit <span className="text-gray-400 font-medium italic underline decoration-gray-900/10">Trail</span></h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Institutional Interactivity Logs</p>
                                </div>
                                <FiArrowUpRight className="text-gray-300 group-hover:text-gray-900 transition-colors" />
                            </div>

                            <div className="space-y-4">
                                {[
                                    { type: 'FINANCE', label: 'School Fees Payment (2024/2025)', time: '2 hours ago', status: 'SUCCESS' },
                                    { type: 'ACADEMIC', label: 'Course Registration Approved (12 Units)', time: '1 day ago', status: 'SUCCESS' },
                                    { type: 'RESIDENCY', label: 'Hostel Unit Allocated - Alumni Hall', time: '3 days ago', status: 'INFO' }
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:border-primary-100 hover:bg-white transition-all group/log">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${log.type === 'FINANCE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                log.type === 'ACADEMIC' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-purple-50 text-purple-600 border-purple-100'
                                                }`}>
                                                {log.type === 'FINANCE' ? <FiDollarSign /> : log.type === 'ACADEMIC' ? <FiBook /> : <FiHome />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 mb-1 group-hover/log:text-primary-600 transition-colors uppercase">{log.label}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{log.time}</p>
                                            </div>
                                        </div>
                                        {log.status === 'SUCCESS' ? <FiCheckCircle className="text-emerald-500" /> : <FiAlertCircle className="text-primary-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
