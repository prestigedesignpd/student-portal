'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    FiGrid,
    FiBookOpen,
    FiDollarSign,
    FiUser,
    FiBell,
    FiChevronLeft,
    FiChevronRight,
    FiAward,
    FiMessageSquare,
    FiBook,
    FiHome,
    FiShield,
    FiCalendar
} from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'

const studentNavigation = [
    { name: 'Dashboard Home', href: '/dashboard', icon: FiGrid, detail: 'Overview' },
    { name: 'Notifications', href: '/notifications', icon: FiBell, detail: 'Academic Alerts' },
    { name: 'Academic Calendar', href: '/calendar', icon: FiCalendar, detail: 'Schedule' },
    { name: 'Course Materials', href: '/library', icon: FiBook, detail: 'Resources' },
    { name: 'Course Registration', href: '/courses', icon: FiBookOpen, detail: 'Curriculum' },
    { name: 'Program Structure', href: '/program', icon: FiShield, detail: 'Roadmap' },
    { name: 'Transcript (Grades)', href: '/results', icon: FiAward, detail: 'Academic' },
    { name: 'Fee Management', href: '/payments', icon: FiDollarSign, detail: 'Payments' },
    { name: 'Hostel Booking', href: '/hostels', icon: FiHome, detail: 'Housing' },
    { name: 'Support Mail', href: 'mailto:support@nexus.edu', icon: FiMessageSquare, detail: 'Contact Us' },
    { name: 'Profile Settings', href: '/profile', icon: FiUser, detail: 'Account' },
]

interface StudentSidebarProps {
    isMobileMenuOpen?: boolean
    onClose?: () => void
    isCollapsed: boolean
    onCollapseToggle: () => void
}

export default function StudentSidebar({ isMobileMenuOpen, onClose, isCollapsed, onCollapseToggle }: StudentSidebarProps) {
    const pathname = usePathname()
    const { user } = useAuth() as any

    const isActive = (path: string) => pathname === path

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-[55] md:hidden transition-all duration-200"
                    onClick={onClose}
                ></div>
            )}

            <aside
                className={`flex flex-col fixed top-0 h-screen z-[60] bg-gray-950 border-r border-gray-800/50 transition-all duration-200 ease-in-out 
                    ${isMobileMenuOpen ? 'left-0' : '-left-full'} 
                    md:left-0 
                    ${isCollapsed ? 'w-20' : 'w-72'} 
                    overflow-hidden shadow-2xl`}
            >
                {/* Modern Grid Background Overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                {/* Elegant Top Glow */}
                <div className="absolute top-0 left-0 right-0 h-64 bg-primary-600/10 blur-[80px] z-0 pointer-events-none"></div>

                {/* Header Spacer - Increased height for mobile to prevent header overlap */}
                <div className="h-20 lg:h-16 shrink-0 relative z-10"></div>

                {/* Profile Section */}
                <div className={`px-4 py-3 border-b border-gray-800/50 relative z-10 bg-gradient-to-b from-white/[0.02] to-transparent`}>
                    <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'items-center gap-3'}`}>
                        <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center font-black text-gray-300 text-xs relative z-10 overflow-hidden shadow-xl">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user?.firstName?.[0] || 'S'
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-md border-2 border-gray-950 z-20 shadow-md"></div>
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col animate-in fade-in slide-in-from-left-3 duration-200">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[140px]">
                                    {user?.firstName || 'Student'} {user?.lastName || ''}
                                </h4>
                                <p className="text-[9px] font-bold text-gray-400 mb-0.5 truncate max-w-[140px]">
                                    @{user?.username || 'student'}
                                </p>
                                <div className="mt-0.5 inline-flex items-center gap-1 bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded-full w-fit">
                                    <span className="w-1 h-1 rounded-full bg-primary-500 animate-pulse"></span>
                                    <span className="text-[7px] font-black text-primary-400 uppercase tracking-widest">
                                        {user?.student?.matricNumber || 'STU-44021'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-grow py-3 px-3 space-y-1 overflow-y-auto hide-scrollbar relative z-10">
                    {studentNavigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive(item.href)
                                ? 'bg-primary-600/10 text-primary-50 border border-primary-500/20 shadow-inner'
                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-gray-800'
                                }`}
                            title={isCollapsed ? item.name : ''}
                        >
                            {isActive(item.href) && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                            )}

                            <item.icon size={17} className={`flex-shrink-0 transition-all duration-300 ${isActive(item.href) ? 'text-primary-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:scale-110 group-hover:text-gray-200'}`} />

                            {!isCollapsed && (
                                <div className="flex flex-grow items-center justify-between animate-in fade-in slide-in-from-left-4 duration-200">
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${isActive(item.href) ? 'text-primary-50' : 'text-gray-200'}`}>{item.name}</span>
                                        <p className="text-[7px] font-bold text-gray-500 uppercase tracking-widest mt-1 group-hover:text-gray-400 transition-colors">{item.detail}</p>
                                    </div>
                                    <FiChevronRight size={10} className={`text-gray-600 transition-transform ${isActive(item.href) ? 'translate-x-0 text-primary-400' : 'group-hover:translate-x-1 group-hover:text-gray-400'}`} />
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Footer / Collapser */}
                <div className="p-4 border-t border-gray-800/50 bg-gray-950/50 relative z-10 backdrop-blur-md">
                    <button
                        onClick={onCollapseToggle}
                        className="w-full flex items-center justify-center p-2.5 rounded-xl bg-gray-900 text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-gray-800 shadow-sm active:scale-95 group"
                    >
                        {isCollapsed ? <FiChevronRight size={16} className="group-hover:scale-110 transition-transform" /> : <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest">
                            <FiChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Collapse Hub</span>
                        </div>}
                    </button>
                </div>
            </aside>
        </>
    )
}
