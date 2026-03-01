'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiUsers, FiSearch, FiFilter, FiMoreVertical, FiPlus, FiCpu, FiGlobe, FiDatabase, FiGrid, FiXCircle, FiEdit2, FiTrash2, FiMail, FiHash, FiBookOpen, FiActivity, FiShield, FiClock, FiMaximize2 } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function StudentManagement() {
    const [students, setStudents] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [formData, setFormData] = useState({
        matricNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        level: 100,
        password: '',
        generatedPassword: ''
    })

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let pass = '';
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    }

    const generateMatricNumber = () => {
        const year = new Date().getFullYear().toString().slice(-2);
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        return `STU/${year}/${randomDigits}`;
    }

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [studentRes, deptRes] = await Promise.all([
                axios.get('/api/admin/students'),
                axios.get('/api/admin/departments')
            ])
            setStudents(studentRes.data)
            setDepartments(deptRes.data)
        } catch (error) {
            toast.error('Student directory sync failed')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredStudents = students.filter(s =>
        s.userId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.userId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsScanning(true)
            if (editingId) {
                await axios.patch(`/api/admin/students/${editingId}`, formData)
                toast.success('Student profile updated')
            } else {
                await axios.post('/api/admin/students', formData)
                toast.success('New student registered')
            }
            setIsModalOpen(false)
            setEditingId(null)
            setFormData({ matricNumber: '', firstName: '', lastName: '', email: '', department: '', level: 100, password: '', generatedPassword: '' })
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Operation denied')
        } finally {
            setTimeout(() => setIsScanning(false), 1000)
        }
    }

    const handleEdit = (student: any) => {
        setEditingId(student._id)
        setFormData({
            matricNumber: student.matricNumber,
            firstName: student.userId?.firstName || '',
            lastName: student.userId?.lastName || '',
            email: student.userId?.email || '',
            department: student.department,
            level: student.level,
            password: '',
            generatedPassword: ''
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this student record?')) return
        try {
            setIsScanning(true)
            await axios.delete(`/api/admin/students/${id}`)
            toast.success('Student removed from registry')
            fetchData()
        } catch (error) {
            toast.error('Delete failed')
        } finally {
            setTimeout(() => setIsScanning(false), 800)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.2)]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden">
            {/* Background System Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                {/* Identity Hub Header */}
                <div className="bg-[#0a0a0b] rounded-[3rem] p-12 mb-12 shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-rose-500 animate-ping' : 'bg-blue-500 animate-pulse'} shadow-[0_0_15px_#3b82f6]`}></div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">
                                    {isScanning ? 'Updating database...' : 'Student Management'}
                                </p>
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-6">Student <span className="text-blue-500 italic">Management</span></h1>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <FiUsers className="text-blue-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{students.length} Registered Students</span>
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <FiActivity className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{students.filter(s => s.status === 'ACTIVE').length} Active Students</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setEditingId(null)
                                const newMatric = generateMatricNumber()
                                const newPass = generatePassword()
                                setFormData({
                                    matricNumber: newMatric,
                                    firstName: '',
                                    lastName: '',
                                    email: '',
                                    department: '',
                                    level: 100,
                                    password: newPass,
                                    generatedPassword: newPass
                                })
                                setIsModalOpen(true)
                            }}
                            className="bg-blue-600 text-white px-10 py-5 rounded-2xl hover:bg-blue-500 transition-all shadow-[0_15px_40px_rgba(59,130,246,0.3)] font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 group flex items-center gap-4"
                        >
                            <FiPlus className="group-hover:rotate-180 transition-transform duration-500" /> Add New Student
                        </button>
                    </div>
                </div>

                {/* Secure Search Bar */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-5 mb-12 flex flex-col md:flex-row items-center gap-5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-50/30 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                    <div className="relative flex-grow w-full">
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-all font-black" />
                        <input
                            type="text"
                            placeholder="Search by Name, Matric, or Email..."
                            className="w-full pl-16 pr-8 py-5 bg-transparent border-transparent rounded-2xl focus:ring-0 transition-all text-xs font-black text-gray-900 placeholder:text-gray-300 uppercase tracking-widest"
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="px-8 py-5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-white rounded-2xl font-black uppercase tracking-widest text-[9px] border border-transparent hover:border-blue-100 flex items-center gap-3 active:scale-95 transition-all shadow-sm">
                            <FiFilter /> Filter View
                        </button>
                    </div>
                </div>

                {/* Identity Signal Table */}
                <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-2xl shadow-gray-200/50">
                    <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gray-50/20">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm">
                                <FiDatabase size={20} />
                            </div>
                            <div>
                                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em]">Student Directory</h2>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Management of all registered student accounts</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Student Information</th>
                                    <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] hide-mobile md:table-cell">Academic Details</th>
                                    <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Status</th>
                                    <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-blue-50/20 transition-all group relative">
                                        <td className="p-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-[#0a0a0b] text-blue-500 rounded-2xl flex items-center justify-center font-black text-lg border border-white/10 group-hover:scale-110 transition-all shadow-xl group-hover:shadow-blue-500/20">
                                                    {(student.userId?.firstName?.[0] || '?')}
                                                </div>
                                                <div>
                                                    <Link href={`/admin/students/${student._id}`} className="text-sm font-black text-gray-900 leading-none mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight cursor-pointer block">{student.userId?.firstName} {student.userId?.lastName}</Link>
                                                    <div className="flex items-center gap-2">
                                                        <FiMail size={10} className="text-gray-300" />
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{student.userId?.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-10 hide-mobile md:table-cell">
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">{student.matricNumber}</p>
                                                <p className="text-xs font-bold text-gray-900 tracking-tight uppercase">{student.department}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{student.level} Tier</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-10">
                                            <div className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all ${student.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white'
                                                : student.status === 'GRADUATED'
                                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                    : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2.5 ${student.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse group-hover:bg-white' : student.status === 'GRADUATED' ? 'bg-blue-400' : 'bg-rose-500'}`}></span>
                                                {student.status === 'ACTIVE' ? 'Active' : student.status}
                                            </div>
                                        </td>
                                        <td className="p-10 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <Link href={`/admin/students/${student._id}`} className="p-3.5 bg-white rounded-xl text-gray-400 hover:text-blue-600 border border-gray-100 shadow-sm active:scale-95 transition-all">
                                                    <FiMaximize2 size={16} />
                                                </Link>
                                                <button onClick={() => handleEdit(student)} className="p-3.5 bg-white rounded-xl text-gray-400 hover:text-blue-600 border border-gray-100 shadow-sm active:scale-95 transition-all">
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(student._id)} className="p-3.5 bg-white rounded-xl text-gray-400 hover:text-rose-600 border border-gray-100 shadow-sm active:scale-95 transition-all">
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Registry Modification Interface */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/40 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-12 shadow-2xl border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-3 uppercase">{editingId ? 'Edit' : 'Add'} <span className="text-blue-600">Student</span></h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] font-black">Student Registration Form</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><FiXCircle size={28} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-100 transition-all text-sm outline-none"
                                            value={formData.firstName || ''}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-100 transition-all text-sm outline-none"
                                            value={formData.lastName || ''}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-100 transition-all text-sm outline-none"
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Matric Number (Auto)</label>
                                        <div className="w-full px-8 py-5 bg-[#0a0a0b] border border-white/5 rounded-2xl text-sm font-black text-blue-500 uppercase tracking-widest">
                                            {formData.matricNumber || 'GEN-PENDING'}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Assigned Sector</label>
                                        <select
                                            required
                                            className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-100 transition-all text-[10px] font-black uppercase outline-none"
                                            value={formData.department || ''}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="">Select Department...</option>
                                            {departments.map(d => <option key={d._id} value={d.name}>{d.code} Department</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Subject Level</label>
                                        <select
                                            required
                                            className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-100 transition-all text-[10px] font-black uppercase outline-none"
                                            value={formData.level || 100}
                                            onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                                        >
                                            {[100, 200, 300, 400, 500].map(l => (
                                                <option key={l} value={l}>{l} Level</option>
                                            ))}
                                        </select>
                                    </div>

                                    {!editingId && (
                                        <div className="p-6 bg-[#0a0a0b] border border-white/5 rounded-3xl mt-4">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-4">Generated Password</label>
                                            <div className="flex items-center justify-between bg-white/5 px-6 py-4 rounded-xl border border-white/10">
                                                <code className="text-sm font-mono font-black text-blue-500">{formData.generatedPassword}</code>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(formData.generatedPassword)
                                                        toast.success('Access key copied')
                                                    }}
                                                    className="text-[9px] font-black text-white hover:text-blue-500 uppercase tracking-widest transition-colors underline decoration-blue-500/50"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={isScanning} className="w-full py-7 bg-gray-900 text-white rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-black transition-all shadow-2xl shadow-black/20 active:scale-95 disabled:opacity-50 mt-10">
                                {isScanning ? 'Saving data...' : editingId ? 'Update Student Record' : 'Save New Student'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
