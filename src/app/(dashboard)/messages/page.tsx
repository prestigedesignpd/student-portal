'use client'

import { useState, useEffect } from 'react'
import { FiMessageSquare, FiSend, FiClock, FiUser, FiArrowRight, FiCheck, FiRefreshCw, FiInbox, FiInfo } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function Messages() {
    const { user } = useAuth()
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newContent, setNewContent] = useState('')
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        fetchMessages()
        const interval = setInterval(fetchMessages, 10000) // Polling for demo
        return () => clearInterval(interval)
    }, [])

    const fetchMessages = async () => {
        try {
            const response = await axios.get('/api/messages')
            setMessages(response.data)
        } catch (error) {
            console.error('Fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newContent.trim()) return

        setIsSending(true)
        try {
            await axios.post('/api/messages', {
                content: newContent,
                isAdminSupport: true,
                subject: 'Help Desk Inquiry'
            })
            setNewContent('')
            fetchMessages()
            toast.success('Inquiry dispatched')
        } catch (error) {
            toast.error('Failed to link with support')
        } finally {
            setIsSending(false)
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
        <div className="relative overflow-hidden bg-[#fbfcfd] min-h-screen">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 pb-24 md:pb-12">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1">Communication / Help Desk</p>
                        <h1 className="text-3xl font-black text-gray-950 tracking-tighter leading-none uppercase">Support <span className="text-primary-600">Sync.</span></h1>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Support Online</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Input Column */}
                    <div className="md:col-span-1">
                        <div className="sticky top-6 space-y-6">
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                                <form onSubmit={handleSend} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                                                <FiMessageSquare size={16} />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-950">New Inquiry</h3>
                                        </div>
                                        <textarea
                                            placeholder="Describe your issue or request here..."
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-xs font-bold text-gray-900 min-h-[180px] outline-none"
                                            value={newContent}
                                            onChange={(e) => setNewContent(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        disabled={isSending || !newContent.trim()}
                                        className="w-full py-4 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:bg-gray-100 disabled:text-gray-300"
                                    >
                                        {isSending ? <FiRefreshCw className="animate-spin" /> : <><FiSend /> Dispatch Inquiry</>}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-indigo-50/40 p-6 rounded-2xl border border-indigo-100/50">
                                <h4 className="text-[10px] font-black text-indigo-950 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <FiInfo /> Security Note
                                </h4>
                                <p className="text-[10px] text-indigo-900/60 leading-relaxed italic">
                                    Our support channels are encrypted. Administrative responses typically occur within institutional hours (8AM - 4PM).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Feed Column */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Inquiry History</h2>
                            <div className="h-[1px] flex-grow bg-gray-50"></div>
                        </div>

                        {messages.length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-gray-50 flex flex-col items-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-6 border border-gray-50">
                                    <FiInbox size={32} />
                                </div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Active Discussions</h3>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((msg) => {
                                    const isFromMe = msg.sender?._id === user?._id || (typeof msg.sender === 'string' && msg.sender === user?._id)
                                    return (
                                        <div
                                            key={msg._id}
                                            className={`group p-6 rounded-[2rem] border transition-all duration-500 overflow-hidden relative ${isFromMe ? 'bg-white border-gray-100 hover:border-primary-100' : 'bg-primary-50/30 border-primary-100/50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4 relative z-10">
                                                <div className="flex gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isFromMe ? 'bg-gray-50 text-gray-400 border-gray-100' : 'bg-primary-600 text-white border-transparent'
                                                        }`}>
                                                        <FiUser size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">
                                                                {isFromMe ? 'You' : (msg.sender?.role === 'ADMIN' ? 'Admin Support' : 'Support')}
                                                            </span>
                                                            {!isFromMe && <FiCheck className="text-primary-600" size={10} />}
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                            {msg.content}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="flex items-center justify-end gap-1.5 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                                        <FiClock /> {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date Overlay */}
                                            <div className="mt-4 pt-4 border-t border-gray-50/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                                                    {new Date(msg.createdAt).toLocaleDateString()}
                                                </span>
                                                {!isFromMe && (
                                                    <span className="text-[8px] font-black text-primary-600 uppercase tracking-[0.2em] flex items-center gap-1">
                                                        Official Response <FiArrowRight />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
