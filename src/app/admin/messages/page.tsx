'use client'

import { useState, useEffect } from 'react'
import { FiMail, FiMessageSquare, FiSend, FiClock, FiUser, FiArrowLeft, FiCheckCircle, FiMoreHorizontal, FiLock, FiUnlock, FiSearch, FiInbox } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminMessages() {
    const { user } = useAuth()
    const [threads, setThreads] = useState<any[]>([])
    const [selectedThread, setSelectedThread] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [reply, setReply] = useState('')
    const [isInternal, setIsInternal] = useState(false)
    const [sending, setSending] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchThreads()
    }, [])

    const fetchThreads = async () => {
        try {
            const response = await axios.get('/api/admin/messages')
            setThreads(response.data)
            if (selectedThread) {
                const updated = response.data.find((t: any) => t.threadId === selectedThread.threadId)
                if (updated) setSelectedThread(updated)
            }
        } catch (error) {
            toast.error('Failed to sync communications')
        } finally {
            setLoading(false)
        }
    }

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reply.trim() || !selectedThread) return

        setSending(true)
        try {
            await axios.post('/api/messages', {
                content: reply,
                threadId: selectedThread.threadId,
                receiverId: selectedThread.student?._id,
                isAdminSupport: true,
                isInternal: isInternal,
                subject: selectedThread.subject
            })
            setReply('')
            setIsInternal(false)
            fetchThreads()
            toast.success('Reply dispatched')
        } catch (error) {
            toast.error('Dispatch failed')
        } finally {
            setSending(false)
        }
    }

    const filteredThreads = threads.filter(t =>
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd]">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 h-[calc(100vh-100px)] flex flex-col">

                {/* Header */}
                <div className="flex flex-row items-center justify-between gap-4 mb-8">
                    <div>
                        <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em] mb-1">Ecosystem // Support</p>
                        <h1 className="text-3xl font-black text-gray-950 tracking-tighter leading-none uppercase">Help <span className="text-primary-600">Desk.</span></h1>
                    </div>
                </div>

                <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">

                    {/* List Column */}
                    <div className={`${selectedThread ? 'hidden lg:flex' : 'flex'} lg:col-span-4 flex-col gap-6 overflow-hidden`}>
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/10">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search inquiries..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-mono uppercase tracking-widest"
                                    />
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto no-scrollbar p-2 space-y-1">
                                {filteredThreads.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <FiInbox className="mx-auto text-gray-200 mb-4" size={40} />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inbox Empty</p>
                                    </div>
                                ) : (
                                    filteredThreads.map((thread) => (
                                        <button
                                            key={thread.threadId}
                                            onClick={() => setSelectedThread(thread)}
                                            className={`w-full text-left p-4 rounded-3xl transition-all group ${selectedThread?.threadId === thread.threadId ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'hover:bg-gray-50 border border-transparent hover:border-gray-100'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={`text-[11px] font-black uppercase tracking-tight truncate pr-4 ${selectedThread?.threadId === thread.threadId ? 'text-white' : 'text-gray-950'}`}>
                                                    {thread.subject}
                                                </h3>
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${selectedThread?.threadId === thread.threadId ? 'text-white/60' : 'text-gray-400'}`}>
                                                    {new Date(thread.lastMessage.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${selectedThread?.threadId === thread.threadId ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-600'}`}>
                                                    {thread.student?.firstName?.[0] || 'S'}
                                                </div>
                                                <p className={`text-[10px] font-bold flex-grow truncate ${selectedThread?.threadId === thread.threadId ? 'text-white/80' : 'text-gray-500'}`}>
                                                    {thread.student?.firstName} {thread.student?.lastName}
                                                </p>
                                                {thread.unreadCount > 0 && (
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Column */}
                    <div className={`${!selectedThread ? 'hidden lg:flex' : 'flex'} lg:col-span-8 flex-col gap-6 overflow-hidden relative`}>
                        {selectedThread ? (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
                                {/* Chat Header */}
                                <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between z-10">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setSelectedThread(null)} className="lg:hidden p-2 bg-gray-50 rounded-xl text-gray-500">
                                            <FiArrowLeft />
                                        </button>
                                        <div>
                                            <h2 className="text-sm font-black text-gray-950 uppercase tracking-tight">{selectedThread.subject}</h2>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedThread.student?.firstName} {selectedThread.student?.lastName} • {selectedThread.student?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-emerald-50 rounded-lg flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest tracking-[0.2em]">Open Inquiry</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Body */}
                                <div className="flex-grow overflow-y-auto no-scrollbar p-8 space-y-6 bg-gray-50/30">
                                    {[...selectedThread.messages].reverse().map((msg: any) => {
                                        const isFromMe = msg.sender?._id === user?._id || (typeof msg.sender === 'string' && msg.sender === user?._id)
                                        return (
                                            <div key={msg._id} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}>
                                                    <div className={`p-5 rounded-[2rem] text-xs font-semibold leading-relaxed shadow-sm relative ${msg.isInternal ? 'bg-amber-100 border border-amber-200 text-amber-900' :
                                                            isFromMe ? 'bg-gray-950 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-900 rounded-tl-none'
                                                        }`}>
                                                        {msg.isInternal && <FiLock className="absolute -top-2 -left-2 p-1 w-5 h-5 bg-amber-200 rounded-full text-amber-600" />}
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-2 px-4">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isFromMe && ' • Dispatcher'}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Chat Input */}
                                <div className="p-6 border-t border-gray-100 bg-white">
                                    <form onSubmit={handleSendReply} className="space-y-4">
                                        <div className="relative group">
                                            <textarea
                                                placeholder="Compose official response..."
                                                value={reply}
                                                onChange={(e) => setReply(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] p-5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-500/5 focus:bg-white transition-all resize-none min-h-[120px]"
                                            ></textarea>

                                            <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all border ${isInternal ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={isInternal}
                                                        onChange={(e) => setIsInternal(e.target.checked)}
                                                    />
                                                    {isInternal ? <FiLock size={12} /> : <FiUnlock size={12} />}
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Internal Note</span>
                                                </label>
                                                <button
                                                    type="submit"
                                                    disabled={sending || !reply.trim()}
                                                    className="px-6 py-3 bg-gray-950 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-black active:scale-95 transition-all shadow-xl disabled:bg-gray-100 disabled:text-gray-300"
                                                >
                                                    {sending ? <FiClock className="animate-spin" /> : <><FiSend /> Dispatch</>}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center p-20 text-center h-full">
                                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 mb-8 border border-gray-50">
                                    <FiMessageSquare size={48} />
                                </div>
                                <h2 className="text-xl font-black text-gray-950 uppercase tracking-tighter mb-4">Institutional Inbox</h2>
                                <p className="text-sm font-medium text-gray-500 max-w-sm">Select an inquiry from the directory to initiate human-in-the-loop support or academic resolution.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
