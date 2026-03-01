'use client'

import { useState, useEffect } from 'react'
import { FiLayers, FiPlus, FiEdit2, FiTrash2, FiSearch, FiServer, FiActivity, FiBriefcase, FiBook, FiXCircle } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AcademicsManagement() {
    const [faculties, setFaculties] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'FACULTIES' | 'DEPARTMENTS'>('FACULTIES')
    const [searchQuery, setSearchQuery] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'FACULTY' | 'DEPARTMENT'>('FACULTY')
    const [formData, setFormData] = useState({ name: '', code: '', facultyId: '' })

    const [isSyncing, setIsSyncing] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [facRes, deptRes] = await Promise.all([
                axios.get('/api/admin/faculties'),
                axios.get('/api/admin/departments')
            ])
            setFaculties(facRes.data)
            setDepartments(deptRes.data)
        } catch (error) {
            toast.error('Failed to sync academic data')
        } finally {
            setLoading(false)
        }
    }

    const filteredFaculties = faculties.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.code.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.facultyId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.facultyId?.code?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsSyncing(true)
            if (editingId) {
                if (modalType === 'FACULTY') {
                    await axios.patch(`/api/admin/faculties/${editingId}`, { name: formData.name, code: formData.code })
                    toast.success('Faculty updated')
                } else {
                    await axios.patch(`/api/admin/departments/${editingId}`, formData)
                    toast.success('Department updated')
                }
            } else {
                if (modalType === 'FACULTY') {
                    await axios.post('/api/admin/faculties', { name: formData.name, code: formData.code })
                    toast.success('Faculty created')
                } else {
                    await axios.post('/api/admin/departments', formData)
                    toast.success('Department created')
                }
            }
            setIsModalOpen(false)
            setEditingId(null)
            setFormData({ name: '', code: '', facultyId: '' })
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Execution failed')
        } finally {
            setTimeout(() => setIsSyncing(false), 1000)
        }
    }

    const handleEdit = (type: 'FACULTY' | 'DEPARTMENT', item: any) => {
        setModalType(type)
        setEditingId(item._id)
        setFormData({
            name: item.name,
            code: item.code,
            facultyId: type === 'DEPARTMENT' ? (item.facultyId?._id || item.facultyId || '') : ''
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (type: 'FACULTY' | 'DEPARTMENT', id: string) => {
        if (!confirm('Are you sure you want to delete this entry?')) return

        try {
            setIsSyncing(true)
            if (type === 'FACULTY') {
                await axios.delete(`/api/admin/faculties/${id}`)
                toast.success('Faculty deleted')
            } else {
                await axios.delete(`/api/admin/departments/${id}`)
                toast.success('Department deleted')
            }
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Deletion failed')
        } finally {
            setTimeout(() => setIsSyncing(false), 1000)
        }
    }

    const handleFinalize = async () => {
        if (!confirm('SYSTEM CLEAR: This will finalize all records and lock the current semester. THIS IS IRREVERSIBLE. Proceed?')) return

        try {
            setLoading(true)
            const response = await axios.post('/api/admin/academics/finalize')
            toast.success(response.data.message)
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Finalization failed')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary-500/10 border-t-primary-500 rounded-full animate-spin shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden">
            {/* System Background Scan Line */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent absolute animate-scan"></div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                {/* Authority Header Strip */}
                <div className="bg-[#0a0a0b] rounded-[2.5rem] p-10 mb-12 shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'} shadow-[0_0_15px_rgba(16,185,129,0.5)]`}></div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                    {isSyncing ? 'Synchronizing Pipeline...' : 'Curriculum Control Station'}
                                </p>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight leading-none">Faculty <span className="text-primary-500 italic opacity-80">Hub</span></h1>
                            <p className="text-gray-500 text-[11px] font-bold mt-3 uppercase tracking-widest leading-relaxed max-w-md">Institutional data management and semester lifecycle governance console.</p>
                        </div>

                        <div className="flex bg-white/5 backdrop-blur-3xl p-1.5 rounded-2xl border border-white/10 shadow-inner">
                            {(['FACULTIES', 'DEPARTMENTS'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                        ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 scale-105'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Control Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div className="relative group w-full max-w-md">
                        <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={`Filter ${activeTab.toLowerCase()}...`}
                            className="bg-white border border-gray-100 pl-14 pr-6 py-4.5 rounded-[1.5rem] focus:ring-4 focus:ring-primary-500/5 focus:border-primary-200 outline-none transition-all text-xs font-black text-gray-900 w-full placeholder:text-gray-300 uppercase tracking-widest shadow-sm"
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={handleFinalize}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white text-rose-600 border border-rose-100 px-8 py-4.5 rounded-[1.5rem] hover:bg-rose-600 hover:text-white transition-all shadow-sm font-black uppercase tracking-widest text-[9px] active:scale-95 group"
                        >
                            <FiServer className="group-hover:rotate-12 transition-transform" /> System Clear
                        </button>
                        <button
                            onClick={() => {
                                setModalType(activeTab === 'FACULTIES' ? 'FACULTY' : 'DEPARTMENT')
                                setEditingId(null)
                                setFormData({ name: '', code: '', facultyId: '' })
                                setIsModalOpen(true)
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4.5 rounded-[1.5rem] hover:bg-black transition-all shadow-xl shadow-black/10 font-black uppercase tracking-widest text-[9px] active:scale-95 group"
                        >
                            <FiPlus className="group-hover:rotate-90 transition-transform" /> Add New {activeTab === 'FACULTIES' ? 'Unit' : 'Dept'}
                        </button>
                    </div>
                </div>

                {activeTab === 'FACULTIES' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredFaculties.map((fac) => {
                            const facDepts = departments.filter(d => (d.facultyId?._id || d.facultyId) === fac._id)
                            return (
                                <div key={fac._id} className="bg-white rounded-[2.5rem] border border-gray-100 p-10 hover:border-primary-200 transition-all shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] group relative overflow-hidden active:scale-[0.98]">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 blur-[50px] group-hover:bg-primary-100/50 transition-colors"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary-500 border border-gray-100 shadow-sm group-hover:scale-110 transition-transform group-hover:rotate-3">
                                                <FiBriefcase size={22} />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit('FACULTY', fac); }} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-white hover:text-primary-600 border border-gray-100 hover:shadow-sm transition-all"><FiEdit2 size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete('FACULTY', fac._id); }} className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-600 border border-gray-100 hover:shadow-sm transition-all"><FiTrash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="mb-8">
                                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] bg-primary-50 px-3 py-1 rounded-lg border border-primary-100/50">{fac.code} Unit</span>
                                            <h3 className="text-xl font-black text-gray-900 leading-[1.1] mt-4 tracking-tight group-hover:text-primary-600 transition-colors">{fac.name}</h3>
                                        </div>
                                        <div className="pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Academy Pulse</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]"></div>
                                                    <span className="text-[10px] font-black text-gray-900 uppercase">Deployed</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Dept Load</p>
                                                <span className="text-[10px] font-black text-primary-600 uppercase">{facDepts.length} Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-xl shadow-gray-100/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Governance Unit</th>
                                        <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">System Code</th>
                                        <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Structural Parent</th>
                                        <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50/50">
                                    {filteredDepartments.map((dept) => (
                                        <tr key={dept._id} className="hover:bg-primary-50/30 transition-all group">
                                            <td className="p-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-primary-500 border border-gray-100 group-hover:bg-white group-hover:scale-110 transition-all">
                                                        <FiLayers size={18} />
                                                    </div>
                                                    <p className="text-sm font-black text-gray-900 group-hover:text-primary-700 transition-colors uppercase tracking-tight">{dept.name}</p>
                                                </div>
                                            </td>
                                            <td className="p-10">
                                                <span className="px-4 py-1.5 bg-white text-gray-900 rounded-xl text-[10px] font-black border border-gray-100 shadow-sm uppercase tracking-widest">{dept.code}</span>
                                            </td>
                                            <td className="p-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-primary-500/20"></div>
                                                    <div>
                                                        <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest block leading-none mb-1">{dept.facultyId?.code || '---'}</span>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dept.facultyId?.name || 'Root Access'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-10 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <button onClick={() => handleEdit('DEPARTMENT', dept)} className="w-10 h-10 bg-white shadow-sm rounded-xl text-gray-400 hover:text-primary-600 border border-gray-100 flex items-center justify-center transition-all"><FiEdit2 size={14} /></button>
                                                    <button onClick={() => handleDelete('DEPARTMENT', dept._id)} className="w-10 h-10 bg-white shadow-sm rounded-xl text-gray-400 hover:text-rose-600 border border-gray-100 flex items-center justify-center transition-all"><FiTrash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Authority Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => { setIsModalOpen(false); setEditingId(null); }}></div>
                    <div className="relative bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">
                                    {editingId ? 'Modify' : 'Initialize'} {modalType === 'FACULTY' ? 'Unit' : 'Dept'}
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Curriculum Deployment Interface</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                <FiXCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Identification Label</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter formal name..."
                                    className="w-full px-6 py-4.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/5 focus:bg-white focus:border-primary-100 transition-all text-xs font-black text-gray-900"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Registry Code</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="CODE"
                                        className="w-full px-6 py-4.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/5 focus:bg-white focus:border-primary-100 transition-all text-xs font-black text-gray-900 uppercase"
                                        value={formData.code || ''}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                {modalType === 'DEPARTMENT' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Parent Unit</label>
                                        <select
                                            required
                                            className="w-full px-4 py-4.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/5 focus:bg-white focus:border-primary-100 transition-all text-[10px] font-black uppercase"
                                            value={formData.facultyId || ''}
                                            onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            {faculties.map(f => <option key={f._id} value={f._id}>{f.code} Unit</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <button type="submit" disabled={isSyncing} className="w-full py-5.5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50">
                                {isSyncing ? 'Syncing...' : editingId ? 'Update Registry' : 'Deploy To Core'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
