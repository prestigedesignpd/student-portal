'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { FiArrowRight, FiUser, FiLock } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'

const loginSchema = z.object({
  username: z.string().min(3, 'Username required'),
  password: z.string().min(6, 'Password required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Home() {
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
        throw new Error(result.error || 'Access Denied')
      }

      toast.success('Authorized.')
      login(result.token, result.user)
      if (result.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-plus-jakarta">
      {/* Premium Dot Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}>
      </div>

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[380px] w-full relative z-10 animate-in fade-in zoom-in-95 duration-700">
        {/* Minimal Branding */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gray-200 rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(14,165,233,0.5)]"></div>
          </div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight leading-none mb-2">Student Login</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Welcome Back</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-gray-100 rounded-[32px] p-8 shadow-2xl shadow-gray-200/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Matric Number or Username</label>
              <div className="relative group">
                <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  {...register('username')}
                  type="text"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/5 focus:bg-white focus:border-primary-200 transition-all text-sm font-bold placeholder:text-gray-300"
                  placeholder="Username or Matric"
                />
              </div>
              {errors.username && <p className="text-[9px] font-black text-rose-500 ml-1 uppercase">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-500/5 focus:bg-white focus:border-primary-200 transition-all text-sm font-bold placeholder:text-gray-300"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-[9px] font-black text-rose-500 ml-1 uppercase">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-950 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Log In <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-6">
            <Link href="/help" className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-950 transition-colors">Get Help</Link>
            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
            <Link href="/forgot" className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-950 transition-colors">Forgot Password?</Link>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-gray-100"></span>
            Secure Access
            <span className="w-8 h-[1px] bg-gray-100"></span>
          </p>
        </div>
      </div>
    </div>
  )
}
