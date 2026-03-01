"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiMinimize2, FiMaximize2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Vercel AI SDK useChat hook
    const { messages, input, handleInputChange, handleSubmit, isLoading, error }: any = useChat({
        api: '/api/ai/chat',
    } as any);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 20 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleOpen}
                        className="fixed bottom-6 right-6 p-5 rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-primary-600 text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.5)] transition-all z-50 flex items-center justify-center group border border-white/20"
                    >
                        <div className="absolute inset-0 bg-white/20 blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100 rounded-full"></div>
                        <FiMessageSquare className="w-6 h-6 relative z-10" />
                        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-black uppercase tracking-widest text-[10px] group-hover:ml-3 relative z-10">
                            Nexus AI Assistant
                        </span>
                        {/* Glowing Pulse */}
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 shadow-lg z-20">
                            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: 'blur(0px)',
                            height: isMinimized ? '80px' : '600px',
                        }}
                        exit={{ opacity: 0, y: 100, scale: 0.9, filter: 'blur(10px)' }}
                        className={`fixed right-6 bottom-6 w-80 sm:w-[400px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] z-50 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isMinimized ? 'h-[80px]' : 'h-[600px] max-h-[85vh]'}`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-950 via-gray-900 to-indigo-950 text-white relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 blur-[50px] animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500 blur-[40px]"></div>
                            </div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                                    ✨
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-widest leading-none mb-1">Nexus AI</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Intelligence</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 relative z-10">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                                >
                                    {isMinimized ? <FiMaximize2 className="w-4 h-4" /> : <FiMinimize2 className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={toggleOpen}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90 text-gray-400 hover:text-white"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        {!isMinimized && (
                            <>
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth no-scrollbar relative">
                                    {messages.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-col items-center justify-center h-full text-center space-y-6 p-8"
                                        >
                                            <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-5xl mb-2">
                                                🪐
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2 tracking-tight">How can I assist your journey?</h4>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                                                    I'm your institutional brain. Ask about courses, grades, payments, or campus life.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                                {['Fees structure', 'Course list', 'Library access'].map(tag => (
                                                    <span key={tag} className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-400 group hover:text-indigo-600 hover:border-indigo-100 transition-all cursor-pointer">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {messages.map((m: any, idx: number) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: 0.1 }}
                                            key={m.id}
                                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-[1.5rem] p-4 text-[13px] leading-relaxed relative group
                                                    ${m.role === 'user'
                                                        ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20 font-medium'
                                                        : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm font-medium'
                                                    }`}
                                            >
                                                <div className="whitespace-pre-wrap">{m.content}</div>
                                                <div className={`absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase tracking-widest text-gray-400 ${m.role === 'user' ? 'right-0' : 'left-0'}`}>
                                                    {m.role === 'user' ? 'You' : 'Nexus Intelligence'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                                    className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                                                />
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                                    className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                                                />
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                                                    className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="text-[10px] font-black uppercase tracking-widest text-rose-500 text-center p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/50">
                                            Neural Link Fractured. Retry Connection.
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <form
                                    onSubmit={handleSubmit}
                                    className="p-6 bg-white/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-white/5 backdrop-blur-md"
                                >
                                    <div className="relative group">
                                        <input
                                            className="w-full pl-6 pr-14 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 dark:text-white transition-all text-sm font-bold placeholder:text-gray-400 shadow-inner group-hover:shadow-md"
                                            value={input}
                                            placeholder="Synthesize inquiry..."
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading || !(input || '').trim()}
                                            className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-gray-950 hover:bg-black disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:text-gray-300 text-white rounded-xl transition-all flex items-center justify-center shadow-lg active:scale-95"
                                        >
                                            <FiSend className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
                                        </button>
                                    </div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-4 text-center">
                                        Powered by Nexus Core v2.0
                                    </p>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
