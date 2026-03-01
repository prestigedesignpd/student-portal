'use client'

import { useState, useEffect } from 'react'
import { FiMessageSquare, FiUser, FiSend, FiClock, FiSearch, FiCheck, FiMail, FiRefreshCw, FiInbox, FiActivity } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminSupport() {
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [replyContent, setReplyContent] = useState('')
    const [selectedThread, setSelectedThread] = useState<string | null>(null)
    const [isSending, setIsSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchMessages()
        const interval = setInterval(fetchMessages, 15000)
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

    // Grouping messages by student (sender)
    const threads = messages.reduce((acc: any, msg: any) => {
        const studentId = msg.isAdminSupport ? msg.sender?._id : (msg.sender?._id || msg.sender)
        if (!acc[studentId]) acc[studentId] = []
        acc[studentId].push(msg)
        return acc
    }, {})

    const threadList = Object.keys(threads).map(studentId => {
        const lastMsg = threads[studentId][0]
        const student = lastMsg.sender
        return {
            studentId,
            studentName: `${student?.firstName || 'Unknown'} ${student?.lastName || 'Student'}`,
            matric: student?.matricNumber || 'ADMIN-LINK',
            lastContent: lastMsg.content,
            timestamp: lastMsg.createdAt,
            unreadCount: 0 // Mocking for now
        }
    }).filter(t => t.studentName.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyContent.trim() || !selectedThread) return

        setIsSending(true)
        try {
            await axios.post('/api/messages', {
                content: replyContent,
                receiverId: selectedThread,
                isAdminSupport: false,
                subject: 'Re: Support Request'
            })
            setReplyContent('')
            fetchMessages()
            toast.success('Reply dispatched')
        } catch (error) {
            toast.error('Failed to send reply')
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
        <div className="min-h-screen bg-[#fbfcfd] text-gray-950 font-outfit relative overflow-hidden">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Institutional Relations</p>
                        </div>
                        <h1 className="text-3xl font-black text-gray-950 tracking-tighter leading-none">Support <span className="text-gray-400 font-medium italic">Terminal</span></h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
                    {/* Thread List */}
                    <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-50">
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    placeholder="Search inquiries..."
                                    className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all text-xs font-bold text-gray-900 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-2">
                            {threadList.map((thread) => (
                                <button
                                    key={thread.studentId}
                                    onClick={() => setSelectedThread(thread.studentId)}
                                    className={`w-full p-5 rounded-2xl text-left transition-all flex items-center gap-4 group ${selectedThread === thread.studentId ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${selectedThread === thread.studentId ? 'bg-white/20 border-white/30 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'
                                        }`}>
                                        <FiUser size={20} />
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-[10px] font-black uppercase tracking-tight truncate">{thread.studentName}</h4>
                                            <span className={`text-[8px] font-bold uppercase ${selectedThread === thread.studentId ? 'text-white/60' : 'text-gray-400'}`}>
                                                {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className={`text-[10px] font-medium truncate ${selectedThread === thread.studentId ? 'text-white/80' : 'text-gray-500'}`}>
                                            {thread.lastContent}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            {threadList.length === 0 && (
                                <div className="py-20 text-center">
                                    <FiInbox className="mx-auto text-gray-200 mb-4" size={32} />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Active Sessions</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 flex flex-col overflow-hidden shadow-sm relative">
                        {selectedThread ? (
                            <>
                                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                                            <FiUser size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none uppercase">
                                                {threadList.find(t => t.studentId === selectedThread)?.studentName}
                                            </h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                Active Support Session
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary-600 transition-colors">
                                            <FiMail size={16} />
                                        </button>
                                        <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-rose-600 transition-colors">
                                            <FiActivity size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-[radial-gradient(circle_at_center,_transparent_0%,_#fbfcfd_100%)]">
                                    {threads[selectedThread].slice().reverse().map((msg: any) => {
                                        const isFromAdmin = msg.sender?.role === 'ADMIN' || msg.isAdminSupport === false
                                        return (
                                            <div key={msg._id} className={`flex ${isFromAdmin ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] p-6 rounded-[2rem] shadow-sm relative overflow-hidden ${isFromAdmin ? 'bg-gray-950 text-white' : 'bg-white border border-gray-100 text-gray-900'
                                                    }`}>
                                                    <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                    <div className={`mt-3 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest ${isFromAdmin ? 'text-gray-400' : 'text-gray-400'
                                                        }`}>
                                                        <FiClock /> {new Date(msg.createdAt).toLocaleString()}
                                                        {isFromAdmin && <FiCheck className="text-emerald-500 ml-auto" />}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="p-8 border-t border-gray-50">
                                    <form onSubmit={handleSendReply} className="relative">
                                        <textarea
                                            placeholder="Compose authoritative response..."
                                            className="w-full pl-6 pr-24 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] focus:bg-white focus:ring-10 focus:ring-primary-500/5 transition-all text-xs font-bold text-gray-900 min-h-[100px] outline-none resize-none"
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSending || !replyContent.trim()}
                                            className="absolute right-3 bottom-3 w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/30 active:scale-95 disabled:bg-gray-200"
                                        >
                                            {isSending ? <FiRefreshCw className="animate-spin" /> : <FiSend size={24} />}
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-20 opacity-40">
                                <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200 mb-8 border-2 border-dashed border-gray-200">
                                    <FiMessageSquare size={64} />
                                </div>
                                <h3 className="text-sm font-black text-gray-950 uppercase tracking-[0.3em]">Communication Idle</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 max-w-xs">
                                    Select a transmission thread from the repository to initialize support interaction.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
