'use client'

import { useState, useEffect } from 'react'
import { FiCheck, FiX, FiUser, FiBook, FiClock, FiActivity, FiShield, FiAlertTriangle, FiSearch, FiChevronRight, FiCheckCircle, FiMinusCircle } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Enrollment {
    _id: string;
    courseId: {
        _id: string;
        courseCode: string;
        courseTitle: string;
        creditUnits: number;
    };
    status: string;
}

interface StudentGroup {
    student: {
        _id: string;
        matricNumber: string;
        level: number;
        department: string;
        userId: {
            firstName: string;
            lastName: string;
            avatar?: string;
        };
    };
    enrollments: Enrollment[];
    totalCredits: number;
}

export default function AdminRegistrationsPage() {
    const [groups, setGroups] = useState<StudentGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>([])
    const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null)
    const [isActionLoading, setIsActionLoading] = useState(false)

    useEffect(() => {
        fetchRegistrations()
    }, [activeTab])

    const toggleSelection = (id: string) => {
        setSelectedEnrollmentIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleAll = () => {
        if (!selectedGroup) return
        const pendingCount = selectedGroup.enrollments.length
        if (selectedEnrollmentIds.length === pendingCount) {
            setSelectedEnrollmentIds([])
        } else {
            setSelectedEnrollmentIds(selectedGroup.enrollments.map(e => e._id))
        }
    }

    const fetchRegistrations = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/admin/registrations?status=${activeTab}`)
            setGroups(response.data)
        } catch (error) {
            console.error('Fetch registration error:', error)
            toast.error('Could not fetch registrations')
        } finally {
            setLoading(false)
        }
    }

    const filteredGroups = groups.filter(group => {
        const studentName = `${group.student.userId.firstName} ${group.student.userId.lastName}`.toLowerCase()
        const matric = group.student.matricNumber.toLowerCase()
        const query = searchQuery.toLowerCase()
        return studentName.includes(query) || matric.includes(query)
    })

    const handleBatchAction = async (action: 'APPROVED' | 'REJECTED') => {
        if (selectedEnrollmentIds.length === 0) {
            toast.error('Please select at least one course')
            return
        }

        try {
            setIsActionLoading(true)
            await axios.post('/api/admin/registrations', {
                enrollmentIds: selectedEnrollmentIds,
                action
            })
            toast.success(`Selection ${action.toLowerCase()} successfully`)

            // If we didn't process ALL courses, just refresh and keep modal?
            // Actually, for better UX, let's just close and refresh.
            setSelectedGroup(null)
            setSelectedEnrollmentIds([])
            fetchRegistrations()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Action failed')
        } finally {
            setIsActionLoading(false)
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
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]"></span>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Academic Governance</p>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Review <span className="text-gray-400 font-medium italic">Station</span></h1>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative flex-grow max-w-md group">
                        <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-rose-500/5 focus:border-rose-100 outline-none transition-all text-[11px] font-bold text-gray-900 placeholder:text-gray-300 uppercase tracking-wide shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {filteredGroups.length === 0 ? (
                    <div className="py-24 text-center bg-white border border-gray-100 rounded-[2.5rem] shadow-sm animate-in fade-in zoom-in-95 duration-700">
                        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FiShield size={28} className="text-rose-500 opacity-50" />
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Clear Records</h3>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold">No {activeTab.toLowerCase()} requests found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGroups.map((group) => (
                            <div
                                key={group.student._id}
                                onClick={() => {
                                    setSelectedGroup(group)
                                    setSelectedEnrollmentIds(group.enrollments.map(e => e._id)) // Default select all
                                }}
                                className="p-8 rounded-[2.5rem] bg-white border border-gray-100 hover:border-rose-200 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden shadow-sm cursor-pointer active:scale-95"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 blur-[50px] rounded-full group-hover:bg-rose-50 transition-colors"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-rose-500 shadow-sm overflow-hidden group-hover:bg-white transition-colors">
                                            {group.student.userId.avatar ? (
                                                <img src={group.student.userId.avatar} alt="Student" className="w-full h-full object-cover" />
                                            ) : (
                                                <FiUser size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight leading-tight">
                                                {group.student.userId.firstName} {group.student.userId.lastName}
                                            </h3>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1.5">{group.student.matricNumber}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-white transition-colors text-center">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Level</p>
                                            <p className="text-xs font-black text-gray-900">{group.student.level}L</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-white transition-colors text-center">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Unit</p>
                                            <p className="text-xs font-black text-rose-600">{group.totalCredits}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${activeTab === 'PENDING' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}></span>
                                            <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">
                                                {activeTab === 'PENDING' ? `${group.enrollments.length} Pending Courses` : 'Reviewed Record'}
                                            </span>
                                        </div>
                                        <FiChevronRight className="text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Review Modal */}
            {selectedGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setSelectedGroup(null)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 border border-gray-100">
                        {/* Modal Header */}
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-50">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-rose-500 shadow-sm overflow-hidden">
                                    {selectedGroup.student.userId.avatar ? (
                                        <img src={selectedGroup.student.userId.avatar} alt="Student" className="w-full h-full object-cover" />
                                    ) : (
                                        <FiUser size={28} />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-2">
                                        {selectedGroup.student.userId.firstName} {selectedGroup.student.userId.lastName}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 uppercase tracking-widest italic">{selectedGroup.student.matricNumber}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{selectedGroup.student.department} • {selectedGroup.student.level}L</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedGroup(null)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all">
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8 px-1">
                                <div className="flex items-center gap-4">
                                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <FiBook className="text-rose-500" /> Courses Requested
                                    </h4>
                                    {activeTab === 'PENDING' && (
                                        <button
                                            onClick={toggleAll}
                                            className="text-[9px] font-black text-rose-500 hover:bg-rose-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-rose-100 transition-colors"
                                        >
                                            {selectedEnrollmentIds.length === selectedGroup.enrollments.length ? 'Unselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    Total Load: <span className="text-rose-600 font-black">{selectedGroup.totalCredits} Units</span>
                                </div>
                            </div>

                            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedGroup.enrollments.map((enrollment) => (
                                    <div
                                        key={enrollment._id}
                                        onClick={() => activeTab === 'PENDING' && toggleSelection(enrollment._id)}
                                        className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${selectedEnrollmentIds.includes(enrollment._id)
                                            ? 'bg-rose-50 border-rose-200 shadow-sm'
                                            : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            {activeTab === 'PENDING' && (
                                                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedEnrollmentIds.includes(enrollment._id)
                                                    ? 'bg-rose-500 border-rose-500 text-white'
                                                    : 'bg-white border-gray-200'
                                                    }`}>
                                                    {selectedEnrollmentIds.includes(enrollment._id) && <FiCheck size={12} strokeWidth={4} />}
                                                </div>
                                            )}
                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-gray-950 shadow-sm shrink-0">
                                                {enrollment.courseId.courseCode.slice(0, 3)}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{enrollment.courseId.courseTitle}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{enrollment.courseId.courseCode} • {enrollment.courseId.creditUnits} Units</p>
                                            </div>
                                        </div>

                                        {activeTab !== 'PENDING' && (
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${enrollment.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                                }`}>
                                                {enrollment.status}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {activeTab === 'PENDING' && (
                                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
                                    <button
                                        disabled={isActionLoading || selectedEnrollmentIds.length === 0}
                                        onClick={() => handleBatchAction('REJECTED')}
                                        className="py-5 rounded-3xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
                                    >
                                        <FiMinusCircle size={16} /> Reject ({selectedEnrollmentIds.length})
                                    </button>
                                    <button
                                        disabled={isActionLoading || selectedEnrollmentIds.length === 0}
                                        onClick={() => handleBatchAction('APPROVED')}
                                        className="py-5 rounded-3xl bg-gray-900 text-white hover:bg-gray-800 transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-black/10 active:scale-95 disabled:opacity-30"
                                    >
                                        <FiCheckCircle size={16} /> Approve ({selectedEnrollmentIds.length})
                                    </button>
                                </div>
                            )}

                            {activeTab !== 'PENDING' && (
                                <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-relaxed">
                                        This registration record has been <span className={activeTab === 'APPROVED' ? 'text-emerald-500' : 'text-rose-500'}>{activeTab.toLowerCase()}</span>. <br />
                                        Contact Academic IT for modification logs.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
