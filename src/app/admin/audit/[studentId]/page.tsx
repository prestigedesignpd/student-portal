'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    FiUser, FiAward, FiBook, FiDollarSign, FiLayers, FiShield,
    FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle,
    FiPrinter, FiActivity, FiMessageSquare, FiExternalLink, FiEye, FiLock, FiCpu, FiMonitor, FiTerminal, FiDatabase, FiZap, FiBox
} from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

type Tab = 'TRANSCRIPT' | 'ENROLLMENTS' | 'FINANCIAL' | 'PROGRAM'

export default function StudentAuditDetail() {
    const { studentId } = useParams()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<Tab>('TRANSCRIPT')
    const [student, setStudent] = useState<any>(null)
    const [results, setResults] = useState<any>(null)
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (studentId) fetchAuditData()
    }, [studentId])

    const fetchAuditData = async () => {
        try {
            setLoading(true)
            const [studentRes, resultsRes, paymentsRes] = await Promise.all([
                axios.get(`/api/admin/students/${studentId}`),
                axios.get(`/api/admin/results/${studentId}`),
                axios.get(`/api/admin/payments?studentId=${studentId}`)
            ])
            setStudent(studentRes.data)
            setResults(resultsRes.data)
            setPayments(paymentsRes.data)
        } catch (error) {
            toast.error('Could not load report')
        } finally {
            setTimeout(() => setLoading(false), 500)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_30px_rgba(16,185,129,0.2)]"></div>
            </div>
        )
    }

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'TRANSCRIPT', label: 'Academic Transcript', icon: FiAward },
        { id: 'ENROLLMENTS', label: 'Course Enrollments', icon: FiBook },
        { id: 'FINANCIAL', label: 'Payment History', icon: FiDollarSign },
        { id: 'PROGRAM', label: 'Academic Progress', icon: FiShield },
    ]

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden pb-12">
            {/* Background System Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 relative z-10">
                {/* Dossier Header Area */}
                <div className="bg-[#0a0a0b] rounded-[3rem] p-10 mb-10 shadow-2xl relative overflow-hidden border border-white/5 font-mono">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => router.back()}
                                className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all shadow-xl active:scale-95 group"
                            >
                                <FiArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div className="flex items-center gap-8">
                                <div className="hidden sm:block w-20 h-20 rounded-3xl bg-white/10 border-2 border-emerald-500/30 overflow-hidden shadow-2xl">
                                    {student?.avatar ? (
                                        <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-emerald-500">
                                            <FiUser size={32} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Audit Report // REF: {studentId?.toString().slice(-8).toUpperCase()}</p>
                                    </div>
                                    <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-3 uppercase">
                                        {student?.firstName} <span className="text-emerald-500 italic">{student?.lastName}</span>
                                    </h1>
                                    <div className="flex flex-wrap gap-3">
                                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest">{student?.studentDetails?.matricNumber}</span>
                                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest">{student?.studentDetails?.department}</span>
                                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest">{student?.studentDetails?.level} LEVEL</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.print()}
                                className="bg-white/10 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-4 hover:bg-white hover:text-[#0a0a0b] transition-all shadow-xl active:scale-95 border border-white/10"
                            >
                                <FiPrinter size={16} /> Print Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Secure Tab Navigation */}
                <div className="flex bg-[#0a0a0b] p-2 rounded-[2.5rem] border border-white/5 shadow-2xl mb-12 overflow-x-auto no-scrollbar font-mono">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-4 px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20'
                                : 'text-gray-500 hover:text-emerald-500 hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? 'animate-pulse' : ''} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Decrypted Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {activeTab === 'TRANSCRIPT' && <TranscriptView results={results} />}
                    {activeTab === 'ENROLLMENTS' && <EnrollmentsView studentId={studentId as string} />}
                    {activeTab === 'FINANCIAL' && <FinancialView payments={payments} />}
                    {activeTab === 'PROGRAM' && <ProgramProgressView student={student} />}
                </div>
            </main>
        </div>
    )
}

function TranscriptView({ results }: { results: any }) {
    if (!results || Object.keys(results).length === 0) {
        return (
            <div className="py-32 text-center bg-white border border-gray-100 rounded-[3rem] shadow-xl font-mono">
                <FiAward size={64} className="text-gray-100 mx-auto mb-8 animate-pulse" />
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Zero Academic Data</h3>
                <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-[0.2em] font-black">No records found for this student.</p>
            </div>
        )
    }

    const academicYears = Object.keys(results).sort((a, b) => b.localeCompare(a))

    return (
        <div className="space-y-16 font-mono">
            {academicYears.map(year => (
                <div key={year} className="space-y-10">
                    <div className="flex items-center gap-6">
                        <div className="w-4 h-1 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
                        <h2 className="text-xl font-black text-gray-950 uppercase tracking-tighter">PHASE // {year} TRANSCRIPT</h2>
                        <div className="h-px flex-grow bg-gray-100"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {['FIRST', 'SECOND'].map(semester => (
                            results[year][semester]?.length > 0 && (
                                <div key={semester} className="space-y-6">
                                    <div className="flex items-center justify-between px-6">
                                        <div className="flex items-center gap-3">
                                            <FiZap className="text-amber-500" size={14} />
                                            <p className="text-[10px] font-black text-gray-950 uppercase tracking-[0.3em]">{semester} SEMESTER</p>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{results[year][semester].length} COURSES</span>
                                    </div>
                                    <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-xl hover:border-emerald-100 transition-all">
                                        <table className="w-full text-left">
                                            <thead className="bg-[#0a0a0b] border-b border-white/5">
                                                <tr>
                                                    <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Course Code</th>
                                                    <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Score</th>
                                                    <th className="p-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 font-black">
                                                {results[year][semester].map((res: any) => (
                                                    <tr key={res._id} className="hover:bg-emerald-50/20 transition-all group">
                                                        <td className="p-6">
                                                            <p className="text-xs text-gray-950 uppercase tracking-widest mb-1">{res.courseId.courseCode}</p>
                                                            <p className="text-gray-400 text-[8px] uppercase tracking-tighter truncate max-w-[180px]">{res.courseId.courseTitle}</p>
                                                        </td>
                                                        <td className="p-6 text-center text-xs text-gray-900">{res.totalScore}%</td>
                                                        <td className="p-6 text-right">
                                                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mr-0 text-[10px] shadow-lg ${['A', 'B'].includes(res.grade) ? 'bg-emerald-950 text-emerald-400 shadow-emerald-900/10' :
                                                                res.grade === 'F' ? 'bg-rose-950 text-rose-400 shadow-rose-900/10' : 'bg-gray-900 text-gray-400 shadow-black'
                                                                }`}>
                                                                {res.grade || '!!'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

function EnrollmentsView({ studentId }: { studentId: string }) {
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const res = await axios.get(`/api/admin/registrations?studentId=${studentId}`)
                setEnrollments(res.data[0]?.enrollments || [])
            } finally {
                setLoading(false)
            }
        }
        fetchEnrollments()
    }, [studentId])

    if (loading) return (
        <div className="py-32 text-center font-mono">
            <FiActivity className="animate-pulse text-emerald-500 mx-auto mb-6" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Loading enrollment data...</p>
        </div>
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-mono">
            {enrollments.length === 0 ? (
                <div className="col-span-full py-32 text-center bg-white border border-gray-100 rounded-[3rem] shadow-xl">
                    <FiBook size={64} className="text-gray-100 mx-auto mb-8 animate-pulse" />
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">No active enrollments found.</p>
                </div>
            ) : (
                enrollments.map((enroll) => (
                    <div key={enroll._id} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl hover:border-emerald-100 hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-[#0a0a0b] text-emerald-500 border border-white/5 flex items-center justify-center font-black text-sm shadow-2xl group-hover:scale-110 transition-transform">
                                {enroll.courseId.courseCode}
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${enroll.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                enroll.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                    'bg-rose-50 text-rose-600 border border-rose-100'
                                }`}>
                                STATUS: {enroll.status}
                            </span>
                        </div>
                        <h3 className="text-xs font-black text-gray-950 uppercase mb-3 truncate leading-tight">{enroll.courseId.courseTitle}</h3>
                        <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] pt-6 border-t border-gray-50">
                            <span className="flex items-center gap-2"><FiBox size={12} /> {enroll.courseId.creditUnits} UNITS</span>
                            <span className="flex items-center gap-2"><FiLayers size={12} /> {enroll.courseId.level} LEVEL</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

function FinancialView({ payments }: { payments: any[] }) {
    return (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden font-mono">
            <table className="w-full text-left">
                <thead className="bg-[#0a0a0b] border-b border-white/5">
                    <tr>
                        <th className="p-10 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Reference</th>
                        <th className="p-10 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Payment For</th>
                        <th className="p-10 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] text-center">Amount (NGN)</th>
                        <th className="p-10 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] text-center">Date</th>
                        <th className="p-10 text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {payments.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-32 text-center">
                                <FiDollarSign size={64} className="text-gray-100 mx-auto mb-8 animate-pulse" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">No payments found.</p>
                            </td>
                        </tr>
                    ) : (
                        payments.map((p) => (
                            <tr key={p._id} className="hover:bg-emerald-50/20 transition-all font-black">
                                <td className="p-10">
                                    <p className="text-[10px] text-gray-950 tracking-[0.1em]">{p.reference || 'REF_NULL'}</p>
                                </td>
                                <td className="p-10">
                                    <p className="text-xs text-gray-950 uppercase leading-none mb-2">{p.type === 'HOSTEL' ? 'Accommodation' : 'Tuition Fees'}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.academicYear} SESSION</p>
                                </td>
                                <td className="p-10 text-center text-sm text-gray-950">
                                    {p.amount?.toLocaleString()}
                                </td>
                                <td className="p-10 text-center text-[10px] text-gray-950 uppercase">
                                    {new Date(p.paidAt || p.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-10 text-right">
                                    <span className={`px-4 py-2 rounded-xl text-[9px] shadow-sm ${p.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-950' : 'text-gray-500 bg-gray-100'
                                        }`}>
                                        {p.status === 'SUCCESS' ? 'VERIFIED' : 'PENDING'}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

function ProgramProgressView({ student }: { student: any }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start font-mono">
            <div className="p-12 bg-[#0a0a0b] rounded-[3.5rem] text-white overflow-hidden relative group shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] border border-white/5 pointer-events-none transition-all duration-700"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <FiCpu className="text-emerald-500 animate-pulse" size={24} />
                        <h3 className="text-2xl font-black tracking-tighter leading-none uppercase">Academic <span className="text-emerald-500 italic">Progress</span></h3>
                    </div>

                    <div className="space-y-12">
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Degree Progress</p>
                                <span className="text-2xl font-black tracking-tight text-emerald-500">64.00%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-emerald-600 w-[64%] shadow-[0_0_20px_#10b981]"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Credits Earned</p>
                                <p className="text-2xl font-black">124 / 160</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Student Status</p>
                                <p className="text-2xl font-black text-emerald-400">ACTIVE</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="p-10 bg-white border border-gray-100 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 blur-[40px] pointer-events-none"></div>
                    <div className="flex items-center gap-4 mb-8">
                        <FiLock className="text-gray-950" size={20} />
                        <h3 className="text-xs font-black text-gray-950 uppercase tracking-[0.2em]">Student Details</h3>
                    </div>
                    <div className="space-y-5">
                        {[
                            { label: 'Matric Number', value: student?.studentDetails?.matricNumber || 'REF_NULL' },
                            { label: 'Department', value: student?.studentDetails?.department || 'N/A' },
                            { label: 'Priority Tier', value: `${student?.studentDetails?.level} LEVEL` },
                            { label: 'Graduation Year', value: '2027' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-none group">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">{item.label}</p>
                                <p className="text-[10px] font-black text-gray-950 uppercase tracking-tight">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="w-full p-8 rounded-[3rem] bg-emerald-600 text-white flex items-center justify-between group cursor-pointer shadow-2xl shadow-emerald-500/20 active:scale-[0.98] transition-all hover:bg-emerald-500">
                    <div className="text-left">
                        <h4 className="text-base font-black uppercase tracking-tighter leading-tight">Export Student Report</h4>
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-60 mt-1">Download academic record</p>
                    </div>
                    <FiExternalLink className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={24} />
                </button>
            </div>
        </div>
    )
}
