'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiBook, FiPlus, FiMoreVertical, FiClock, FiLayers, FiSearch, FiCpu, FiGrid, FiXCircle, FiEdit2, FiTrash2, FiActivity, FiShield, FiDatabase, FiFileText, FiVideo, FiLink, FiBox, FiTrendingUp } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function CourseManagement() {
    const [courses, setCourses] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [managingMaterialsFor, setManagingMaterialsFor] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [materialForm, setMaterialForm] = useState({ title: '', type: 'PDF', url: '', size: '' })
    const [formData, setFormData] = useState({
        courseCode: '',
        courseTitle: '',
        creditUnits: 3,
        level: 100,
        semester: 'FIRST',
        department: ''
    })
    const [filterLevel, setFilterLevel] = useState<string>('ALL')
    const [filterSemester, setFilterSemester] = useState<string>('ALL')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [courseRes, deptRes] = await Promise.all([
                axios.get('/api/admin/courses'),
                axios.get('/api/admin/departments')
            ])
            setCourses(courseRes.data)
            setDepartments(deptRes.data)
        } catch (error) {
            toast.error('Course data sync failed')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.department.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesLevel = filterLevel === 'ALL' || c.level.toString() === filterLevel
        const matchesSemester = filterSemester === 'ALL' || c.semester === filterSemester

        return matchesSearch && matchesLevel && matchesSemester
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsSyncing(true)
            if (editingId) {
                await axios.patch(`/api/admin/courses/${editingId}`, formData)
                toast.success('Course entry updated')
            } else {
                await axios.post('/api/admin/courses', formData)
                toast.success('Course added successfully')
            }
            setIsModalOpen(false)
            setEditingId(null)
            setFormData({
                courseCode: '',
                courseTitle: '',
                creditUnits: 3,
                level: 100,
                semester: 'FIRST',
                department: ''
            })
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Data sync error')
        } finally {
            setTimeout(() => setIsSyncing(false), 1000)
        }
    }

    const handleEdit = (course: any) => {
        setEditingId(course._id)
        setFormData({
            courseCode: course.courseCode,
            courseTitle: course.courseTitle,
            creditUnits: course.creditUnits,
            level: course.level,
            semester: course.semester,
            department: course.department
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this course?')) return
        try {
            setIsSyncing(true)
            await axios.delete(`/api/admin/courses/${id}`)
            toast.success('Course deleted')
            fetchData()
        } catch (error) {
            toast.error('Delete failed')
        } finally {
            setTimeout(() => setIsSyncing(false), 800)
        }
    }

    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!managingMaterialsFor) return

        try {
            setIsSyncing(true)
            const updatedMaterials = [...(managingMaterialsFor.materials || []), materialForm]
            await axios.patch(`/api/admin/courses/${managingMaterialsFor._id}`, { materials: updatedMaterials })
            toast.success('Resource linked to unit')
            setMaterialForm({ title: '', type: 'PDF', url: '', size: '' })

            const updatedCourse = { ...managingMaterialsFor, materials: updatedMaterials }
            setManagingMaterialsFor(updatedCourse)
            setCourses(courses.map(c => c._id === updatedCourse._id ? updatedCourse : c))
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Resource link failed')
        } finally {
            setTimeout(() => setIsSyncing(false), 800)
        }
    }

    const handleDeleteMaterial = async (materialId: string) => {
        if (!managingMaterialsFor || !confirm('Unlink this resource?')) return

        try {
            setIsSyncing(true)
            const updatedMaterials = managingMaterialsFor.materials.filter((m: any) => m._id !== materialId)
            await axios.patch(`/api/admin/courses/${managingMaterialsFor._id}`, { materials: updatedMaterials })
            toast.success('Resource unlinked')

            const updatedCourse = { ...managingMaterialsFor, materials: updatedMaterials }
            setManagingMaterialsFor(updatedCourse)
            setCourses(courses.map(c => c._id === updatedCourse._id ? updatedCourse : c))
        } catch (error) {
            toast.error('Unlink failed')
        } finally {
            setTimeout(() => setIsSyncing(false), 800)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_30px_rgba(99,102,241,0.2)]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden">
            {/* Background System Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                {/* Academic Matrix Header */}
                <div className="bg-[#0a0a0b] rounded-[3rem] p-12 mb-12 shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-indigo-500 animate-pulse'} shadow-[0_0_15px_#6366f1]`}></div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">
                                    {isSyncing ? 'Updating course directory...' : 'Course Management'}
                                </p>
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-6">Course <span className="text-indigo-500 italic">Management</span></h1>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <FiBook className="text-indigo-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{courses.length} Active Courses</span>
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <FiTrendingUp className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Enrollment Capacity: 84%</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white px-10 py-5 rounded-2xl hover:bg-indigo-500 transition-all shadow-[0_15px_40px_rgba(99,102,241,0.3)] font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 group flex items-center gap-4 border border-indigo-400/20"
                        >
                            <FiPlus className="group-hover:rotate-180 transition-transform duration-500" /> Add New Course
                        </button>
                    </div>
                </div>

                {/* Filter & Search Hub */}
                <div className="flex flex-col md:flex-row gap-5 mb-12">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-3 flex-grow flex items-center group overflow-hidden relative">
                        <div className="absolute inset-0 bg-indigo-50/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                        <div className="relative flex-grow">
                            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-all font-black" />
                            <input
                                type="text"
                                placeholder="Scan Catalog Code or Identifier..."
                                className="w-full pl-16 pr-8 py-5 bg-transparent border-transparent rounded-2xl focus:ring-0 transition-all text-xs font-black text-gray-900 placeholder:text-gray-300 uppercase tracking-[0.1em]"
                                value={searchQuery || ''}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl shrink-0">
                        <select
                            className="bg-transparent px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none border-r border-gray-100 hover:text-indigo-600 transition-colors"
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                        >
                            <option value="ALL">All Levels</option>
                            <option value="100">100 Level</option>
                            <option value="200">200 Level</option>
                            <option value="300">300 Level</option>
                            <option value="400">400 Level</option>
                            <option value="500">500 Level</option>
                        </select>
                        <select
                            className="bg-transparent px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none hover:text-indigo-600 transition-colors"
                            value={filterSemester}
                            onChange={(e) => setFilterSemester(e.target.value)}
                        >
                            <option value="ALL">All Semesters</option>
                            <option value="FIRST">1st Semester</option>
                            <option value="SECOND">2nd Semester</option>
                        </select>
                    </div>
                </div>

                {/* 3D Matrix Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                    {filteredCourses.map((course) => (
                        <div key={course._id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden hover:-translate-y-2">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 blur-[50px] group-hover:bg-indigo-100/50 transition-all duration-700 pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-[#0a0a0b] text-indigo-500 rounded-2xl flex items-center justify-center font-black text-lg border border-white/10 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                                        {course.courseCode[0]}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setManagingMaterialsFor(course); setIsMaterialModalOpen(true); }} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-white border border-gray-100 transition-all active:scale-90">
                                            <FiBox size={16} />
                                        </button>
                                        <button onClick={() => handleEdit(course)} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-white border border-gray-100 transition-all active:scale-90">
                                            <FiEdit2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">{course.courseCode}</h3>
                                <h2 className="text-xl font-black text-gray-900 leading-tight uppercase mb-6 h-14 line-clamp-2">{course.courseTitle}</h2>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Credit Units</p>
                                        <p className="text-lg font-black text-gray-900 tracking-tighter">{course.creditUnits} Units</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Course Level</p>
                                        <p className="text-lg font-black text-gray-900 tracking-tighter">{course.level}L</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{course.enrolled || 0} Students Enrolled</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {course.materials?.length > 0 && <FiDatabase className="text-indigo-400" size={14} />}
                                        <span className="text-[10px] font-black text-gray-400 uppercase">{course.materials?.length || 0} Resource Items</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {filteredCourses.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-gray-50/30 border-2 border-dashed border-gray-200 rounded-[3rem]">
                            <FiCpu size={48} className="mx-auto text-gray-300 mb-6 animate-pulse" />
                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest italic font-bold">No Courses Found</h3>
                        </div>
                    )}
                </div>
            </main>

            {/* Matrix Deployment Interface */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/40 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 shadow-2xl border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-3 uppercase">{editingId ? 'Edit' : 'Add'} <span className="text-indigo-600 italic">Course</span></h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] font-black">Course Administration Form</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><FiXCircle size={28} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Course Code</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="CSC 101"
                                        className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-100 transition-all text-sm outline-none placeholder:text-gray-300"
                                        value={formData.courseCode || ''}
                                        onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Credit Units</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-100 transition-all text-sm outline-none"
                                        value={formData.creditUnits || ''}
                                        onChange={(e) => setFormData({ ...formData, creditUnits: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Course Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-100 transition-all text-sm outline-none"
                                    value={formData.courseTitle || ''}
                                    onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Academic Level</label>
                                    <select
                                        className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-100 transition-all text-[10px] font-black uppercase outline-none"
                                        value={formData.level || 100}
                                        onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                                    >
                                        {[100, 200, 300, 400, 500].map(l => <option key={l} value={l}>{l} Level</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Semester</label>
                                    <select
                                        className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-100 transition-all text-[10px] font-black uppercase outline-none"
                                        value={formData.semester || 'FIRST'}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    >
                                        <option value="FIRST">1st Semester</option>
                                        <option value="SECOND">2nd Semester</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Sponsoring Sector</label>
                                <select
                                    required
                                    className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-100 transition-all text-[10px] font-black uppercase outline-none"
                                    value={formData.department || ''}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="">Choose Unit...</option>
                                    {departments.map(d => <option key={d._id} value={d.name}>{d.code} Governance</option>)}
                                </select>
                            </div>
                            <button type="submit" disabled={isSyncing} className="w-full py-7 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-black transition-all shadow-2xl shadow-black/20 active:scale-95 disabled:opacity-50 mt-4">
                                {isSyncing ? 'Synchronizing Pipeline...' : editingId ? 'Update Matrix Profile' : 'Commit To Global Matrix'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Matrix Resource Hub */}
            {isMaterialModalOpen && managingMaterialsFor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/40 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-12 shadow-2xl border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-3 uppercase">Course <span className="text-indigo-600">Materials</span></h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic font-black">{managingMaterialsFor.courseCode} Resource Repository</p>
                            </div>
                            <button onClick={() => { setIsMaterialModalOpen(false); setManagingMaterialsFor(null); }} className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm focus:outline-none"><FiXCircle size={28} /></button>
                        </div>

                        <div className="space-y-10">
                            {/* Materials Matrix List */}
                            <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Current Course Materials</h3>
                                {(!managingMaterialsFor.materials || managingMaterialsFor.materials.length === 0) ? (
                                    <div className="py-12 text-center">
                                        <FiShield className="mx-auto text-gray-200 mb-4" size={32} />
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No resources detected in this unit's file.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {managingMaterialsFor.materials.map((mat: any, index: number) => (
                                            <div key={mat._id || index} className="flex items-center justify-between bg-white px-6 py-5 rounded-2xl border border-gray-100 shadow-sm group/mat hover:border-indigo-200 transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-black text-[10px] border border-indigo-100 group-hover/mat:bg-indigo-600 group-hover/mat:text-white transition-all">
                                                        {mat.type === 'PDF' && <FiFileText size={18} />}
                                                        {mat.type === 'VIDEO' && <FiVideo size={18} />}
                                                        {mat.type === 'LINK' && <FiLink size={18} />}
                                                        {mat.type === 'DOC' && <FiBox size={18} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{mat.title}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{mat.type} Signal</span>
                                                            <span className="text-[10px] text-gray-300">|</span>
                                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{mat.size || 'Unverified Size'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteMaterial(mat._id)} className="p-3 text-gray-300 hover:text-rose-600 transition-colors active:scale-95">
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Link New Resource Protocol */}
                            <form onSubmit={handleAddMaterial} className="bg-[#0a0a0b] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-[50px] pointer-events-none"></div>
                                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-8">Link New Resource Key</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-2">Material Title</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-black text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xs outline-none"
                                                value={materialForm.title}
                                                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-2">Resource Type</label>
                                            <select
                                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-black text-gray-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[10px] uppercase outline-none"
                                                value={materialForm.type}
                                                onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                                            >
                                                <option value="PDF">PDF Document</option>
                                                <option value="VIDEO">Video Lecture</option>
                                                <option value="LINK">External Link</option>
                                                <option value="DOC">Word Document</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-2">System URL / Link</label>
                                            <input
                                                type="url"
                                                required
                                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-black text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xs outline-none"
                                                value={materialForm.url}
                                                onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-2">File Size</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 5.4MB"
                                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl font-black text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xs outline-none"
                                                value={materialForm.size}
                                                onChange={(e) => setMaterialForm({ ...materialForm, size: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isSyncing} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-indigo-500 transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-4">
                                        {isSyncing ? 'Adding material...' : 'Save Material'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
