'use client'

import React from 'react'
import StudentSidebar from '@/components/layout/StudentSidebar'
import Navbar from '@/components/layout/Navbar'
import RightDrawer from '@/components/layout/RightDrawer'
import { FiBell, FiMessageSquare, FiInfo, FiCheckCircle, FiClock } from 'react-icons/fi'

export default function StudentDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = React.useState(false)
    const [isMessagesOpen, setIsMessagesOpen] = React.useState(false)

    // Mock Notifications
    const notifications = [
        { id: 1, title: 'Course Registered', desc: 'CMS 101 has been added to your curriculum.', time: '2m ago', type: 'success', icon: FiCheckCircle },
        { id: 2, title: 'Exam Schedule', desc: 'Final time table for SAT 302 is out.', time: '1h ago', type: 'info', icon: FiInfo },
        { id: 3, title: 'Payment Due', desc: 'Hostel fee window closing in 48 hours.', time: '5h ago', type: 'warning', icon: FiClock },
    ]

    // Mock Messages
    const messagePreviews = [
        { id: 1, sender: 'Dr. Sarah Wilson', text: 'Please submit the lab report by Friday.', time: '10:30 AM', unread: true },
        { id: 2, sender: 'Student Affairs', text: 'Important update regarding hostel allocation.', time: 'Yesterday', unread: true },
        { id: 3, sender: 'Academic Office', text: 'Transcript request processed.', time: '2 days ago', unread: false },
    ]

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-950 font-sans selection:bg-primary-500/10 selection:text-primary-900">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Global Header */}
            <Navbar
                isMobileMenuOpen={isMobileMenuOpen}
                onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                isSidebarCollapsed={isSidebarCollapsed}
                onSidebarCollapseToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onNotificationToggle={() => setIsNotificationOpen(true)}
                onMessagesToggle={() => setIsMessagesOpen(true)}
                hasUnreadNotifications={true}
                hasUnreadMessages={true}
            />

            <div className="flex">
                {/* Fixed Sidebar for Desktop & Drawer for Mobile */}
                <StudentSidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                    isCollapsed={isSidebarCollapsed}
                    onCollapseToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />

                {/* Content Area */}
                <main className={`flex-grow transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'}`}>
                    <div className="min-h-[calc(100vh-64px)] relative z-10">
                        {children}
                    </div>
                </main>
            </div>

            {/* Notifications Drawer */}
            <RightDrawer
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                title="Notifications"
            >
                <div className="p-4 space-y-4">
                    {notifications.map((n) => (
                        <div key={n.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary-200 transition-all group">
                            <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                    n.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    <n.icon size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-950">{n.title}</h4>
                                    <p className="text-[9px] text-gray-500 mt-1 leading-relaxed">{n.desc}</p>
                                    <span className="text-[7px] font-bold text-gray-400 uppercase mt-2 tracking-widest">{n.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors">
                        Clear All Notifications
                    </button>
                </div>
            </RightDrawer>

            {/* Messages Drawer */}
            <RightDrawer
                isOpen={isMessagesOpen}
                onClose={() => setIsMessagesOpen(false)}
                title="Quick Messages"
            >
                <div className="p-4 space-y-2">
                    {messagePreviews.map((m) => (
                        <div key={m.id} className={`p-4 rounded-2xl border transition-all cursor-pointer hover:bg-gray-50 ${m.unread ? 'bg-primary-50/10 border-primary-100 hover:border-primary-200' : 'bg-white border-transparent hover:border-gray-100'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-950">{m.sender}</span>
                                <span className="text-[7px] font-bold text-gray-400 uppercase">{m.time}</span>
                            </div>
                            <p className="text-[9px] text-gray-500 line-clamp-1 truncate">{m.text}</p>
                            {m.unread && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"></div>
                                    <span className="text-[7px] font-bold text-primary-600 uppercase tracking-widest">New Priority</span>
                                </div>
                            )}
                        </div>
                    ))}
                    <button className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-950 transition-colors">
                        View All Messages
                    </button>
                </div>
            </RightDrawer>
        </div>
    )
}
