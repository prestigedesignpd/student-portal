'use client'

import { useState, useEffect } from 'react'
import { FiSave, FiSearch, FiBriefcase, FiUser, FiActivity, FiClock, FiCheckSquare, FiXCircle, FiInfo, FiShield, FiTrendingUp, FiTarget, FiBox, FiCpu, FiDatabase } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminGradesPage() {
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCourseId, setSelectedCourseId] = useState<string>('')
    const [isSaving, setIsSaving] = useState(false)
    const [isAuditing, setIsAuditing] = useState(false)

    // Filter states
    const [courseSearch, setCourseSearch] = useState('')
    const [courseLevel, setCourseLevel] = useState('')
    const [courseDept, setCourseDept] = useState('')

    // Keep track of edited values. Key = enrollmentId
    const [editedGrades, setEditedGrades] = useState<Record<string, { midtermScore: number, finalScore: number, attendanceStatus: string, grade: string }>>({})

    useEffect(() => {
        initData()
    }, [])

    const initData = async () => {
        try {
            const [regRes, courseRes, deptRes] = await Promise.all([
                axios.get('/api/admin/registrations?status=APPROVED&grouped=false'),
                axios.get('/api/admin/courses'),
                axios.get('/api/admin/departments')
            ])
            setEnrollments(regRes.data)
            setCourses(courseRes.data)
            setDepartments(deptRes.data)
        } catch (error) {
            toast.error('Could not load data')
        } finally {
            setLoading(false)
        }
    }

    const fetchRegistrations = async () => {
        try {
            const response = await axios.get('/api/admin/registrations?status=APPROVED&grouped=false')
            setEnrollments(response.data)
        } catch (error) {
            toast.error('Data refresh failed')
        }
    }

    // Filter courses based on search/level/dept
    const filteredCourses = courses.filter(c => {
        const matchesSearch = !courseSearch ||
            c.courseCode.toLowerCase().includes(courseSearch.toLowerCase()) ||
            c.courseTitle.toLowerCase().includes(courseSearch.toLowerCase());
        const matchesLevel = !courseLevel || String(c.level) === courseLevel;
        const matchesDept = !courseDept || c.department === courseDept;
        return matchesSearch && matchesLevel && matchesDept;
    })

    // Find the currently selected course object
    const selectedCourseObj = courses.find(c => c._id === selectedCourseId)

    // Filter enrollments by selected course
    const courseEnrollments = enrollments.filter(e => e.courseId?._id === selectedCourseId)

    // Calculate course stats
    const courseStats = (() => {
        if (!courseEnrollments.length) return { gpa: '0.00', passRate: '0%' }

        let totalPoints = 0
        let passCount = 0

        courseEnrollments.forEach(e => {
            const state = editedGrades[e._id] || { midtermScore: e.midtermScore || 0, finalScore: e.finalScore || 0, attendanceStatus: e.attendanceStatus || 'PRESENT' }
            const total = (state.midtermScore || 0) + (state.finalScore || 0)

            // Simplified GPA calculation
            if (total >= 70) { totalPoints += 5; passCount++ }
            else if (total >= 60) { totalPoints += 4; passCount++ }
            else if (total >= 50) { totalPoints += 3; passCount++ }
            else if (total >= 45) { totalPoints += 2; passCount++ }
            else if (total >= 40) { totalPoints += 1; passCount++ }
        })

        return {
            gpa: (totalPoints / courseEnrollments.length).toFixed(2),
            passRate: ((passCount / courseEnrollments.length) * 100).toFixed(0) + '%'
        }
    })()

    // Initialize editedGrades when course changes
    useEffect(() => {
        const initialStates: Record<string, any> = {}
        courseEnrollments.forEach(e => {
            if (!editedGrades[e._id]) {
                initialStates[e._id] = {
                    midtermScore: e.midtermScore || 0,
                    finalScore: e.finalScore || 0,
                    attendanceStatus: e.attendanceStatus || 'PRESENT',
                    grade: e.grade || ''
                }
            }
        })
        if (Object.keys(initialStates).length > 0) {
            setEditedGrades(prev => ({ ...prev, ...initialStates }))
        }
    }, [selectedCourseId, courseEnrollments])

    const handleGradeChange = (enrollmentId: string, field: string, value: any) => {
        setEditedGrades(prev => ({
            ...prev,
            [enrollmentId]: {
                ...prev[enrollmentId],
                [field]: value
            }
        }))
    }

    const saveBatchGrades = async () => {
        setIsSaving(true)
        setIsAuditing(true)
        try {
            // Convert editedGrades dictionary to an array for the API
            const updates = Object.entries(editedGrades)
                .filter(([id]) => courseEnrollments.some(e => e._id === id)) // Only send updates for currently viewed course
                .map(([enrollmentId, data]) => ({
                    enrollmentId,
                    ...data
                }))

            if (updates.length === 0) {
                toast.error('No score adjustments detected')
                setIsSaving(false)
                setIsAuditing(false)
                return
            }

            const res = await axios.post('/api/admin/grades/batch', { updates })
            toast.success('Grades saved successfully')
            fetchRegistrations() // Refresh to get recalculated grades
        } catch (error) {
            toast.error('Failed to save grades')
        } finally {
            setTimeout(() => {
                setIsSaving(false)
                setIsAuditing(false)
            }, 1000)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-rose-500/10 border-t-rose-500 rounded-full animate-spin shadow-[0_0_30px_rgba(244,63,94,0.2)]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden">
            {/* Background System Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                {/* Grades Command Header */}
                <div className="bg-[#0a0a0b] rounded-[3rem] p-12 mb-12 shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 blur-[150px] pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-2.5 h-2.5 rounded-full ${isAuditing ? 'bg-amber-500 animate-ping' : 'bg-rose-500 animate-pulse'} shadow-[0_0_15px_#f43f5e]`}></div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">
                                    {isAuditing ? 'Saving grades...' : 'Manage Grades'}
                                </p>
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-6">Manage <span className="text-rose-500 italic">Grades</span></h1>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <FiTrendingUp className="text-rose-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Course GPA: {courseStats.gpa}</span>
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <FiTarget className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Success Rate: {courseStats.passRate}</span>
                                </div>
                            </div>
                        </div>

                        {selectedCourseId && courseEnrollments.length > 0 && (
                            <button
                                onClick={saveBatchGrades}
                                disabled={isSaving}
                                className="bg-rose-600 text-white px-10 py-5 rounded-2xl hover:bg-rose-500 transition-all shadow-[0_15px_40px_rgba(244,63,94,0.3)] font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 group flex items-center gap-4 border border-rose-400/20 disabled:opacity-50"
                            >
                                {isSaving ? <FiClock className="animate-spin" /> : <FiSave className="group-hover:rotate-12 transition-transform" />} Save All Grades
                            </button>
                        )}
                    </div>
                </div>

                {/* Audit Configuration */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 mb-12 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Filter Catalog</label>
                            <div className="relative">
                                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-black" />
                                <input
                                    type="text"
                                    placeholder="Search by Code..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-16 pr-8 py-5 text-sm font-black focus:ring-4 focus:ring-rose-500/5 transition-all outline-none placeholder:text-gray-300 uppercase tracking-tight"
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Academic Level</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-[10px] font-black uppercase tracking-widest outline-none transition-all"
                                value={courseLevel}
                                onChange={(e) => setCourseLevel(e.target.value)}
                            >
                                <option value="">All Levels</option>
                                <option value="100">100 Level</option>
                                <option value="200">200 Level</option>
                                <option value="300">300 Level</option>
                                <option value="400">400 Level</option>
                                <option value="500">500 Level</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Department</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-[10px] font-black uppercase tracking-widest outline-none transition-all"
                                value={courseDept}
                                onChange={(e) => setCourseDept(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {departments.map((d: any) => (
                                    <option key={d._id} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="h-[1px] bg-gray-50 my-10 relative z-10"></div>

                    <div className="space-y-3 relative z-10">
                        <label className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] pl-2 mb-2 block">Select Course to Grade</label>
                        <select
                            className="w-full bg-[#0a0a0b] border border-white/5 rounded-2xl px-8 py-6 text-xs font-black outline-none focus:ring-4 focus:ring-rose-500/10 transition-all text-white uppercase tracking-widest"
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                        >
                            <option value="">-- SELECT COURSE --</option>
                            {filteredCourses.map((c: any) => (
                                <option key={c._id} value={c._id}>{c.courseCode} // {c.courseTitle} // {c.level}Level</option>
                            ))}
                        </select>
                    </div>
                </div>

                {!selectedCourseId ? (
                    <div className="py-32 text-center bg-white border border-gray-100 rounded-[3rem] shadow-sm">
                        <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                            <FiShield size={32} className="text-rose-500" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Awaiting Course Selection</h3>
                        <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-[0.2em] font-black italic">Select a course above to begin grading.</p>
                    </div>
                ) : courseEnrollments.length === 0 ? (
                    <div className="py-32 text-center bg-white border border-gray-100 rounded-[3rem] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                            <FiActivity size={32} className="text-amber-500" />
                        </div>
                        <h3 className="text-xl font-black text-gray-950 uppercase tracking-tighter">{selectedCourseObj?.courseCode} // {selectedCourseObj?.courseTitle}</h3>
                        <p className="text-[10px] text-gray-500 mt-3 uppercase tracking-[0.2em] font-black">No active students found in this course.</p>
                        <div className="mt-8 flex justify-center">
                            <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                <span className="text-[8px] font-black text-amber-600 uppercase tracking-[0.3em]">Waiting For Enrollments</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-2xl relative">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#0a0a0b] border-b border-white/5">
                                    <th className="p-10 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Student Name</th>
                                    <th className="p-10 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-center">Midterm (40)</th>
                                    <th className="p-10 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-center">Final Exam (60)</th>
                                    <th className="p-10 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-center">Attendance</th>
                                    <th className="p-10 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-center">Total Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {courseEnrollments.map((e) => {
                                    const state = editedGrades[e._id] || { midtermScore: e.midtermScore || 0, finalScore: e.finalScore || 0, attendanceStatus: e.attendanceStatus || 'PRESENT' }
                                    const isEdited =
                                        state.midtermScore !== (e.midtermScore || 0) ||
                                        state.finalScore !== (e.finalScore || 0) ||
                                        state.attendanceStatus !== (e.attendanceStatus || 'PRESENT')

                                    const total = (state.midtermScore || 0) + (state.finalScore || 0);
                                    const getGrade = (s: number) => {
                                        if (state.attendanceStatus === 'ABSENT') return 'NG';
                                        if (s >= 70) return 'A';
                                        if (s >= 60) return 'B';
                                        if (s >= 50) return 'C';
                                        if (s >= 45) return 'D';
                                        if (s >= 40) return 'E';
                                        return 'F';
                                    };
                                    const grade = getGrade(total);

                                    return (
                                        <tr key={e._id} className={`group transition-all ${isEdited ? 'bg-rose-50/10' : 'hover:bg-gray-50/50'}`}>
                                            <td className="p-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                                                        <FiUser size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-black text-gray-950 uppercase tracking-tighter leading-none group-hover:text-rose-600 transition-colors">{e.studentId.fullName}</h3>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Matric No: {e.studentId.studentId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10 text-center">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="number"
                                                        max={40}
                                                        min={0}
                                                        className={`w-28 bg-gray-50 border-2 ${isEdited ? 'border-rose-200 focus:border-rose-400' : 'border-gray-100 focus:border-gray-300'} rounded-2xl p-4 text-sm font-black text-center outline-none transition-all focus:bg-white focus:shadow-xl`}
                                                        value={state.midtermScore}
                                                        onChange={(ev) => handleGradeChange(e._id, 'midtermScore', Number(ev.target.value))}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-10 text-center">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="number"
                                                        max={60}
                                                        min={0}
                                                        className={`w-28 bg-gray-50 border-2 ${isEdited ? 'border-rose-200 focus:border-rose-400' : 'border-gray-100 focus:border-gray-300'} rounded-2xl p-4 text-sm font-black text-center outline-none transition-all focus:bg-white focus:shadow-xl`}
                                                        value={state.finalScore}
                                                        onChange={(ev) => handleGradeChange(e._id, 'finalScore', Number(ev.target.value))}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-10 text-center">
                                                <div className="flex justify-center">
                                                    <select
                                                        className={`bg-gray-50 border-2 ${isEdited ? 'border-rose-200 focus:border-rose-400' : 'border-gray-100 focus:border-gray-300'} rounded-[1.2rem] px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:bg-white`}
                                                        value={state.attendanceStatus}
                                                        onChange={(ev) => handleGradeChange(e._id, 'attendanceStatus', ev.target.value)}
                                                    >
                                                        <option value="PRESENT">Present</option>
                                                        <option value="ABSENT">Absent</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="p-10 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 transition-all shadow-xl shadow-gray-200/50 ${grade === 'A' || grade === 'B' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        grade === 'F' || grade === 'NG' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                        {grade === 'NG' ? '!!' : grade}
                                                    </span>
                                                    {isEdited && (
                                                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Modified</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-16 p-10 bg-[#0a0a0b] rounded-[3rem] flex items-start gap-8 shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] pointer-events-none"></div>
                    <FiInfo className="text-amber-500 mt-1 shrink-0" size={28} />
                    <div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-3">Grading System Notice</h4>
                        <p className="text-[11px] text-gray-500 font-bold leading-relaxed max-w-2xl uppercase tracking-[0.1em]">
                            Score adjustments are not permanent until the <span className="text-rose-500">Save All Grades</span> button is clicked. Saving grades will update global course GPA and notify students of their results.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
