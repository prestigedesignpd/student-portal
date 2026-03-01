'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    FiShield,
    FiUsers,
    FiBook,
    FiDollarSign,
    FiHome,
    FiChevronLeft,
    FiChevronRight,
    FiSettings,
    FiCheckSquare,
    FiLayers,
    FiGrid,
    FiSend,
    FiAward,
    FiCalendar,
    FiMessageSquare,
    FiSearch,
    FiArchive
} from 'react-icons/fi'

const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FiGrid, detail: 'Overview' },
    { name: 'Faculties', href: '/admin/academics', icon: FiLayers, detail: 'Management' },
    { name: 'Students', href: '/admin/students', icon: FiUsers, detail: 'Directory' },
    { name: 'Courses', href: '/admin/courses', icon: FiBook, detail: 'Academics' },
    { name: 'Library', href: '/admin/library', icon: FiArchive, detail: 'Books' },
    { name: 'Announcements', href: '/admin/communications', icon: FiSend, detail: 'Messages' },
    { name: 'Support', href: '/admin/support', icon: FiMessageSquare, detail: 'Help' },
    { name: 'Student Audit', href: '/admin/audit', icon: FiSearch, detail: 'Records' },
    { name: 'Registrations', href: '/admin/registrations', icon: FiCheckSquare, detail: 'Applications' },
    { name: 'Grades', href: '/admin/grades', icon: FiAward, detail: 'Results' },
    { name: 'Fees', href: '/admin/fees', icon: FiDollarSign, detail: 'Billing' },
    { name: 'Hostels', href: '/admin/hostels', icon: FiHome, detail: 'Housing' },
    { name: 'Calendar', href: '/admin/calendar', icon: FiCalendar, detail: 'Dates' },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings, detail: 'Setup' },
]

export default function AdminSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <aside
            className={`hidden md:flex flex-col fixed left-0 top-0 h-screen z-[60] bg-white border-r border-gray-100 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
        >
            {/* Header spacer to sit below navbar */}
            <div className="h-20 shrink-0"></div>

            {/* Navigation Section */}
            <nav className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <div className={`px-4 mb-4 ${isCollapsed ? 'text-center' : ''}`}>
                    <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.2em]">Management</p>
                </div>

                {adminNavigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive(item.href)
                            ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-100'
                            }`}
                        title={isCollapsed ? item.name : ''}
                    >
                        {isActive(item.href) && (
                            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                        )}

                        <item.icon size={20} className={`flex-shrink-0 transition-transform duration-300 ${isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:scale-110 group-hover:text-primary-500'}`} />

                        {!isCollapsed && (
                            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                                <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 group-hover:text-gray-500 transition-colors">{item.detail}</span>
                            </div>
                        )}
                    </Link>
                ))}
            </nav>

            {/* System Status / Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border border-primary-200">
                                A
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-900 tracking-widest">Admin</p>
                                <p className="text-[8px] font-bold uppercase text-emerald-500 tracking-widest">Online</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-3 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm active:scale-95 ${isCollapsed ? 'mx-auto' : ''}`}
                    >
                        {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                    </button>
                </div>
            </div>
        </aside>
    )
}
