'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiUser, FiArrowRight, FiFilter, FiActivity, FiLayers, FiShield, FiLock, FiCpu, FiMonitor, FiTerminal, FiDatabase, FiEye } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function StudentAuditHub() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterLevel, setFilterLevel] = useState('ALL')
    const [departments, setDepartments] = useState<any[]>([])
    const [filterDept, setFilterDept] = useState('ALL')
    const [isScanning, setIsScanning] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            setIsScanning(true)
            const [studentRes, deptRes] = await Promise.all([
                axios.get('/api/admin/students'),
                axios.get('/api/admin/departments')
            ])
            setStudents(studentRes.data)
            setDepartments(deptRes.data)
        } catch (error) {
            toast.error('Record sync failed')
        } finally {
            setTimeout(() => {
                setLoading(false)
                setIsScanning(false)
            }, 800)
        }
    }

    const filteredStudents = students.filter(student => {
        const firstName = student.userId?.firstName || ''
        const lastName = student.userId?.lastName || ''
        const fullName = `${firstName} ${lastName}`.toLowerCase()
        const matric = student.studentDetails?.matricNumber?.toLowerCase() || ''
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || matric.includes(searchQuery.toLowerCase())
        const matchesLevel = filterLevel === 'ALL' || student.studentDetails?.level?.toString() === filterLevel
        const matchesDept = filterDept === 'ALL' || student.studentDetails?.department === filterDept
        return matchesSearch && matchesLevel && matchesDept
    })

    if (loading && !isScanning) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_30px_rgba(16,185,129,0.2)]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden">
            {/* Background System Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                {/* Security Terminal Header */}
                <div className="bg-[#0a0a0b] rounded-[3rem] p-12 mb-12 shadow-2xl relative overflow-hidden group border border-white/5 font-mono">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'} shadow-[0_0_15px_#10b981]`}></div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">
                                    {isScanning ? 'DATA LOAD IN PROGRESS...' : 'RECORD OVERVIEW'}
                                </p>
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-6 uppercase">Student <span className="text-emerald-500 italic">Audit</span></h1>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <FiMonitor className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{students.length} STUDENTS TRACKED</span>
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <FiLock className="text-cyan-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Access Protocol: Level 4</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Scanning Animation Bar */}
                    {isScanning && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/20">
                            <div className="h-full bg-emerald-500 shadow-[0_0_20px_#10b981] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                    )}
                </div>

                {/* Search & Filter Terminal */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-2 flex-grow flex items-center group overflow-hidden shadow-xl relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex-grow group/input font-mono">
                            <FiSearch className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/input:text-emerald-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="SEARCH DATA: NAME OR MATRIC ID..."
                                className="w-full pl-20 pr-8 py-6 bg-transparent border-none focus:ring-0 text-sm font-black uppercase text-gray-950 placeholder:text-gray-300 tracking-tighter outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex bg-[#0a0a0b] p-2 rounded-[2.5rem] border border-white/5 shadow-2xl shrink-0 font-mono">
                        <div className="flex items-center px-6 gap-3 border-r border-white/5">
                            <FiFilter className="text-emerald-500" size={16} />
                            <select
                                className="bg-transparent py-4 text-[10px] font-black uppercase tracking-widest outline-none text-white border-none focus:ring-0"
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                            >
                                <option value="ALL" className="bg-[#0a0a0b]">ALL LEVELS</option>
                                <option value="100" className="bg-[#0a0a0b]">100 LEVEL</option>
                                <option value="200" className="bg-[#0a0a0b]">200 LEVEL</option>
                                <option value="300" className="bg-[#0a0a0b]">300 LEVEL</option>
                                <option value="400" className="bg-[#0a0a0b]">400 LEVEL</option>
                                <option value="500" className="bg-[#0a0a0b]">500 LEVEL</option>
                            </select>
                        </div>
                        <select
                            className="bg-transparent px-8 py-4 text-[10px] font-black uppercase tracking-widest outline-none border-none focus:ring-0 text-white"
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                        >
                            <option value="ALL" className="bg-[#0a0a0b]">ALL DEPARTMENTS</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept.name} className="bg-[#0a0a0b]">{dept.code}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="py-32 text-center bg-white border border-gray-100 rounded-[3rem] shadow-sm animate-in fade-in zoom-in-95 duration-700">
                        <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                            <FiMonitor size={32} className="text-emerald-500 opacity-50" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Student Not Found</h3>
                        <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-[0.2em] font-black italic">Refine search parameters to identify student records.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredStudents.map((student, i) => {
                            const firstName = student.userId?.firstName || 'ENCRYPTED'
                            const lastName = student.userId?.lastName || ''
                            return (
                                <div
                                    key={student._id}
                                    className="group p-8 rounded-[3rem] bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500 relative overflow-hidden animate-in slide-in-from-bottom-4 duration-700"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="absolute top-4 right-8 font-mono text-[8px] font-black text-gray-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                        REF: {student._id.slice(-8).toUpperCase()}
                                    </div>

                                    <div className="relative z-10 font-mono">
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center text-emerald-500 group-hover:border-emerald-100 group-hover:bg-white group-hover:scale-110 group-hover:shadow-xl transition-all overflow-hidden relative">
                                                {student.userId?.avatar ? (
                                                    <img src={student.userId.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FiUser size={28} />
                                                )}
                                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-gray-950 uppercase tracking-tighter truncate max-w-[140px] leading-tight">{firstName} {lastName}</h3>
                                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-2">{student.studentDetails?.matricNumber || 'MATRIC'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-10">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <FiLayers className="text-gray-300 group-hover:text-emerald-500 transition-colors" size={14} />
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Department</p>
                                                </div>
                                                <p className="text-[9px] font-black text-gray-950 uppercase tracking-tight truncate max-w-[120px]">{student.studentDetails?.department}</p>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <FiActivity className="text-gray-300 group-hover:text-emerald-500 transition-colors" size={14} />
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Level</p>
                                                </div>
                                                <p className="text-[9px] font-black text-gray-950 uppercase tracking-tight font-black">{student.studentDetails?.level} LEVEL</p>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/admin/audit/${student._id}`}
                                            className="w-full py-5 bg-[#0a0a0b] text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:bg-emerald-600 hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] transition-all active:scale-95 group/btn"
                                        >
                                            VIEW AUDIT REPORT <FiEye className="group-hover/btn:rotate-12 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* System Audit Footer */}
                <div className="mt-16 p-10 bg-[#0a0a0b] rounded-[3rem] flex items-start gap-8 shadow-2xl relative overflow-hidden group border border-white/5 font-mono">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] pointer-events-none"></div>
                    <FiTerminal className="text-emerald-500 mt-1 shrink-0" size={28} />
                    <div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-3 leading-none">Institutional Data Protocol</h4>
                        <p className="text-[11px] text-gray-500 font-bold leading-relaxed max-w-2xl uppercase tracking-[0.1em]">
                            All student records within the <span className="text-emerald-500">Student Audit</span> system are securely managed. Viewing student reports provides access to academic, financial, and status records.
                        </p>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @keyframes scan {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    )
}
