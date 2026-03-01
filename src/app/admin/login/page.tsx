'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FiLock, FiArrowRight, FiShield, FiUser } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'

const loginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { login } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Identity verification failed')
            }

            if (result.user.role !== 'ADMIN') {
                throw new Error('Access denied. Administrator privileges required.')
            }

            toast.success('Admin access granted.')
            login(result.token, result.user)
            router.push('/admin/dashboard')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Login failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex overflow-hidden font-outfit">
            {/* Visual Side Panel */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative items-center justify-center p-20 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <div className="absolute top-0 -left-20 w-80 h-80 bg-red-600 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 -right-20 w-80 h-80 bg-blue-600 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 text-white max-w-lg">
                    <div className="mb-12">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                            <FiShield size={32} className="text-red-400" />
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter leading-[1.1]">Admin <br /><span className="text-red-400">Control.</span></h1>
                    </div>

                    <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12">
                        Oversee university operations, manage student records, and monitor financial transactions.
                    </p>

                    <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                        <div>
                            <p className="text-3xl font-black mb-1">Audit</p>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Full Oversight</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black mb-1">Verify</p>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Record Control</p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-10 left-10 text-[10px] font-black uppercase tracking-[0.5em] text-white/20">
                    Proprietary Administrator Access
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-[#f8fafc]">
                <div className="max-w-md w-full">
                    <div className="mb-12">
                        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Admin Login</h2>
                        <p className="text-gray-500 font-medium text-lg">System Administration Access.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Username</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors">
                                        <FiUser size={20} />
                                    </div>
                                    <input
                                        {...register('username')}
                                        type="text"
                                        className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        placeholder="Identification"
                                    />
                                </div>
                                {errors.username && <p className="text-xs font-black text-red-500 ml-1 uppercase tracking-tighter">{errors.username.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secret Key / Password</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors">
                                        <FiLock size={20} />
                                    </div>
                                    <input
                                        {...register('password')}
                                        type="password"
                                        className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <p className="text-xs font-black text-red-500 ml-1 uppercase tracking-tighter">{errors.password.message}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gray-950 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-2xl shadow-red-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Verify Admin Access
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                        <Link href="/" className="text-sm font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest underline decoration-2 underline-offset-4">
                            Back to Student Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
