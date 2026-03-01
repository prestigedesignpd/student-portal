'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FiGrid,
    FiBookOpen,
    FiDollarSign,
    FiUser,
    FiShield,
    FiActivity,
    FiBook,
    FiAward,
    FiHome,
    FiCalendar,
    FiBriefcase
} from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'

export default function MobileNav() {
    const pathname = usePathname()
    const { user } = useAuth()
    const isActive = (path: string) => pathname === path

    const studentNavigation = [
        { name: 'Home', href: '/dashboard', icon: FiGrid },
        { name: 'Courses', href: '/courses', icon: FiBookOpen },
        { name: 'Billing', href: '/payments', icon: FiDollarSign },
        { name: 'Profile', href: '/profile', icon: FiUser },
    ]

    const adminNavigation = [
        { name: 'Dash', href: '/admin/dashboard', icon: FiShield },
        { name: 'Students', href: '/admin/students', icon: FiActivity },
        { name: 'Courses', href: '/admin/courses', icon: FiBook },
        { name: 'Settings', href: '/admin/settings', icon: FiBriefcase },
    ]

    const navigation = user?.role === 'ADMIN' ? adminNavigation : studentNavigation
    const isAdminRoute = pathname?.startsWith('/admin')

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-[400px]">
            <nav className={`relative px-2 py-2 rounded-[24px] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl ${isAdminRoute ? 'bg-gray-950/80' : 'bg-gray-950/90'
                }`}>
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none"></div>

                <div className="flex justify-around items-center h-12 relative z-10">
                    {navigation.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center py-1 w-full outline-none transition-transform active:scale-90"
                            >
                                <AnimatePresence>
                                    {active && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className={`absolute inset-0 rounded-2xl ${isAdminRoute ? 'bg-rose-500/20' : 'bg-primary-500/10'
                                                }`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </AnimatePresence>

                                <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${active
                                        ? (isAdminRoute ? 'text-rose-400' : 'text-primary-400')
                                        : 'text-gray-500'
                                    }`}>
                                    <item.icon size={20} className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">{item.name}</span>
                                </div>

                                {active && (
                                    <motion.div
                                        layoutId="activeDot"
                                        className={`absolute -bottom-1 w-1 h-1 rounded-full ${isAdminRoute ? 'bg-rose-500' : 'bg-primary-500'
                                            }`}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
