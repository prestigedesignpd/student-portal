'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle, FiPlus, FiUser, FiBook, FiRefreshCw, FiSearch, FiXCircle } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function LoanTracking() {
    const [loans, setLoans] = useState<any[]>([])
    const [books, setBooks] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const [formData, setFormData] = useState({
        studentId: '',
        bookId: '',
        dueDate: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [loansRes, booksRes, studentsRes] = await Promise.all([
                axios.get('/api/admin/library/loans'),
                axios.get('/api/admin/library'),
                axios.get('/api/admin/students')
            ])
            setLoans(loansRes.data)
            setBooks(booksRes.data.filter((b: any) => b.availableQuantity > 0))
            setStudents(studentsRes.data)
        } catch (error) {
            toast.error('Sync failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleIssueLoan = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await axios.post('/api/admin/library/loans', formData)
            toast.success('Loan issued successfully')
            setIsModalOpen(false)
            setFormData({ studentId: '', bookId: '', dueDate: '' })
            fetchData()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Issuance failed')
        } finally {
            setIsSaving(false)
        }
    }

    const handleReturn = async (loanId: string) => {
        try {
            await axios.patch('/api/admin/library/loans', { id: loanId, action: 'RETURN' })
            toast.success('Item returned to archive')
            fetchData()
        } catch (error) {
            toast.error('Return processing failed')
        }
    }

    const filteredLoans = loans.filter(l =>
        l.studentId?.matricNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.bookId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.studentId?.userId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-6">
                        <Link href="/admin/library" className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm active:scale-95">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Asset Lifecycle Tracking</p>
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Loan <span className="text-gray-400 font-medium italic">Management</span></h1>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-3 bg-primary-600 text-white px-8 py-4 rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 font-black uppercase tracking-widest text-[10px] active:scale-95"
                    >
                        <FiPlus /> Issue New Loan
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-2 mb-8 flex items-center shadow-sm max-w-xl">
                    <FiSearch className="ml-6 text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search loans by student or book title..."
                        className="w-full px-6 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Information</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Details</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeline</th>
                                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operational Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLoans.map((loan) => {
                                const isOverdue = new Date(loan.dueDate) < new Date() && loan.status === 'BORROWED'
                                return (
                                    <tr key={loan._id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                                    <FiUser size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 uppercase">{loan.studentId?.userId?.firstName} {loan.studentId?.userId?.lastName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{loan.studentId?.matricNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center border border-primary-100">
                                                    <FiBook size={16} />
                                                </div>
                                                <div className="max-w-[200px]">
                                                    <p className="text-xs font-black text-gray-900 uppercase truncate">{loan.bookId?.title}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ISBN: {loan.bookId?.isbn}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Out: {new Date(loan.loanDate).toLocaleDateString()}
                                                </div>
                                                <div className={`flex items-center gap-2 text-[10px] font-bold ${isOverdue ? 'text-rose-500' : 'text-gray-500'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`}></span> Due: {new Date(loan.dueDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            {loan.status === 'RETURNED' ? (
                                                <span className="inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <FiCheckCircle className="mr-2" /> Returned
                                                </span>
                                            ) : (
                                                <div className="flex justify-end items-center gap-4">
                                                    {isOverdue && (
                                                        <span className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                                                            <FiAlertCircle size={14} /> Overdue
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleReturn(loan._id)}
                                                        className="px-6 py-2.5 bg-gray-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                                                    >
                                                        Process Return
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">Issue Asset</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loan Configuration</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-gray-950 transition-colors">
                                <FiXCircle size={32} />
                            </button>
                        </div>

                        <form onSubmit={handleIssueLoan} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Select Student</label>
                                <select
                                    required
                                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-[10px] font-black uppercase outline-none"
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                >
                                    <option value="">Choose Student...</option>
                                    {students.map(s => (
                                        <option key={s._id} value={s._id}>{s.matricNumber} - {s.userId?.firstName} {s.userId?.lastName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Select Asset (Book)</label>
                                <select
                                    required
                                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-[10px] font-black uppercase outline-none"
                                    value={formData.bookId}
                                    onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                                >
                                    <option value="">Choose Book...</option>
                                    {books.map(b => (
                                        <option key={b._id} value={b._id}>{b.title} ({b.availableQuantity} left)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Due Date</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-[10px] font-black uppercase outline-none"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:bg-gray-400 mt-4"
                            >
                                {isSaving ? <FiRefreshCw className="animate-spin" /> : 'Authorize Allocation'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
