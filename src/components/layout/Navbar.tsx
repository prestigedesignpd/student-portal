'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    FiBell,
    FiUser,
    FiLogOut,
    FiGrid,
    FiShield,
    FiBookOpen,
    FiBook,
    FiHome,
    FiAward,
    FiDollarSign,
    FiActivity,
    FiMessageSquare,
    FiMenu,
    FiX,
    FiSidebar
} from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'

interface NavbarProps {
    isMobileMenuOpen?: boolean
    onMobileMenuToggle?: () => void
    isSidebarCollapsed?: boolean
    onSidebarCollapseToggle?: () => void
    onNotificationToggle?: () => void
    onMessagesToggle?: () => void
    hasUnreadNotifications?: boolean
    hasUnreadMessages?: boolean
}

export default function Navbar({
    isMobileMenuOpen,
    onMobileMenuToggle,
    isSidebarCollapsed,
    onSidebarCollapseToggle,
    onNotificationToggle,
    onMessagesToggle,
    hasUnreadNotifications,
    hasUnreadMessages
}: NavbarProps) {
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()
    const { user, logout } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const studentNavigation = [
        { name: 'Home', href: '/dashboard', icon: FiGrid },
        { name: 'Courses', href: '/courses', icon: FiBookOpen },
        { name: 'Billing', href: '/payments', icon: FiDollarSign },
        { name: 'Account', href: '/profile', icon: FiUser },
    ]

    const adminNavigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: FiShield },
        { name: 'Students', href: '/admin/students', icon: FiActivity },
        { name: 'Courses', href: '/admin/courses', icon: FiBook },
        { name: 'Grades', href: '/admin/grades', icon: FiAward },
        { name: 'Fees', href: '/admin/fees', icon: FiDollarSign },
        { name: 'Housing', href: '/admin/hostels', icon: FiHome },
    ]

    const navigation = user?.role === 'ADMIN' ? adminNavigation : studentNavigation
    const isActive = (path: string) => pathname === path
    const isAdminRoute = pathname?.startsWith('/admin')

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-500 ${isAdminRoute
                ? 'bg-[#0a0a0b]/80 backdrop-blur-3xl border-b border-white/5 py-3'
                : 'bg-white border-b border-gray-100 py-2'}`}>
                <div className="px-3 sm:px-6 flex justify-between items-center h-10">
                    <div className="flex items-center gap-2 md:gap-6">
                        {/* Mobile Menu Toggle (Student Portal only) */}
                        {!isAdminRoute && (
                            <button
                                onClick={onMobileMenuToggle}
                                className="p-2 -ml-1 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 hover:text-gray-950 md:hidden active:scale-95 transition-all"
                            >
                                {isMobileMenuOpen ? <FiX size={16} /> : <FiMenu size={16} />}
                            </button>
                        )}
                        {/* Desktop Sidebar Toggle */}
                        {!isAdminRoute && (
                            <button
                                onClick={onSidebarCollapseToggle}
                                className="hidden md:flex p-2.5 -ml-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 hover:text-gray-950 active:scale-95 transition-all"
                            >
                                <FiSidebar size={18} className={isSidebarCollapsed ? '' : 'text-primary-600'} />
                            </button>
                        )}

                        {/* Brand / Logo */}
                        <Link href="/dashboard" className="flex items-center gap-2 active:scale-95 transition-transform group">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${isAdminRoute
                                ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] group-hover:bg-rose-600'
                                : 'bg-gray-900 shadow-sm shadow-gray-200'}`}>
                                <FiShield size={16} className="text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[11px] font-black uppercase tracking-tighter transition-colors duration-500 ${isAdminRoute ? 'text-white' : 'text-gray-950'}`}>
                                    Portal<span className={isAdminRoute ? 'text-rose-500' : 'text-primary-600'}>IQ</span>
                                </span>
                                <span className={`text-[7px] font-black uppercase tracking-[0.2em] -mt-0.5 ${isAdminRoute ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {isAdminRoute ? 'Management Suite' : 'University Hub'}
                                </span>
                            </div>
                        </Link>

                        {isAdminRoute && (
                            <>
                                <div className="hidden md:block w-px h-6 bg-white/10 mx-2"></div>
                                <div className="hidden md:flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Live Sync</span>
                                    </div>
                                    <Link href="/admin/dashboard" className="text-[9px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group/link">
                                        Admin Dashboard
                                        <FiActivity size={10} className="group-hover/link:text-rose-500 transition-colors" />
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 md:gap-4">
                        <div className="hidden md:flex items-center gap-1 mr-2">
                            <button
                                onClick={onNotificationToggle}
                                className={`p-2.5 rounded-xl transition-all relative group ${isAdminRoute ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-950 hover:bg-gray-50'}`}
                            >
                                <FiBell size={18} />
                                {hasUnreadNotifications && !isAdminRoute && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>
                                )}
                            </button>
                            <button
                                onClick={onMessagesToggle}
                                className={`p-2.5 rounded-xl transition-all relative group ${isAdminRoute ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-950 hover:bg-gray-50'}`}
                            >
                                <FiMessageSquare size={18} />
                                {hasUnreadMessages && !isAdminRoute && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary-600 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </button>
                        </div>
                        <div className={`w-[1px] h-4 hidden md:block ${isAdminRoute ? 'bg-white/10' : 'bg-gray-100'}`}></div>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="hidden lg:flex flex-col items-end">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isAdminRoute ? 'text-white' : 'text-gray-950'}`}>
                                    {user?.firstName}
                                </span>
                                <span className={`text-[7px] font-bold uppercase tracking-widest ${isAdminRoute ? 'text-rose-500' : 'text-gray-500'}`}>
                                    {user?.role === 'ADMIN' ? 'Head Office' : user?.role}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border transition-all flex items-center justify-center ${isAdminRoute
                                    ? 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white'
                                    : 'bg-gray-50 border-gray-100 hover:border-primary-500 text-gray-400 hover:text-primary-600'}`}
                            >
                                <FiLogOut size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className={`md:hidden fixed bottom-3 left-3 right-3 z-50 rounded-2xl border transition-all duration-500 ${isAdminRoute
                ? 'bg-gray-950/90 backdrop-blur-2xl border-white/5 shadow-2xl shadow-black'
                : 'bg-white/90 backdrop-blur-2xl border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)]'
                } px-4 py-3`}>
                <div className="flex justify-between items-center max-w-md mx-auto">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1.5 transition-all ${isActive(item.href)
                                ? (isAdminRoute ? 'text-white' : 'text-primary-600') + ' scale-110'
                                : 'text-gray-500'
                                }`}
                        >
                            <item.icon size={18} strokeWidth={isActive(item.href) ? 3 : 2} />
                        </Link>
                    ))}
                </div>
            </div>

            <div className="h-12 md:h-16"></div>
        </>
    )
}
