'use client'

import React from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    React.useEffect(() => {
        if (!isLoading && (!user || user.role !== 'ADMIN')) {
            router.push('/dashboard')
        }
    }, [user, isLoading, router])

    if (isLoading || (user && user.role !== 'ADMIN')) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-inter selection:bg-primary-500/30 selection:text-primary-900">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(var(--primary-rgb),0.03),_transparent_45%)] pointer-events-none z-0"></div>

            {/* Global Admin Header */}
            <Navbar />

            <div className="flex">
                {/* Fixed Sidebar for Desktop */}
                <AdminSidebar />

                {/* Content Area */}
                <main className="flex-grow transition-all duration-500 ease-in-out md:pl-64">
                    <div className="min-h-[calc(100vh-64px)] relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
