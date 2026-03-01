'use client'

import { useState, useEffect } from 'react'
import { FiAward, FiDownload, FiTrendingUp, FiCheckCircle, FiInfo, FiChevronDown, FiChevronRight, FiStar, FiMessageSquare, FiAlertCircle, FiClock, FiActivity, FiX, FiPrinter, FiFileText, FiLayers } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Enrollment {
    _id: string;
    academicYear: string;
    semester: 'FIRST' | 'SECOND';
    grade: string;
    gradePoint: number;
    totalScore: number;
    midtermScore: number;
    finalScore: number;
    attendanceStatus: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    isCompleted: boolean;
    gradeUploadedAt?: string;
    studentId: any;
    courseId: {
        _id: string;
        courseCode: string;
        courseTitle: string;
        creditUnits: number;
    };
    studentReview?: {
        rating: string;
        comment: string;
    };
    complaint?: {
        message: string;
        status: string;
        createdAt: string;
    };
}

interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    studentDetails?: {
        matricNumber: string;
        department: string;
        level: number;
    }
}

export default function StudentResults() {
    const [groupedResults, setGroupedResults] = useState<Record<string, Record<string, Enrollment[]>>>({})
    const [loading, setLoading] = useState(true)
    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [showComplaintModal, setShowComplaintModal] = useState(false)
    const [showTranscriptModal, setShowTranscriptModal] = useState(false)
    const [profile, setProfile] = useState<ProfileData | null>(null)

    // Evaluation Form State
    const [rating, setRating] = useState('')
    const [comment, setComment] = useState('')

    // Complaint State
    const [complaintMsg, setComplaintMsg] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [resultsRes, profileRes] = await Promise.all([
                axios.get('/api/results'),
                axios.get('/api/profile')
            ])
            setGroupedResults(resultsRes.data)
            setProfile(profileRes.data)
        } catch (error) {
            console.error('Fetch error:', error)
            toast.error('Could not sync academic records')
        } finally {
            setLoading(false)
        }
    }

    const academicYears = Object.keys(groupedResults).sort((a, b) => b.localeCompare(a))

    // CGPA Calculation Logic
    const calculateStats = () => {
        let totalPoints = 0
        let totalUnits = 0
        const semesterHistory: { label: string; gpa: number }[] = []

        const getGradePoint = (grade: string) => {
            switch (grade) {
                case 'A': return 5
                case 'B': return 4
                case 'C': return 3
                case 'D': return 2
                case 'E': return 1
                default: return 0
            }
        }

        // Years are sorted DESC (latest first) for display, but we need chronological for trend
        const chronologicalYears = [...academicYears].reverse()

        chronologicalYears.forEach(year => {
            ['FIRST', 'SECOND'].forEach(semester => {
                const semesterEnrollments = groupedResults[year][semester]
                if (semesterEnrollments && semesterEnrollments.length > 0) {
                    let semPoints = 0
                    let semUnits = 0

                    semesterEnrollments.forEach(en => {
                        const hasGrade = en.grade && en.grade !== 'NG'
                        if (hasGrade) {
                            const points = getGradePoint(en.grade) * (en.courseId.creditUnits || 0)
                            semPoints += points
                            semUnits += (en.courseId.creditUnits || 0)
                            totalPoints += points
                            totalUnits += (en.courseId.creditUnits || 0)
                        }
                    })

                    if (semUnits > 0) {
                        semesterHistory.push({
                            label: `${year.split('/')[0]} S${semester === 'FIRST' ? '1' : '2'}`,
                            gpa: Number((semPoints / semUnits).toFixed(2))
                        })
                    }
                }
            })
        })

        const cgpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00'

        return {
            cgpa,
            totalUnits,
            semesterHistory,
            standing: Number(cgpa) >= 4.5 ? 'First Class' :
                Number(cgpa) >= 3.5 ? '2nd Class Upper' :
                    Number(cgpa) >= 2.5 ? '2nd Class Lower' :
                        Number(cgpa) >= 1.5 ? 'Third Class' : 'Pass'
        }
    }

    const stats = calculateStats()

    const handleCourseClick = (enrollment: Enrollment) => {
        const hasUploadedGrade = enrollment.grade && enrollment.grade !== 'NG'
        const hasReviewed = !!enrollment.studentReview?.rating

        if (hasUploadedGrade && !hasReviewed) {
            setSelectedEnrollment(enrollment)
            setShowReviewModal(true)
        } else {
            setSelectedEnrollment(enrollment)
        }
    }

    const submitReview = async () => {
        if (!rating) return toast.error('Please select a rating')
        if (!selectedEnrollment) return

        try {
            await axios.post(`/api/results/${selectedEnrollment._id}/review`, { rating, comment })
            toast.success('Feedback submitted! Scorecard unlocked.')
            setShowReviewModal(false)
            fetchData()
        } catch (error) {
            toast.error('Submission failed')
        }
    }

    const submitComplaint = async () => {
        if (!complaintMsg) return toast.error('Please enter your complaint')
        if (!selectedEnrollment) return

        try {
            await axios.post(`/api/results/${selectedEnrollment._id}/complaint`, { message: complaintMsg })
            toast.success('Complaint logged. Staff will review soon.')
            setShowComplaintModal(false)
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to log complaint')
        }
    }

    const isComplaintEligible = (enrollment: Enrollment) => {
        if (!enrollment.gradeUploadedAt) return false
        const uploadDate = new Date(enrollment.gradeUploadedAt)
        const now = new Date()
        const diffInDays = (now.getTime() - uploadDate.getTime()) / (1000 * 3600 * 24)
        return diffInDays <= 20 && !enrollment.complaint
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden min-h-screen bg-[#fbfcfd]">
            <main className="max-w-6xl mx-auto px-3 sm:px-5 py-3 pb-20">
                <div className="flex flex-row items-center justify-between gap-3 mb-8">
                    <div>
                        <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em] mb-0.5 font-mono">Archive // Vault</p>
                        <h1 className="text-2xl font-black text-gray-950 tracking-tighter leading-none uppercase">Academic <span className="text-primary-600">Transcript.</span></h1>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">
                            Official grading records by Faculty Board.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowTranscriptModal(true)}
                        className="flex items-center gap-2 bg-gray-950 text-white px-3 py-2 rounded-xl hover:bg-black transition-all shadow-lg font-black uppercase tracking-[0.15em] text-[8px] active:scale-95 group flex-shrink-0"
                    >
                        <FiDownload size={12} className="group-hover:translate-y-0.5 transition-transform" />
                        Transcript
                    </button>
                </div>

                {/* Academic Pulse Dashboard */}
                {academicYears.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                        {/* CGPA Card */}
                        <div className="lg:col-span-1 bg-gray-950 p-6 rounded-[2rem] text-white relative overflow-hidden group shadow-xl shadow-gray-200">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-[60px] group-hover:bg-primary-600/30 transition-colors"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Cumulative Average</p>
                                <div className="flex items-end gap-3 mb-6">
                                    <h2 className="text-6xl font-black tracking-tighter leading-none">{stats.cgpa}</h2>
                                    <span className="text-primary-500 text-xs font-black uppercase tracking-widest mb-2 italic">/ 5.00</span>
                                </div>
                                <div className="flex items-center gap-3 py-2 px-3 bg-white/5 rounded-xl border border-white/10 w-fit">
                                    <FiActivity className="text-primary-500" size={14} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">{stats.standing}</p>
                                </div>
                            </div>
                        </div>

                        {/* Performance Trend */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GPA Trend</p>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Performance Analysis</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{stats.totalUnits} Total Units</p>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Across {stats.semesterHistory.length} Semesters</p>
                                </div>
                            </div>

                            {/* Simple CSS Chart */}
                            <div className="flex items-end justify-between gap-2 h-24 pt-2">
                                {stats.semesterHistory.length === 0 ? (
                                    <div className="w-full flex items-center justify-center h-full">
                                        <p className="text-[10px] font-black text-gray-200 uppercase tracking-widest">Insufficient Data</p>
                                    </div>
                                ) : (
                                    stats.semesterHistory.map((h, i) => (
                                        <div key={i} className="flex-grow flex flex-col items-center gap-2 group/bar">
                                            <div className="relative w-full flex flex-col items-center">
                                                <div
                                                    className="absolute -top-6 bg-gray-950 text-white text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20"
                                                >
                                                    {h.gpa} GPA
                                                </div>
                                                <div
                                                    className="w-full max-w-[40px] bg-gray-50 border border-gray-100 rounded-t-lg transition-all duration-700 relative overflow-hidden group-hover/bar:bg-primary-50 group-hover/bar:border-primary-100"
                                                    style={{ height: `${(h.gpa / 5) * 80}px` }}
                                                >
                                                    <div className="absolute inset-x-0 bottom-0 bg-primary-500/10 group-hover/bar:bg-primary-500/20 transition-colors"></div>
                                                </div>
                                            </div>
                                            <p className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">{h.label}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {academicYears.length === 0 ? (
                    <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <FiAward size={32} className="text-gray-200 mx-auto mb-3" />
                        <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest">No Records Found</h3>
                        <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-[0.15em] font-bold italic">Registration must be approved first.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {academicYears.map(year => (
                            <section key={year} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-[2px] w-6 bg-gray-900"></div>
                                    <h2 className="text-sm font-black text-gray-950 uppercase tracking-tighter">{year} Session</h2>
                                    <div className="h-[1px] flex-grow bg-gray-100"></div>
                                </div>

                                {['FIRST', 'SECOND'].map(semester => (
                                    groupedResults[year][semester]?.length > 0 && (
                                        <div key={semester} className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em] px-2.5 py-1 bg-primary-50 rounded-lg">
                                                    {semester} Semester
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                                                {groupedResults[year][semester].map((enrollment) => (
                                                    <CourseResultCard
                                                        key={enrollment._id}
                                                        enrollment={enrollment}
                                                        onClick={() => handleCourseClick(enrollment)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </section>
                        ))}
                    </div>
                )}
            </main>

            {/* Scorecard Modal */}
            {selectedEnrollment && !showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3">
                    <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => setSelectedEnrollment(null)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-primary-600 uppercase tracking-widest mb-0.5">{selectedEnrollment.courseId.courseCode}</p>
                                <h3 className="text-sm font-black text-gray-950 tracking-tight leading-tight uppercase">{selectedEnrollment.courseId.courseTitle}</h3>
                            </div>
                            <button onClick={() => setSelectedEnrollment(null)} className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Score Breakdown */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Midterm</p>
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                        <p className="text-2xl font-black text-gray-950">{selectedEnrollment.midtermScore || 0}</p>
                                        <p className="text-[7px] font-bold text-gray-400 uppercase mt-0.5 tracking-widest">/ 40%</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Final Exam</p>
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                        <p className="text-2xl font-black text-gray-950">{selectedEnrollment.finalScore || 0}</p>
                                        <p className="text-[7px] font-bold text-gray-400 uppercase mt-0.5 tracking-widest">/ 60%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Aggregated Performance */}
                            <div className="p-4 bg-gray-950 rounded-xl text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/20 blur-3xl rounded-full"></div>
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Aggregate</p>
                                        <p className="text-4xl font-black tracking-tighter">{selectedEnrollment.totalScore}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Grade</p>
                                        <p className="text-4xl font-black text-primary-400">
                                            {selectedEnrollment.attendanceStatus === 'ABSENT' ? 'ABS' : selectedEnrollment.grade}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions & Alerts */}
                            <div className="flex flex-col gap-2">
                                {selectedEnrollment.attendanceStatus === 'ABSENT' && (
                                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600">
                                        <FiAlertCircle size={16} />
                                        <p className="text-[10px] font-black uppercase tracking-tight">Marked ABSENT during examination.</p>
                                    </div>
                                )}

                                {isComplaintEligible(selectedEnrollment) ? (
                                    <button
                                        onClick={() => setShowComplaintModal(true)}
                                        className="w-full py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 font-black uppercase tracking-[0.1em] text-[9px] hover:bg-amber-100 transition-all active:scale-95"
                                    >
                                        Log Grade Complaint
                                    </button>
                                ) : selectedEnrollment.complaint ? (
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Complaint: {selectedEnrollment.complaint.status}</p>
                                        <FiActivity className="text-amber-500 animate-pulse" />
                                    </div>
                                ) : (
                                    <p className="text-center text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                                        Complaint window closed (20-day limit)
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review/Evaluation Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3">
                    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl" onClick={() => setShowReviewModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-5 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-5">
                            <FiActivity size={28} className="text-primary-600 mx-auto mb-3" />
                            <h3 className="text-lg font-black text-gray-950 uppercase tracking-tighter mb-1">Lecturer Feedback</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Grade is locked until evaluation is complete.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Performance Rating</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['POOR', 'FAIR', 'GOOD', 'EXCELLENT'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setRating(r)}
                                            className={`py-3 rounded-xl border text-[8px] font-black uppercase tracking-tight transition-all active:scale-95 ${rating === r ? 'bg-primary-600 border-transparent text-white shadow-lg shadow-primary-900/20' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-primary-100'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Comments (Optional)</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold text-gray-950 focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none"
                                    rows={3}
                                    placeholder="Describe your experience with this course..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>

                            <button
                                onClick={submitReview}
                                className="w-full py-3 bg-gray-950 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-lg active:scale-95"
                            >
                                Unlock Scorecard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complaint Modal */}
            {showComplaintModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3">
                    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" onClick={() => setShowComplaintModal(false)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-2xl p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-3">
                            <h3 className="text-base font-black text-gray-950 uppercase tracking-tight mb-1">Dispute Resolution</h3>
                            <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Limited to 20 days post-upload.</p>
                        </div>

                        <textarea
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs font-bold text-gray-950 focus:ring-2 focus:ring-primary-500/5 focus:border-primary-500 transition-all resize-none mb-3"
                            rows={4}
                            placeholder="State the reason for your complaint..."
                            value={complaintMsg}
                            onChange={(e) => setComplaintMsg(e.target.value)}
                        ></textarea>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowComplaintModal(false)}
                                className="py-3 bg-gray-100 text-gray-500 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitComplaint}
                                className="py-3 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-rose-700 transition-all shadow-lg"
                            >
                                Lodge Complaint
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Transcript Download Modal */}
            {showTranscriptModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" onClick={() => setShowTranscriptModal(false)}></div>
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 flex flex-col gap-6 no-scrollbar">

                        {/* The Printable Page */}
                        <div id="transcript-doc" className="bg-white p-16 shadow-2xl rounded-sm text-gray-950 font-serif border border-gray-200">
                            {/* Letterhead */}
                            <div className="flex justify-between items-start border-b-4 border-gray-950 pb-8 mb-10">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1 font-sans">Nexus University</h2>
                                    <p className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-500">Office of the Registrar // Academic Records</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold uppercase tracking-widest font-sans">Official Transcript</p>
                                    <p className="text-[10px] font-sans text-gray-400 mt-1 italic">Generated: {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Student Metadata */}
                            <div className="grid grid-cols-2 gap-10 mb-12 py-6 bg-gray-50/50 px-8 rounded-xl font-sans">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Full Name</p>
                                    <p className="text-sm font-black uppercase tracking-tight">{profile?.firstName} {profile?.lastName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Department</p>
                                    <p className="text-sm font-black uppercase tracking-tight">{profile?.studentDetails?.department}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Matric Number</p>
                                    <p className="text-sm font-black uppercase tracking-tight">{profile?.studentDetails?.matricNumber}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Level</p>
                                    <p className="text-sm font-black uppercase tracking-tight">{profile?.studentDetails?.level} LEVEL</p>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="space-y-10">
                                {academicYears.map(year => (
                                    <div key={year} className="space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] border-l-4 border-gray-950 pl-4 font-sans">{year} ACADEMIC SESSION</h3>
                                        {['FIRST', 'SECOND'].map(semester => (
                                            groupedResults[year][semester]?.length > 0 && (
                                                <div key={semester}>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3 font-sans">{semester} SEMESTER</p>
                                                    <table className="w-full border-collapse font-sans">
                                                        <thead>
                                                            <tr className="border-b-2 border-gray-200">
                                                                <th className="py-3 text-left text-[9px] font-black uppercase tracking-widest text-gray-500">Course Code</th>
                                                                <th className="py-3 text-left text-[9px] font-black uppercase tracking-widest text-gray-500">Course Title</th>
                                                                <th className="py-3 text-center text-[9px] font-black uppercase tracking-widest text-gray-500">Units</th>
                                                                <th className="py-3 text-right text-[9px] font-black uppercase tracking-widest text-gray-500">Grade</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {groupedResults[year][semester].map(res => (
                                                                <tr key={res._id}>
                                                                    <td className="py-3 text-[10px] font-black">{res.courseId.courseCode}</td>
                                                                    <td className="py-3 text-[10px] font-bold uppercase tracking-tight">{res.courseId.courseTitle}</td>
                                                                    <td className="py-3 text-center text-[10px] font-bold">{res.courseId.creditUnits}</td>
                                                                    <td className="py-3 text-right text-[10px] font-black">{res.grade || 'NG'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Footer Signature */}
                            <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-end font-sans">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
                                        <FiAward className="text-white text-3xl" />
                                    </div>
                                    <div className="opacity-20 flex flex-col gap-1">
                                        <div className="h-1 w-24 bg-gray-950" />
                                        <div className="h-1 w-32 bg-gray-950" />
                                        <div className="h-1 w-20 bg-gray-950" />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest border-b border-gray-950 pb-2">Registrar Signature Case</p>
                                    <p className="text-[8px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Authentication Verified // Blockchain Sec</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Action Controls */}
                        <div className="flex justify-center gap-4 pb-10">
                            <button
                                onClick={() => setShowTranscriptModal(false)}
                                className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all backdrop-blur-md"
                            >
                                Close Preview
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-10 py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-700 hover:scale-105 transition-all shadow-2xl shadow-primary-900/40 flex items-center gap-4"
                            >
                                <FiPrinter size={16} /> Print / Save as PDF
                            </button>
                        </div>
                    </div>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            body > *:not(.fixed) { display: none !important; }
                            .fixed { position: absolute !important; inset: 0 !important; background: white !important; z-index: 9999 !important; overflow: visible !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
                            .fixed > div:first-child { display: none !important; }
                            .fixed > div:last-child { 
                                position: static !important; 
                                margin: 0 !important; 
                                padding: 0 !important; 
                                box-shadow: none !important; 
                                width: 100% !important; 
                                max-width: none !important;
                                height: auto !important;
                                overflow: visible !important;
                                gap: 0 !important;
                                transform: none !important;
                                animation: none !important;
                            }
                            #transcript-doc { 
                                border: none !important; 
                                box-shadow: none !important; 
                                border-radius: 0 !important; 
                                padding: 0.5in !important;
                                width: 100% !important;
                            }
                            .flex.justify-center.gap-4 { display: none !important; }
                            @page { size: portrait; margin: 0; }
                        }
                    ` }} />
                </div>
            )}
        </div>
    )
}

function CourseResultCard({ enrollment, onClick }: { enrollment: Enrollment, onClick: () => void }) {
    const isNG = !enrollment.grade || enrollment.grade === 'NG'
    const isApproved = enrollment.status === 'APPROVED'
    const isPending = enrollment.status === 'PENDING'
    const isLocked = isApproved && (isNG || (enrollment.grade && !enrollment.studentReview?.rating))

    return (
        <div
            onClick={onClick}
            className={`group p-3 rounded-xl border bg-white cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden ${!isApproved ? 'border-gray-50 opacity-75' : 'border-gray-100 hover:border-primary-100'
                }`}
        >
            {/* Status Strip */}
            <div className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-300 ${isPending ? 'bg-amber-200' :
                !isApproved ? 'bg-gray-200' :
                    isNG ? 'bg-indigo-400' :
                        enrollment.grade && !enrollment.studentReview?.rating ? 'bg-amber-400' :
                            enrollment.grade === 'A' || enrollment.grade === 'B' ? 'bg-emerald-500' :
                                enrollment.grade === 'F' ? 'bg-rose-500' : 'bg-primary-500'
                }`}></div>

            {/* Code + Grade row */}
            <div className="flex items-center justify-between mt-1 mb-2">
                <div className={`rounded-lg px-1.5 py-0.5 text-[8px] font-black border transition-all duration-300 ${!isApproved ? 'bg-gray-50 text-gray-300 border-gray-100' : 'bg-white text-gray-700 border-gray-100 group-hover:border-primary-100 group-hover:text-primary-600'
                    }`}>
                    {enrollment.courseId.courseCode}
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm transition-all duration-300 flex-shrink-0 ${isNG || !isApproved ? 'bg-gray-50 text-gray-300 border border-gray-100 italic' :
                    (enrollment.grade && !enrollment.studentReview?.rating) ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                        'bg-gray-950 text-white shadow-md group-hover:scale-105'
                    }`}>
                    {isPending ? 'PR' : (!isApproved ? 'X' : (isNG ? 'EN' : (enrollment.grade && !enrollment.studentReview?.rating ? '?' : (enrollment.attendanceStatus === 'ABSENT' ? 'AB' : enrollment.grade))))}
                </div>
            </div>

            {/* Full course title — no clamp */}
            <h4 className={`text-[10px] font-black uppercase tracking-tight leading-snug transition-colors duration-300 mb-1.5 ${!isApproved ? 'text-gray-400' : 'text-gray-950 group-hover:text-primary-600'
                }`}>
                {enrollment.courseId.courseTitle}
            </h4>

            <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isPending ? 'bg-amber-50 text-amber-600' :
                    !isApproved ? 'bg-gray-50 text-gray-400' :
                        isNG ? 'bg-indigo-50 text-indigo-600' :
                            (enrollment.grade && !enrollment.studentReview?.rating) ? 'bg-amber-50 text-amber-500' :
                                enrollment.isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                    {isPending ? 'Pending Approval' : (!isApproved ? 'Declined' : (isNG ? 'Enrolled' : (enrollment.grade && !enrollment.studentReview?.rating ? 'Evaluate' : (enrollment.isCompleted ? 'Passed' : 'Failed'))))}
                </span>
                <span className="text-[7px] font-bold text-gray-300 uppercase">{enrollment.courseId.creditUnits}u</span>
                {isApproved && !isNG && !enrollment.studentReview?.rating && (
                    <FiStar size={10} className="text-amber-400 animate-pulse" />
                )}
            </div>
        </div>
    )
}
