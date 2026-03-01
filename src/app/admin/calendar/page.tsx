'use client'

import { useState, useEffect } from 'react'
import { FiCalendar, FiPlus, FiMoreVertical, FiClock, FiCheckSquare, FiXCircle, FiEdit2, FiTrash2, FiSearch, FiInfo } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminCalendarPage() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'ACADEMIC',
        date: ''
    })

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/admin/calendar')
            setEvents(response.data)
        } catch (error) {
            toast.error('Failed to load academic calendar')
        } finally {
            setLoading(false)
        }
    }

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingId) {
                await axios.patch('/api/admin/calendar', { id: editingId, ...formData })
                toast.success('Calendar event updated')
            } else {
                await axios.post('/api/admin/calendar', formData)
                toast.success('Event added to calendar')
            }
            setIsModalOpen(false)
            setEditingId(null)
            setFormData({
                title: '',
                description: '',
                type: 'ACADEMIC',
                date: ''
            })
            fetchEvents()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to sync event')
        }
    }

    const handleEdit = (event: any) => {
        setEditingId(event._id)
        setFormData({
            title: event.title,
            description: event.description || '',
            type: event.type,
            date: new Date(event.date).toISOString().split('T')[0]
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event from the calendar?')) return
        try {
            await axios.delete(`/api/admin/calendar?id=${id}`)
            toast.success('Event removed')
            fetchEvents()
        } catch (error) {
            toast.error('Deletion failed')
        }
    }

    const getEventColor = (type: string) => {
        switch (type) {
            case 'EXAM': return 'bg-rose-50 text-rose-600 border-rose-100'
            case 'HOLIDAY': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'DEADLINE': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'EVENT': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
            default: return 'bg-primary-50 text-primary-600 border-primary-100' // ACADEMIC
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></span>
                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Schedule Management</p>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Academic <span className="text-gray-400 font-medium italic">Calendar</span></h1>
                    </div>
                    <button
                        onClick={() => {
                            setEditingId(null)
                            setFormData({ title: '', description: '', type: 'ACADEMIC', date: '' })
                            setIsModalOpen(true)
                        }}
                        className="flex items-center justify-center gap-3 bg-primary-600 text-white px-8 py-4 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/10 font-black uppercase tracking-widest text-[10px] active:scale-95 group"
                    >
                        <FiPlus className="group-hover:rotate-90 transition-transform" /> Schedule Event
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 p-3 mb-10 flex items-center shadow-sm">
                    <FiSearch className="ml-6 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search events by title or description..."
                        className="w-full px-6 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900 placeholder:text-gray-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {events.length === 0 ? (
                    <div className="py-24 text-center bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
                        <div className="w-16 h-16 bg-primary-50 border border-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FiCalendar size={28} className="text-primary-500 opacity-50" />
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">No Events Scheduled</h3>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold">The global academic calendar is empty.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredEvents.map((event) => (
                            <div key={event._id} className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary-200 hover:shadow-lg transition-all group">
                                <div className="flex items-start md:items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary-400">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                        <span className="text-xl font-black text-gray-900 leading-none mt-1 group-hover:text-primary-600">{new Date(event.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-black text-gray-900 tracking-tight">{event.title}</h3>
                                            <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${getEventColor(event.type)}`}>
                                                {event.type}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 max-w-2xl">{event.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end md:self-auto">
                                    <button onClick={() => handleEdit(event)} className="p-4 bg-gray-50 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-white border border-transparent hover:border-primary-100 transition-all shadow-sm active:scale-95">
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(event._id)} className="p-4 bg-gray-50 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-100 transition-all shadow-sm active:scale-95">
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create/Edit Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">{editingId ? 'Edit' : 'Schedule'} <span className="text-primary-600">Event</span></h2>
                            <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><FiXCircle size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Midterm Examinations Begin"
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Type</label>
                                    <select
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-[10px] font-black uppercase"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="ACADEMIC">Academic</option>
                                        <option value="EXAM">Examination</option>
                                        <option value="HOLIDAY">Holiday</option>
                                        <option value="DEADLINE">Deadline</option>
                                        <option value="EVENT">Special Event</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-[10px] font-black uppercase text-gray-900"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description (Optional)</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300 resize-none h-24"
                                    placeholder="Brief details about the event..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95">
                                {editingId ? 'Save Changes' : 'Broadcast Event'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
