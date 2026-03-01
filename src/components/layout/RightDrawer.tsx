'use client'

import React, { useEffect, useRef } from 'react'
import { FiX } from 'react-icons/fi'

interface RightDrawerProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export default function RightDrawer({ isOpen, onClose, title, children }: RightDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-gray-950/20 backdrop-blur-sm z-[80] transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[90] transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <div className="flex flex-col">
                            <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-950">
                                {title}
                            </h3>
                            <div className="w-8 h-1 bg-primary-600 rounded-full mt-2"></div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-gray-950 hover:bg-gray-50 transition-all active:scale-95"
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}
