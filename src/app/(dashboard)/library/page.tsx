'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiBook, FiBookmark, FiClock, FiArrowRight, FiInfo, FiDownload, FiFileText, FiVideo, FiLink, FiLock, FiActivity } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function LibraryPage() {
    const [activeTab, setActiveTab] = useState<'MATERIALS' | 'PHYSICAL'>('MATERIALS')
    const [loans, setLoans] = useState<any[]>([])
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMyCourses()
        fetchMyLoans()
    }, [])

    const fetchMyLoans = async () => {
        try {
            const response = await axios.get('/api/library/my-loans')
            setLoans(response.data)
        } catch (error) {
            console.error('Fetch loans error:', error)
        }
    }

    const fetchMyCourses = async () => {
        try {
            const response = await axios.get('/api/courses/my-courses')
            setEnrollments(response.data)
        } catch (error) {
            console.error('Fetch courses error:', error)
            toast.error('Could not sync material hub')
        } finally {
            setLoading(false)
        }
    }

    const filteredEnrollments = enrollments.filter(e => {
        const course = e.courseId
        return course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const approvedEnrollments = filteredEnrollments.filter(e => e.status === 'APPROVED' || e.isCompleted)
    const pendingEnrollments = filteredEnrollments.filter(e => e.status === 'PENDING')

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden bg-[#fbfcfd] min-h-screen">
            <main className="max-w-5xl mx-auto px-3 sm:px-5 py-3 pb-20 md:pb-12">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em] mb-0.5">Academic / Repository</p>
                        <h1 className="text-3xl font-black text-gray-950 tracking-tight leading-none uppercase">Library <span className="text-primary-600">Archive.</span></h1>
                    </div>
                    <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setActiveTab('MATERIALS')}
                            className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'MATERIALS' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Materials
                        </button>
                        <button
                            onClick={() => setActiveTab('PHYSICAL')}
                            className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'PHYSICAL' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Physical Books
                        </button>
                    </div>
                </div>

                {activeTab === 'MATERIALS' ? (
                    <>
                        <div className="bg-white rounded-xl border border-gray-100 p-1 mb-6 flex items-center shadow-sm">
                            <FiSearch className="ml-3 text-gray-300 transform scale-90" />
                            <input
                                type="text"
                                placeholder="Filter courseware by code or title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2.5 bg-transparent border-none focus:ring-0 text-[10px] font-bold text-gray-950 placeholder:text-gray-300"
                            />
                        </div>

                        {enrollments.length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                    <FiBook size={20} className="text-gray-300" />
                                </div>
                                <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest">No Active Enrollments</h3>
                                <p className="text-[9px] text-gray-500 mt-1.5 uppercase tracking-widest font-bold max-w-xs mx-auto">
                                    Register for courses to unlock their academic materials.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-16">
                                {approvedEnrollments.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-4 mb-8">
                                            <h2 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Verified Courseware</h2>
                                            <div className="h-[1px] flex-grow bg-emerald-50"></div>
                                        </div>
                                        <div className="space-y-6">
                                            {approvedEnrollments.map((enrollment) => (
                                                <CourseMaterialCard key={enrollment._id} enrollment={enrollment} isLocked={false} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {pendingEnrollments.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-4 mb-8">
                                            <h2 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em]">System Authorization Pending</h2>
                                            <div className="h-[1px] flex-grow bg-amber-50"></div>
                                        </div>
                                        <div className="space-y-6 opacity-60">
                                            {pendingEnrollments.map((enrollment) => (
                                                <CourseMaterialCard key={enrollment._id} enrollment={enrollment} isLocked={true} />
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Your Borrowed Assets</h2>
                            <div className="h-[1px] flex-grow bg-primary-50"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loans.map((loan) => {
                                const isOverdue = new Date(loan.dueDate) < new Date() && loan.status === 'BORROWED'
                                return (
                                    <div key={loan._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                                        <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full pointer-events-none opacity-20 ${isOverdue ? 'bg-rose-500' : 'bg-primary-500'}`}></div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary-600 border border-gray-100 group-hover:scale-110 transition-transform">
                                                <FiBook size={18} />
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${loan.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                isOverdue ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {loan.status === 'RETURNED' ? 'Returned' : isOverdue ? 'Overdue' : 'Active Loan'}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-950 uppercase mb-1">{loan.bookId?.title}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 mb-6 italic">by {loan.bookId?.author}</p>
                                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Due Date</p>
                                                <p className={`text-[10px] font-black ${isOverdue ? 'text-rose-600' : 'text-gray-950'}`}>{new Date(loan.dueDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300">
                                                <FiClock size={14} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {loans.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">No physical assets currently on loan</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

function CourseMaterialCard({ enrollment, isLocked }: { enrollment: any, isLocked: boolean }) {
    const course = enrollment.courseId
    const materials = course.materials || []

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 border-b border-gray-50 bg-gray-50/20">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all duration-300 shrink-0 ${isLocked ? 'bg-white text-gray-400 border-gray-200' : 'bg-primary-600 text-white border-transparent shadow shadow-primary-900/20'
                        }`}>
                        {course.courseCode}
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-gray-950 uppercase tracking-tight mb-0.5 leading-tight">{course.courseTitle}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{course.creditUnits} Units</span>
                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isLocked ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {isLocked ? 'Awaiting' : 'Verified'}
                            </span>
                        </div>
                    </div>
                </div>
                {isLocked && (
                    <div className="flex items-center self-start md:self-auto gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 shrink-0">
                        <FiClock size={10} className="animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Processing</span>
                    </div>
                )}
            </div>

            {/* Materials Grid */}
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#fcfdfe]/50">
                {materials.length === 0 ? (
                    <div className="col-span-full py-8 text-center bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No materials available yet</p>
                    </div>
                ) : materials.map((material: any, idx: number) => {
                    const getIcon = (type: string) => {
                        switch (type) {
                            case 'VIDEO': return <FiVideo size={14} className="text-gray-400 group-hover/item:text-indigo-600 transition-colors" />
                            case 'LINK': return <FiLink size={14} className="text-gray-400 group-hover/item:text-blue-600 transition-colors" />
                            default: return <FiFileText size={14} className="text-gray-400 group-hover/item:text-primary-600 transition-colors" />
                        }
                    }

                    return (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-all group/item relative">
                            {isLocked && (
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center">
                                    <FiLock className="text-gray-300" size={16} />
                                </div>
                            )}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover/item:border-primary-100 transition-colors shrink-0">
                                        {getIcon(material.type)}
                                    </div>
                                    <h4 className="text-[9px] font-black text-gray-950 uppercase tracking-tight leading-snug group-hover/item:text-primary-600 transition-colors truncate">
                                        {material.title}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-1.5 py-0.5 bg-gray-50 rounded text-[6px] font-black text-gray-400 uppercase border border-gray-100">
                                        {material.type}
                                    </span>
                                    <span className="text-[7px] font-bold text-gray-300 uppercase tracking-widest">
                                        {material.size || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            {!isLocked && (
                                <button
                                    onClick={() => window.open(material.url, '_blank')}
                                    className="w-full py-2 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center gap-1.5 text-[8px] font-black text-gray-400 uppercase tracking-widest hover:bg-primary-600 hover:text-white hover:border-transparent transition-all active:scale-[0.98]"
                                >
                                    {material.type === 'LINK' ? <><FiLink size={10} /> Open Link</> : <><FiDownload size={10} /> View / Download</>}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
