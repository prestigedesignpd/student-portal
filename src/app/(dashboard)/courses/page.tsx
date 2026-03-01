'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiBookOpen, FiClock, FiCheckCircle, FiMinusCircle, FiPlusCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi'
import { getEligibleCourses, registerCourse } from '@/services/courseService'
import toast from 'react-hot-toast'
import type { Course } from '@/types/student'

export default function CoursesPage() {
    const [courses, setCourses] = useState<(Course & { isCarryOver: boolean })[]>([])
    const [filteredCourses, setFilteredCourses] = useState<(Course & { isCarryOver: boolean })[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [cart, setCart] = useState<(Course & { isCarryOver: boolean })[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [blockReason, setBlockReason] = useState<string | null>(null)

    const MAX_CREDITS = 24

    useEffect(() => {
        fetchEligibleCourses()
    }, [])

    useEffect(() => {
        filterCourses()
    }, [searchTerm, courses])

    const fetchEligibleCourses = async () => {
        try {
            const data = await getEligibleCourses()
            setCourses(data)
            setFilteredCourses(data)
            setBlockReason(null)
        } catch (error: any) {
            if (error.response?.status === 403) {
                setBlockReason(error.response.data.reason)
            } else {
                toast.error('Could not load eligible courses')
            }
        } finally {
            setLoading(false)
        }
    }

    const filterCourses = () => {
        let filtered = courses
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        setFilteredCourses(filtered)
    }

    const currentCredits = cart.reduce((sum, c) => sum + c.creditUnits, 0)

    const handleToggleCart = (course: Course & { isCarryOver: boolean }) => {
        const isInCart = cart.find(c => c._id === course._id)
        if (isInCart) {
            setCart(cart.filter(c => c._id !== course._id))
        } else {
            if (currentCredits + course.creditUnits > MAX_CREDITS) {
                toast.error(`Credit limit exceeded! (Max ${MAX_CREDITS} units)`)
                return
            }
            setCart([...cart, course])
        }
    }

    const handleRegister = async () => {
        if (cart.length === 0) return

        setIsSubmitting(true)
        try {
            const courseIds = cart.map(c => c._id as string)
            await registerCourse(courseIds)
            toast.success('Registration submitted for approval!')
            setCart([])
            fetchEligibleCourses() // Refresh to show pending status if needed (or just removal)
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Registration failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    const coreCourses = filteredCourses.filter(c => !c.isCarryOver)
    const carryOverCourses = filteredCourses.filter(c => c.isCarryOver)

    return (
        <div className="relative overflow-hidden min-h-screen">
            <main className="max-w-6xl mx-auto px-3 sm:px-5 py-3 pb-20 md:pb-10">
                <div className="mb-4">
                    <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em] mb-0.5">Academic / Enrollment</p>
                    <h1 className="text-2xl font-black text-gray-950 tracking-tight leading-none">Course Registration</h1>
                    <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">First Semester • Selection Window Open</p>
                </div>

                {blockReason && (
                    <div className="mb-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 border ${blockReason === 'PENDING' ? 'bg-primary-50 border-primary-100' : 'bg-rose-50 border-rose-100'
                            }`}>
                            {blockReason === 'PENDING' ? <FiClock size={18} className="text-primary-600" /> : <FiAlertCircle size={18} className="text-rose-500" />}
                        </div>
                        <h2 className="text-base font-black text-gray-900 uppercase tracking-tight mb-1">
                            {blockReason === 'CLOSED' ? 'Registration Window Closed' :
                                blockReason === 'PENDING' ? 'Registration Pending Review' : 'Financial Hold Active'}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] max-w-sm mx-auto leading-relaxed">
                            {blockReason === 'CLOSED'
                                ? 'The selection window for the current semester is officially closed by the faculty board.'
                                : blockReason === 'PENDING'
                                    ? 'Your course list has been submitted and is currently awaiting approval from the academic officer. You cannot modify it at this time.'
                                    : 'Tuition payment for the current academic session must be verified prior to course enrollment.'}
                        </p>
                    </div>
                )}

                {/* Registration Overview Strip */}
                {!blockReason && (
                    <div className={`sticky top-2 z-40 mb-3 p-2.5 rounded-xl border transition-all duration-500 shadow-lg ${currentCredits > 0 ? 'bg-gray-950 text-white border-transparent' : 'bg-white text-gray-950 border-gray-100'
                        }`}>
                        <div className="flex flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${currentCredits > 0 ? 'bg-primary-600' : 'bg-gray-100'
                                    }`}>
                                    <FiBookOpen size={13} className={currentCredits > 0 ? 'text-white' : 'text-gray-400'} />
                                </div>
                                <div>
                                    <h2 className={`text-[10px] font-black uppercase tracking-tight ${currentCredits > 0 ? 'text-white' : 'text-gray-900'}`}>
                                        {cart.length} Selected
                                    </h2>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-20 sm:w-32 h-0.5 bg-white/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-500 transition-all duration-500"
                                                style={{ width: `${(currentCredits / MAX_CREDITS) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-[8px] font-bold uppercase ${currentCredits >= 20 ? 'text-amber-400' : 'text-gray-400'
                                            }`}>
                                            {currentCredits}/{MAX_CREDITS}u
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleRegister}
                                disabled={cart.length === 0 || isSubmitting}
                                className={`px-3 py-1.5 rounded-lg font-black uppercase tracking-[0.1em] text-[8px] flex items-center gap-1 transition-all active:scale-95 flex-shrink-0 ${cart.length > 0
                                    ? 'bg-primary-600 text-white hover:bg-primary-500'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? '...' : 'Register'}
                                <FiArrowRight size={10} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="mb-4">
                    <div className="relative group">
                        <FiSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by code or title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all font-bold text-gray-900 text-[11px] placeholder:text-gray-300"
                        />
                    </div>
                </div>

                {!blockReason ? (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Carry-overs Section */}
                        {carryOverCourses.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-[1px] flex-grow bg-rose-100"></div>
                                    <h2 className="text-[9px] font-black text-rose-600 uppercase tracking-[0.3em] flex items-center gap-1">
                                        <FiAlertCircle size={9} /> Carry-overs
                                    </h2>
                                    <div className="h-[1px] flex-grow bg-rose-100"></div>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                    {carryOverCourses.map((course) => (
                                        <CourseCard
                                            key={course._id as string}
                                            course={course}
                                            isSelected={!!cart.find(c => c._id === course._id)}
                                            onToggle={() => handleToggleCart(course)}
                                            isCarryOver
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Core Courses Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-[1px] flex-grow bg-gray-100"></div>
                                <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Core Courses</h2>
                                <div className="h-[1px] flex-grow bg-gray-100"></div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {coreCourses.map((course) => (
                                    <CourseCard
                                        key={course._id as string}
                                        course={course}
                                        isSelected={!!cart.find(c => c._id === course._id)}
                                        onToggle={() => handleToggleCart(course)}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 opacity-50 grayscale transition-all duration-700">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                            <FiBookOpen size={24} className="text-gray-300" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Registration List Locked</p>
                    </div>
                )}
            </main>
        </div>
    )
}

function CourseCard({ course, isSelected, onToggle, isCarryOver = false }: {
    course: Course,
    isSelected: boolean,
    onToggle: () => void,
    isCarryOver?: boolean
}) {
    return (
        <div
            onClick={onToggle}
            className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden ${isSelected
                ? 'bg-primary-600 border-transparent shadow-md shadow-primary-900/10'
                : 'bg-white border-gray-100 hover:border-primary-100'
                }`}
        >
            {isCarryOver && !isSelected && (
                <div className="absolute top-0 right-0 py-0.5 px-2 bg-rose-50 border-b border-l border-rose-100 rounded-bl-md">
                    <p className="text-[6px] font-black text-rose-600 uppercase tracking-widest">O/S</p>
                </div>
            )}

            <div className="flex items-start justify-between mb-2">
                <div className={`rounded-lg flex items-center justify-center text-[8px] font-black transition-colors leading-none text-center px-1.5 py-1 ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-700 border border-gray-100 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100'
                    }`}>
                    {course.courseCode}
                </div>
                <div className={`transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {isSelected
                        ? <FiCheckCircle size={14} className="text-white" />
                        : <FiPlusCircle size={14} className="text-gray-300 group-hover:text-primary-600" />
                    }
                </div>
            </div>

            <div>
                <h3 className={`text-[10px] font-black tracking-tight leading-tight uppercase line-clamp-2 ${isSelected ? 'text-white' : 'text-gray-950'
                    }`}>
                    {course.courseTitle}
                </h3>
                <div className={`flex items-center gap-2 mt-2 pt-2 border-t ${isSelected ? 'border-white/10 text-white/60' : 'border-gray-50 text-gray-400'
                    }`}>
                    <span className="text-[8px] uppercase tracking-wide flex items-center gap-1 font-bold">
                        <FiClock size={8} /> {course.creditUnits}u
                    </span>
                    <span className="text-[8px] uppercase tracking-wide flex items-center gap-1 font-bold">
                        <FiLayers size={8} /> {course.level}L
                    </span>
                </div>
            </div>
        </div>
    )
}
import { FiLayers } from 'react-icons/fi'
