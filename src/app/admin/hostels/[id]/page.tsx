'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { FiHome, FiPlus, FiArrowLeft, FiSearch, FiXCircle, FiEdit2, FiTrash2, FiUsers, FiRefreshCw } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Room {
    _id: string;
    roomNumber: string;
    capacity: number;
    occupants: any[];
    type: string;
    isAvailable: boolean;
}

export default function RoomManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: hostelId } = use(params)
    const [hostel, setHostel] = useState<any>(null)
    const [rooms, setRooms] = useState<Room[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState({
        roomNumber: '',
        capacity: 4,
        type: 'MALE'
    })

    useEffect(() => {
        fetchData()
    }, [hostelId])

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [hostelRes, roomsRes] = await Promise.all([
                axios.get(`/api/admin/hostels/${hostelId}`),
                axios.get(`/api/admin/rooms?hostelId=${hostelId}`)
            ])
            setHostel(hostelRes.data)
            setRooms(roomsRes.data)
            setFormData(prev => ({ ...prev, type: hostelRes.data.type }))
        } catch (error) {
            toast.error('Failed to load room data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            if (editingId) {
                await axios.patch('/api/admin/rooms', { id: editingId, ...formData })
                toast.success('Room configuration updated')
            } else {
                await axios.post('/api/admin/rooms', { hostelId, ...formData })
                toast.success('Room added successfully')
            }
            setIsModalOpen(false)
            setEditingId(null)
            setFormData({ roomNumber: '', capacity: 4, type: hostel?.type || 'MALE' })
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Operation failed')
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = (room: Room) => {
        setEditingId(room._id)
        setFormData({
            roomNumber: room.roomNumber,
            capacity: room.capacity,
            type: room.type
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this room? This action is permanent.')) return
        try {
            await axios.delete(`/api/admin/rooms?id=${id}`)
            toast.success('Room deleted')
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Deletion failed')
        }
    }

    const filteredRooms = rooms.filter(r =>
        r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-6">
                        <Link href="/admin/hostels" className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm active:scale-95">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`w-2 h-2 rounded-full ${hostel?.type === 'MALE' ? 'bg-blue-500' : 'bg-rose-500'} animate-pulse`}></span>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{hostel?.name} // Unit Layout</p>
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Space <span className="text-gray-400 font-medium italic">Allocation</span></h1>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditingId(null)
                            setFormData({ roomNumber: '', capacity: 4, type: hostel?.type || 'MALE' })
                            setIsModalOpen(true)
                        }}
                        className="flex items-center justify-center gap-3 bg-gray-950 text-white px-8 py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 font-black uppercase tracking-widest text-[10px] active:scale-95 group"
                    >
                        <FiPlus className="group-hover:rotate-90 transition-transform" /> Register New Room
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 p-3 mb-10 flex items-center shadow-sm">
                    <FiSearch className="ml-6 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search components by room number..."
                        className="w-full px-6 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900 placeholder:text-gray-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredRooms.map((room) => (
                        <div key={room._id} className="bg-white rounded-[1.5rem] border border-gray-100 p-6 hover:border-primary-200 transition-all hover:shadow-md group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-black text-xs group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    #{room.roomNumber}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(room)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                                        <FiEdit2 size={12} />
                                    </button>
                                    <button onClick={() => handleDelete(room._id)} className="p-2 text-gray-400 hover:text-rose-600 transition-colors">
                                        <FiTrash2 size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Occupany</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${room.occupants.length >= room.capacity ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {room.occupants.length >= room.capacity ? 'FULL' : 'AVAILABLE'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: room.capacity }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-grow rounded-full ${i < room.occupants.length ? 'bg-primary-500' : 'bg-gray-100'}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <FiUsers size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{room.occupants.length} / {room.capacity}</span>
                                    </div>
                                    <span className="text-[8px] font-black px-2 py-0.5 bg-gray-50 rounded text-gray-500 uppercase tracking-widest">
                                        {room.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRooms.length === 0 && (
                    <div className="py-20 text-center bg-white border border-gray-100 rounded-[2.5rem]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No spaces discovered in this unit</p>
                    </div>
                )}
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">{editingId ? 'Edit' : 'New'} Room Design</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                <FiXCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Room Reference</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 101"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 outline-none"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Capacity</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="12"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 outline-none"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wing Type</label>
                                    <select
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-[10px] font-black uppercase outline-none"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-primary-700 transition-all shadow-lg active:scale-95 disabled:bg-gray-300"
                            >
                                {isSaving ? <FiRefreshCw className="animate-spin" /> : editingId ? 'Update Design' : 'Commit Space'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
