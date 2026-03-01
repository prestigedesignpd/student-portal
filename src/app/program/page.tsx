'use client'

import { useState, useEffect } from 'react'
import { FiBookOpen, FiClock, FiLayers, FiCalendar, FiChevronDown, FiChevronRight, FiCheckCircle, FiAlertCircle, FiActivity } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ProgramStructurePage() {
    const [curriculum, setCurriculum] = useState<any[]>([])
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedLevels, setExpandedLevels] = useState<number[]>([100, 200, 300, 400, 500])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [curriculumRes, myCoursesRes] = await Promise.all([
                axios.get('/api/curriculum'),
                axios.get('/api/courses/my-courses')
            ])
            setCurriculum(curriculumRes.data)
            setEnrollments(myCoursesRes.data)
        } catch (error) {
            console.error('Fetch data error:', error)
            toast.error('Could not load program data')
        } finally {
            setLoading(false)
        }
    }

    const toggleLevel = (level: number) => {
        if (expandedLevels.includes(level)) {
            setExpandedLevels(expandedLevels.filter(l => l !== level))
        } else {
            setExpandedLevels([...expandedLevels, level])
        }
    }

    const getCourseStatus = (courseId: string) => {
        const enrollment = enrollments.find(e =>
            (e.courseId._id || e.courseId) === courseId
        )
        if (!enrollment) return 'UNTAKEN'
        if (enrollment.isCompleted) return 'PASSED'
        if (enrollment.grade === 'F') return 'FAILED'
        if (enrollment.status === 'PENDING' || enrollment.status === 'APPROVED') return 'ONGOING'
        return 'UNTAKEN'
    }

    // Status → text color for the course title (the main identifier)
    const statusTitleColor = (status: string) => {
        if (status === 'PASSED') return 'text-emerald-600'
        if (status === 'FAILED') return 'text-rose-500'
        if (status === 'ONGOING') return 'text-amber-500'
        return 'text-gray-500'   // UNTAKEN
    }

    // Status → small left-border accent color
    const statusBorderColor = (status: string) => {
        if (status === 'PASSED') return 'border-l-emerald-400'
        if (status === 'FAILED') return 'border-l-rose-400'
        if (status === 'ONGOING') return 'border-l-amber-400'
        return 'border-l-gray-200'
    }

    // Status → code badge styling
    const statusCodeStyle = (status: string) => {
        if (status === 'PASSED') return 'bg-emerald-50 text-emerald-600 border-emerald-100'
        if (status === 'FAILED') return 'bg-rose-50 text-rose-500 border-rose-100'
        if (status === 'ONGOING') return 'bg-amber-50 text-amber-600 border-amber-100'
        return 'bg-gray-50 text-gray-400 border-gray-100'
    }

    const groupedCurriculum = curriculum.reduce((acc: any, course: any) => {
        const level = course.level
        if (!acc[level]) {
            acc[level] = { FIRST: [], SECOND: [] }
        }
        acc[level][course.semester].push(course)
        return acc
    }, {})

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    const levels = Object.keys(groupedCurriculum).sort((a: any, b: any) => a - b).map(Number)
    const passedCount = curriculum.filter(c => getCourseStatus(c._id) === 'PASSED').length

    return (
        <div className="relative overflow-hidden bg-[#fbfcfd] min-h-screen">
            <main className="max-w-5xl mx-auto px-3 sm:px-5 py-4 pb-20 md:pb-10">

                {/* Page Header */}
                <div className="flex flex-row items-center justify-between gap-3 mb-5">
                    <div>
                        <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em] mb-0.5">Curriculum / Roadmap</p>
                        <h1 className="text-2xl font-black text-gray-950 tracking-tighter leading-none">Program Structure</h1>
                        <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">B.Sc. Computer Science</p>
                    </div>
                    {/* Progress chip */}
                    <div className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-sm">
                            <FiActivity size={14} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Progress</p>
                            <p className="text-sm font-black text-gray-950 leading-none">{passedCount}<span className="text-[10px] text-gray-400 font-bold">/{curriculum.length}</span></p>
                        </div>
                    </div>
                </div>

                {/* Color Legend */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {[
                        { label: 'Passed', color: 'text-emerald-600', dot: 'bg-emerald-400' },
                        { label: 'Ongoing', color: 'text-amber-500', dot: 'bg-amber-400' },
                        { label: 'Failed', color: 'text-rose-500', dot: 'bg-rose-400' },
                        { label: 'Untaken', color: 'text-gray-400', dot: 'bg-gray-300' },
                    ].map(s => (
                        <div key={s.label} className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${s.dot}`}></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${s.color}`}>{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    {levels.map((level) => (
                        <div key={level} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                            {/* Level accordion header */}
                            <button
                                onClick={() => toggleLevel(level)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-950 flex flex-col items-center justify-center border border-gray-100 shadow-inner flex-shrink-0">
                                        <span className="text-sm font-black leading-none">{level}</span>
                                        <span className="text-[6px] font-bold uppercase tracking-widest mt-0.5">Lvl</span>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-[11px] font-black text-gray-950 uppercase tracking-widest leading-none mb-1">Academic Roadmap</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                {groupedCurriculum[level].FIRST.length + groupedCurriculum[level].SECOND.length} Courses
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                                            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">
                                                {curriculum.filter(c => c.level === level && getCourseStatus(c._id) === 'PASSED').length} Done
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 transition-transform duration-300 ${expandedLevels.includes(level) ? 'rotate-180' : ''}`}>
                                    <FiChevronDown size={15} />
                                </div>
                            </button>

                            {expandedLevels.includes(level) && (
                                <div className="px-3 pb-3 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                    {['FIRST', 'SECOND'].map((semester) => (
                                        groupedCurriculum[level][semester].length > 0 && (
                                            <div key={semester}>
                                                {/* Semester label */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">{semester} SEM</span>
                                                    <div className="h-[1px] flex-grow bg-gray-100"></div>
                                                </div>

                                                {/* Course list — 2 cols on mobile */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {groupedCurriculum[level][semester].map((course: any) => {
                                                        const status = getCourseStatus(course._id)
                                                        return (
                                                            <div
                                                                key={course._id}
                                                                className={`flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50/60 border border-l-[3px] border-gray-100/80 hover:bg-white hover:shadow-sm transition-all duration-200 ${statusBorderColor(status)}`}
                                                            >
                                                                {/* Code badge */}
                                                                <div className={`flex-shrink-0 rounded-lg px-1.5 py-1 text-[8px] font-black border leading-none text-center min-w-[3rem] ${statusCodeStyle(status)}`}>
                                                                    {course.courseCode}
                                                                </div>

                                                                {/* Title + meta — full name, no clamp */}
                                                                <div className="flex-grow min-w-0">
                                                                    <p className={`text-[10px] font-black uppercase tracking-tight leading-snug ${statusTitleColor(status)}`}>
                                                                        {course.courseTitle}
                                                                    </p>
                                                                    <p className="text-[8px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                                                                        {course.creditUnits}u
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Progress Summary */}
                <div className="mt-6 p-5 rounded-2xl bg-gray-950 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[80px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black tracking-tight leading-none mb-1">Your Academic <span className="text-primary-500">Journey.</span></h2>
                            <p className="text-gray-400 text-[10px] font-medium leading-relaxed max-w-xs">
                                Roadmap updates in real-time as you complete courses.
                            </p>
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center min-w-[70px]">
                                <p className="text-[7px] font-black text-primary-400 uppercase tracking-widest mb-1">Done</p>
                                <p className="text-xl font-black text-white">{Math.round((passedCount / (curriculum.length || 1)) * 100)}%</p>
                            </div>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center min-w-[70px]">
                                <p className="text-[7px] font-black text-rose-400 uppercase tracking-widest mb-1">Backlogs</p>
                                <p className="text-xl font-black text-white">{curriculum.filter(c => getCourseStatus(c._id) === 'FAILED').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}
