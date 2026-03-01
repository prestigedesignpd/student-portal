'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiBook, FiPlus, FiSearch, FiXCircle, FiEdit2, FiTrash2, FiClock, FiBookmark, FiRefreshCw } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function LibraryManagement() {
    const [books, setBooks] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        quantity: 1,
        category: 'ACADEMIC'
    })

    useEffect(() => {
        fetchBooks()
    }, [])

    const fetchBooks = async () => {
        try {
            setIsLoading(true)
            const response = await axios.get('/api/admin/library')
            setBooks(response.data)
        } catch (error) {
            toast.error('Failed to sync library data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            if (editingId) {
                await axios.patch('/api/admin/library', { id: editingId, ...formData })
                toast.success('Inventory updated')
            } else {
                await axios.post('/api/admin/library', formData)
                toast.success('Book registered')
            }
            setIsModalOpen(false)
            setEditingId(null)
            setFormData({ title: '', author: '', isbn: '', quantity: 1, category: 'ACADEMIC' })
            fetchBooks()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Operation failed')
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = (book: any) => {
        setEditingId(book._id)
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            quantity: book.quantity,
            category: book.category
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently remove this book from records? Current loans must be cleared first.')) return
        try {
            await axios.delete(`/api/admin/library?id=${id}`)
            toast.success('Record removed')
            fetchBooks()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Deletion failed')
        }
    }

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <Link href="/admin/dashboard" className="group/header active:scale-95 transition-transform">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Institutional Repository</p>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">Library <span className="text-gray-400 font-medium italic">Inventory</span></h1>
                    </Link>
                    <div className="flex gap-3">
                        <Link
                            href="/admin/library/loans"
                            className="flex items-center justify-center gap-3 bg-white border border-gray-100 text-gray-600 px-6 py-4 rounded-2xl hover:bg-gray-50 transition-all font-black uppercase tracking-widest text-[10px] active:scale-95"
                        >
                            <FiClock /> Loan Tracking
                        </Link>
                        <button
                            onClick={() => {
                                setEditingId(null)
                                setFormData({ title: '', author: '', isbn: '', quantity: 1, category: 'ACADEMIC' })
                                setIsModalOpen(true)
                            }}
                            className="flex items-center justify-center gap-3 bg-gray-950 text-white px-8 py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 font-black uppercase tracking-widest text-[10px] active:scale-95 group"
                        >
                            <FiPlus className="group-hover:rotate-12 transition-transform" /> Register Book
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 p-2 mb-10 flex items-center shadow-sm max-w-2xl">
                    <div className="flex items-center flex-grow">
                        <FiSearch className="ml-6 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by ISBN, title or author..."
                            className="w-full px-6 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBooks.map((book) => (
                        <div key={book._id} className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:border-primary-200 transition-all shadow-sm hover:shadow-xl group relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 blur-[40px] group-hover:bg-primary-100 transition-colors"></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all group-hover:scale-110">
                                    <FiBook size={20} />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(book)} className="p-3 text-gray-300 hover:text-primary-600 transition-colors">
                                        <FiEdit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(book._id)} className="p-3 text-gray-300 hover:text-rose-600 transition-colors">
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-8 relative z-10">
                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-2 px-3 py-1 bg-primary-50 rounded-lg w-fit">{book.category}</p>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-2 group-hover:text-primary-700 transition-colors uppercase">{book.title}</h3>
                                <p className="text-sm font-bold text-gray-500 mb-6 italic">by {book.author}</p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                                    <FiBookmark size={10} /> ISBN: {book.isbn}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-50 relative z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Availability</span>
                                    <span className="text-[10px] font-black text-gray-950">{book.availableQuantity} / {book.quantity} Units</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-primary-500 h-full transition-all duration-1000"
                                        style={{ width: `${(book.availableQuantity / book.quantity) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredBooks.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No archive records discovered</p>
                    </div>
                )}
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">{editingId ? 'Modify' : 'Register'} Book</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Repository Entry</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-gray-950 transition-colors">
                                <FiXCircle size={32} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 outline-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Primary Author</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 outline-none"
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">ISBN-13 Reference</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 outline-none"
                                    value={formData.isbn}
                                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900 outline-none"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Classification</label>
                                    <select
                                        className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-[10px] font-black uppercase outline-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="ACADEMIC">Academic</option>
                                        <option value="FICTION">Fiction</option>
                                        <option value="REFERENCE">Reference</option>
                                        <option value="JOURNAL">Journal</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:bg-gray-400 mt-4"
                            >
                                {isSaving ? <FiRefreshCw className="animate-spin" /> : editingId ? 'Update Records' : 'Commit to Archive'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
