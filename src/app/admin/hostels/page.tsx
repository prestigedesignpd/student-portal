'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiHome, FiPlus, FiSettings, FiArrowUpRight, FiSearch, FiXCircle, FiEdit2, FiTrash2, FiMapPin, FiRefreshCw } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function HostelManagement() {
    const [hostels, setHostels] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        totalRooms: 0,
        type: 'MALE' as 'MALE' | 'FEMALE',
        price: 0
    })

    useEffect(() => {
        fetchHostels()
    }, [])

    const fetchHostels = async () => {
        try {
            setIsLoading(true)
            const response = await axios.get('/api/admin/hostels')
            setHostels(response.data)
        } catch (error) {
            toast.error('Sync failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            if (editingId) {
                await axios.patch(`/api/admin/hostels?id=${editingId}`, formData)
                toast.success('Hostel updated')
            } else {
                await axios.post('/api/admin/hostels', formData)
                toast.success('Hostel created')
            }
            setIsModalOpen(false)
            setEditingId(null)
            setFormData({ name: '', location: '', totalRooms: 0, type: 'MALE', price: 0 })
            fetchHostels()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Operation failed')
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = (hostel: any) => {
        setEditingId(hostel._id)
        setFormData({
            name: hostel.name,
            location: hostel.location,
            totalRooms: hostel.totalRooms,
            type: hostel.type,
            price: hostel.price
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this hostel? All room data must be cleared first.')) return
        try {
            await axios.delete(`/api/admin/hostels?id=${id}`)
            toast.success('Hostel removed')
            fetchHostels()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Deletion failed')
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd]">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <Link href="/admin/dashboard" className="group/header active:scale-95 transition-transform">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></span>
                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] group-hover/header:translate-x-1 transition-transform">Campus Residences</p>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none group-hover/header:text-primary-600 transition-colors">Hostel <span className="text-gray-400 font-medium italic">Management</span></h1>
                    </Link>
                    <button
                        onClick={() => {
                            setEditingId(null)
                            setFormData({ name: '', location: '', totalRooms: 0, type: 'MALE', price: 0 })
                            setIsModalOpen(true)
                        }}
                        className="flex items-center justify-center gap-3 bg-primary-600 text-white px-8 py-4 rounded-2xl hover:bg-primary-700 transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.2)] font-black uppercase tracking-widest text-[10px] active:scale-95 group"
                    >
                        <FiPlus className="group-hover:rotate-90 transition-transform" /> Add Hostel Unit
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {hostels.map((hostel) => {
                        const rate = hostel.capacity > 0 ? (hostel.occupied / hostel.capacity) * 100 : 0
                        return (
                            <div key={hostel._id} className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col group hover:border-primary-200 transition-all shadow-sm hover:shadow-xl relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-50 blur-[40px] group-hover:bg-primary-100 transition-colors"></div>

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded-2xl group-hover:scale-110 group-hover:bg-primary-50 group-hover:border-primary-100 transition-all flex items-center justify-center border border-gray-100 shadow-sm">
                                        <FiHome size={22} className="group-hover:text-primary-500 transition-colors" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(hostel)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-white hover:text-primary-600 border border-transparent hover:border-primary-100 transition-all shadow-sm">
                                            <FiEdit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(hostel._id)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-white hover:text-rose-600 border border-transparent hover:border-rose-100 transition-all shadow-sm">
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-8 relative z-10">
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-2 group-hover:text-primary-700 transition-colors">{hostel.name}</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{hostel.type} Wing</p>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest italic">₦{(hostel.price || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[8px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 bg-gray-50 rounded-lg w-fit border border-gray-100">
                                        <FiMapPin size={10} /> {hostel.location}
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10 mt-auto">
                                    <div>
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">
                                            <span>Occupancy ({Math.round(rate)}%)</span>
                                            <span className="text-gray-900 font-black">{hostel.occupied} / {hostel.capacity}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div className={`h-full transition-all duration-1000 ${rate > 90 ? 'bg-rose-500' : 'bg-primary-500'}`} style={{ width: `${rate}%` }} />
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/hostels/${hostel._id}`}
                                        className="w-full bg-gray-50 text-gray-600 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all border border-gray-100 flex items-center justify-center gap-3 active:scale-95 group/btn"
                                    >
                                        Manage Unit <FiArrowUpRight className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-[60px] group-hover:bg-primary-500/30 transition-all duration-700"></div>
                        <h2 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-8">Administrative Operations</h2>
                        <div className="space-y-3">
                            {['Bulk Room Allocation', 'Inspect Infrastructure', 'Maintenance Logs'].map((act, i) => (
                                <div key={i} className="w-full text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex justify-between items-center group/btn cursor-pointer">
                                    <span className="text-[11px] font-black uppercase text-gray-300 group-hover/btn:text-white tracking-widest">{act}</span>
                                    <FiSettings size={14} className="text-gray-500 group-hover/btn:text-primary-400 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-primary-50/50"></div>
                        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 border border-primary-100 group-hover:scale-110 transition-transform">
                            <FiSearch size={24} className="text-primary-500" />
                        </div>
                        <h2 className="text-[11px] font-black text-gray-700 uppercase tracking-widest mb-6 relative z-10">Quick Resident Lookup</h2>
                        <input type="text" placeholder="Search by matric no or name..." className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 placeholder:text-gray-400 relative z-10 outline-none" />
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-950 tracking-tight leading-none mb-1">{editingId ? 'Modify' : 'New'} Hostel</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Residency Configuration</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-gray-950 transition-colors">
                                <FiXCircle size={32} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Hostel Designation</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Alumni Hall"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 outline-none hover:border-primary-100"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Geographic Location</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. North Campus"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 outline-none hover:border-primary-100"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Wing Type</label>
                                    <select
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-[10px] font-black uppercase outline-none"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Base Rate (₦)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 outline-none hover:border-primary-100"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Planned Room Count</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 outline-none hover:border-primary-100"
                                    value={formData.totalRooms}
                                    onChange={(e) => setFormData({ ...formData, totalRooms: Number(e.target.value) })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:bg-gray-400 mt-4"
                            >
                                {isSaving ? <FiRefreshCw className="animate-spin" /> : editingId ? 'Update Configuration' : 'Release Hostel Unit'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
