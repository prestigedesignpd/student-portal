'use client'

import { useState, useEffect } from 'react'
import { FiCalendar, FiClock, FiMapPin, FiInfo, FiLayers, FiActivity, FiArrowRight } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { format, isAfter, isBefore, startOfDay } from 'date-fns'

export default function AcademicCalendar() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const response = await axios.get('/api/calendar')
            setEvents(response.data)
        } catch (error) {
            toast.error('Could not sync academic schedule')
        } finally {
            setLoading(false)
        }
    }

    const upcomingEvents = events.filter(e => isAfter(new Date(e.date), startOfDay(new Date())))
    const pastEvents = events.filter(e => isBefore(new Date(e.date), startOfDay(new Date())))

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden bg-[#fbfcfd] min-h-screen">
            <main className="max-w-5xl mx-auto px-3 sm:px-5 py-4 pb-20 md:pb-12">
                {/* Header Section */}
                <div className="mb-6">
                    <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em] mb-1 font-mono">Registry // Academic Scheduler</p>
                    <h1 className="text-2xl font-black text-gray-950 tracking-tighter leading-none mb-3 uppercase">Academic <span className="text-primary-600">Timeline.</span></h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold max-w-sm">
                        Stay ahead of official university events, examinations, and registration windows.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Timeline Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upcoming Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <h2 className="text-[10px] font-black text-gray-950 uppercase tracking-[0.3em]">Upcoming Schedule</h2>
                                <div className="h-[1px] flex-grow bg-gray-100"></div>
                            </div>

                            <div className="space-y-4 relative ml-3">
                                {/* Vertical Timeline Line */}
                                <div className="absolute left-0 top-2 bottom-0 w-[1px] bg-gray-200"></div>

                                {upcomingEvents.map((event, idx) => (
                                    <div key={idx} className="relative pl-6 group">
                                        {/* Timeline Node */}
                                        <div className="absolute left-[-3.5px] top-6 w-2 h-2 rounded-full border border-primary-500 bg-white group-hover:bg-primary-500 transition-colors shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>

                                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-x-0.5">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex flex-col items-center justify-center border border-gray-100 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors shrink-0">
                                                        <span className="text-[7px] font-black uppercase text-primary-500 leading-none mb-0.5">{format(new Date(event.date), 'MMM')}</span>
                                                        <span className="text-lg font-black text-gray-950 leading-none">{format(new Date(event.date), 'dd')}</span>
                                                    </div>
                                                    <div>
                                                        <span className={`text-[6px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${event.type === 'EXAM' ? 'bg-rose-50 text-rose-600' :
                                                            event.type === 'REGISTRATION' ? 'bg-emerald-50 text-emerald-600' :
                                                                'bg-primary-50 text-primary-600'
                                                            }`}>
                                                            {event.type} Session
                                                        </span>
                                                        <h3 className="text-xs font-black text-gray-950 uppercase tracking-tight mt-1 leading-tight">{event.title}</h3>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-400 self-start sm:self-auto shrink-0">
                                                    <div className="flex items-center gap-1.5 font-bold text-[8px] uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                        <FiClock /> {format(new Date(event.date), 'EEEE')}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-medium text-gray-500 leading-relaxed max-w-lg mb-4">
                                                {event.description || 'Institutional event scheduled for regular portal operations. Please ensure all related tasks are completed before the date.'}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-1.5">
                                                    <FiMapPin className="text-gray-300" size={10} />
                                                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Main Campus / Online</span>
                                                </div>
                                                <button className="text-[8px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-1.5 group/btn">
                                                    Details <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {upcomingEvents.length === 0 && (
                                    <div className="bg-gray-50/50 rounded-2xl border border-gray-200 border-dashed p-8 text-center ml-6">
                                        <FiCalendar className="mx-auto text-gray-300 mb-3" size={24} />
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">No institutional events scheduled <br /> for the upcoming period.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Past Section */}
                        {pastEvents.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Completed Events</h2>
                                    <div className="h-[1px] flex-grow bg-gray-100"></div>
                                </div>
                                <div className="space-y-3 opacity-60 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                                    {pastEvents.map((event, idx) => (
                                        <div key={idx} className="bg-white p-3 sm:px-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="text-right shrink-0">
                                                    <p className="text-[9px] font-black text-gray-950 leading-none mb-0.5">{format(new Date(event.date), 'dd MMM')}</p>
                                                    <p className="text-[6px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(event.date), 'yyyy')}</p>
                                                </div>
                                                <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
                                                <div>
                                                    <h4 className="text-[9px] font-black text-gray-950 uppercase tracking-tight leading-snug truncate max-w-[120px] sm:max-w-xs">{event.title}</h4>
                                                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{event.type}</p>
                                                </div>
                                            </div>
                                            <FiLayers className="text-gray-300 shrink-0" size={14} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Sidebar Info */}
                    <div className="space-y-8">
                        <div className="bg-gray-950 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/20 blur-[60px] rounded-full pointer-events-none"></div>
                            <div className="relative z-10">
                                <FiInfo size={20} className="text-primary-400 mb-3" />
                                <h3 className="text-sm font-black tracking-tight mb-1.5 uppercase leading-none">Portal Usage</h3>
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold leading-relaxed">
                                    Dates listed on this calendar are official institutional directives. Monitor this timeline weekly for any schedule adjustments.
                                </p>
                                <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between">
                                    <div>
                                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Current Session</p>
                                        <p className="text-[10px] font-black uppercase text-primary-400 tracking-widest">2023/2024</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Semester</p>
                                        <p className="text-[10px] font-black uppercase text-gray-100 tracking-widest underline decoration-primary-500 decoration-2 underline-offset-4">First</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                            <h3 className="text-[9px] font-black text-gray-950 uppercase tracking-[0.2em] mb-4">Legend</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)] shrink-0"></div>
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Examination & Deadlines</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_6px_rgba(59,130,246,0.5)] shrink-0"></div>
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Academic Sessions</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] shrink-0"></div>
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Registration Windows</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)] shrink-0"></div>
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Public Holidays</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
