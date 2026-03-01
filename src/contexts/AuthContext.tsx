'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types/student'
import axios from 'axios'

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (token: string, user: User) => void
    updateUser: (newData: Partial<User>) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token')
            const storedUser = localStorage.getItem('user')

            if (token && storedUser) {
                try {
                    // Try to fetch fresh data from DB
                    const response = await axios.get('/api/profile')
                    const freshUser = response.data
                    setUser(freshUser)
                    localStorage.setItem('user', JSON.stringify(freshUser))
                } catch (error) {
                    // Fallback to stored user if API fails
                    setUser(JSON.parse(storedUser))
                }
            }
            setIsLoading(false)
        }

        initAuth()
    }, [])

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }

    const updateUser = (newData: Partial<User>) => {
        if (!user) return
        const updatedUser = { ...user, ...newData }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}