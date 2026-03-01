'use client'

import { useState, useEffect } from 'react'
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiLock, FiBell, FiShield, FiSave, FiActivity, FiBriefcase, FiHash, FiCalendar } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

interface ProfileData {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    address?: string;
    studentDetails?: {
        matricNumber: string;
        department: string;
        level: number;
        admissionDate: string;
        currentCgpa: number;
    }
}

export default function ProfilePage() {
    const { updateUser } = useAuth()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({ phone: '', address: '' })
    const [saving, setSaving] = useState(false)
    const [showIdModal, setShowIdModal] = useState(false)

    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [changingPassword, setChangingPassword] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/api/profile')
            setProfile(response.data)
            setEditForm({
                phone: response.data.phone || '',
                address: response.data.address || ''
            })
        } catch (error) {
            toast.error('Failed to load profile data.')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (e.g., 2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64String = reader.result as string
            try {
                setSaving(true)
                await axios.put('/api/profile/update', { avatar: base64String })
                setProfile(prev => prev ? { ...prev, avatar: base64String } : null)
                updateUser({ avatar: base64String })
                toast.success('Profile picture updated')
            } catch (error) {
                toast.error('Failed to upload image')
            } finally {
                setSaving(false)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await axios.put('/api/profile/update', editForm)
            toast.success('Profile updated successfully.')
            // Update local state block
            setProfile(prev => prev ? { ...prev, phone: editForm.phone, address: editForm.address } : null)
            updateUser({ phone: editForm.phone, address: editForm.address })
            setIsEditing(false)
        } catch (error) {
            toast.error('Failed to update profile.')
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match')
            return
        }

        setChangingPassword(true)
        try {
            await axios.post('/api/profile/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            })
            toast.success('Password updated successfully')
            setShowPasswordModal(false)
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update password')
        } finally {
            setChangingPassword(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fbfcfd] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden bg-[#fbfcfd] min-h-screen pb-20">
            <main className="max-w-5xl mx-auto px-3 sm:px-5 py-4">
                {/* Header - Digital ID Core */}
                <div className="bg-gray-950 rounded-2xl p-4 mb-6 relative overflow-hidden shadow-lg text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[80px] rounded-full pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
                        <div className="relative group shrink-0">
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <div className="w-20 h-20 rounded-[1.25rem] bg-white flex items-center justify-center text-gray-950 font-black text-2xl shadow-md border-[3px] border-white/10 group-hover:scale-105 transition-all overflow-hidden">
                                {profile?.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Avatar load error');
                                            (e.target as any).src = ''; // Fallback to initials
                                        }}
                                    />
                                ) : (
                                    <>{profile?.firstName?.[0]}{profile?.lastName?.[0]}</>
                                )}
                            </div>
                            <button
                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                className="absolute -bottom-1 -right-1 p-2 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 active:scale-95 transition-all"
                            >
                                <FiCamera size={14} />
                            </button>
                        </div>

                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-2xl font-black text-white tracking-tighter leading-none mb-2">
                                {profile?.firstName} {profile?.lastName}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <p className="px-2.5 py-1 bg-white/10 rounded-md text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 border border-white/5">
                                    <FiHash className="text-primary-400" />
                                    {profile?.studentDetails?.matricNumber || 'N/A'}
                                </p>
                                <p className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-md text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 border border-emerald-500/30">
                                    <FiShield size={12} /> ID VERIFIED
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0 text-center flex flex-col mt-2 md:mt-0">
                            <button
                                onClick={() => setShowIdModal(true)}
                                className="px-4 py-2 bg-white text-gray-950 rounded-lg font-black uppercase tracking-[0.1em] text-[9px] hover:bg-gray-100 hover:scale-105 transition-all shadow-md flex items-center gap-1.5"
                            >
                                <FiActivity size={12} /> Generate Official ID
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] flex items-center gap-1.5">
                                    <FiUser size={12} /> Core Information
                                </h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-[8px] font-black text-primary-600 uppercase tracking-widest hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        Edit Details
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="text-[8px] font-black text-gray-500 uppercase tracking-widest hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all"
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="text-[8px] font-black text-white bg-gray-950 uppercase tracking-widest hover:bg-black px-4 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                                        >
                                            {saving ? 'Saving...' : <><FiSave size={10} /> Save</>}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 relative group">
                                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest ml-3 flex items-center gap-1.5">
                                        <FiMail size={10} /> Required Email Address
                                    </label>
                                    <input type="email" value={profile?.email} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 cursor-not-allowed" disabled />
                                    <span className="absolute right-3 top-7 text-[7px] font-black text-gray-300 uppercase tracking-widest">Fixed</span>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest ml-3 flex items-center gap-1.5">
                                        <FiPhone size={10} /> Contact Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={isEditing ? editForm.phone : profile?.phone || 'Not provided'}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isEditing ? 'bg-white border-2 border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-gray-950 shadow-sm' : 'bg-gray-50/50 border border-gray-100 text-gray-900 cursor-not-allowed'
                                            }`}
                                        disabled={!isEditing}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest ml-3 flex items-center gap-1.5">
                                        <FiMapPin size={10} /> Residential Address
                                    </label>
                                    <input
                                        type="text"
                                        value={isEditing ? editForm.address : profile?.address || 'Not provided'}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isEditing ? 'bg-white border-2 border-primary-500 focus:ring-2 focus:ring-primary-500/10 text-gray-950 shadow-sm' : 'bg-gray-50/50 border border-gray-100 text-gray-900 cursor-not-allowed'
                                            }`}
                                        disabled={!isEditing}
                                        placeholder="Enter home residence"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                            <h2 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] mb-4 flex items-center gap-1.5">
                                <FiShield size={12} /> Security & Preferences
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div onClick={() => setShowPasswordModal(true)} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all border border-gray-100 hover:border-gray-200 group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-gray-950 transition-colors shadow-sm">
                                            <FiLock size={14} />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-950 tracking-tight">Access Control</p>
                                    </div>
                                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary-600 transition-colors bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">Update</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all border border-gray-100 hover:border-gray-200 group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-gray-950 transition-colors shadow-sm">
                                            <FiBell size={14} />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-950 tracking-tight">Push Alerts</p>
                                    </div>
                                    <div className="w-8 h-5 bg-primary-600 rounded-full relative shadow-inner cursor-pointer">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Academic Standing */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 relative overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[60px] -z-10 border-b border-l border-gray-100"></div>

                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5 flex items-center gap-1.5">
                                <FiBriefcase size={12} /> Institutional Data
                            </h3>

                            <div className="space-y-4">
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                        <FiBriefcase size={12} />
                                    </div>
                                    <div>
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Primary Affiliation</p>
                                        <p className="text-xs font-black text-gray-950 tracking-tight leading-snug">{profile?.studentDetails?.department || 'Department Not Set'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                                        <FiActivity size={12} />
                                    </div>
                                    <div>
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Current Standing</p>
                                        <p className="text-xl font-black text-gray-950 tracking-tighter italic">{profile?.studentDetails?.level || '100'}<span className="text-sm">L</span></p>
                                    </div>
                                </div>

                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                        <FiCalendar size={12} />
                                    </div>
                                    <div>
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Matriculation</p>
                                        <p className="text-xs font-black text-gray-950 tracking-tight">
                                            {profile?.studentDetails?.admissionDate
                                                ? new Date(profile.studentDetails.admissionDate).getFullYear()
                                                : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support Block */}
                        <div className="bg-indigo-50/30 rounded-2xl border border-indigo-100 p-5 text-center shadow-sm">
                            <div className="w-10 h-10 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center font-black text-indigo-300 border border-indigo-50 shadow-sm">?</div>
                            <h3 className="text-[9px] font-black text-indigo-950 mb-1.5 uppercase tracking-[0.1em] leading-none">Records Support</h3>
                            <p className="text-[9px] text-indigo-900/60 font-medium leading-relaxed italic mb-4">Contest your academic standing or matriculation ID?</p>
                            <button
                                onClick={() => window.location.href = 'mailto:support@nexus.edu?subject=Records%20Support%20Ticket'}
                                className="w-full bg-white text-indigo-950 py-2.5 rounded-lg font-black uppercase tracking-widest text-[8px] hover:bg-indigo-950 hover:text-white transition-all border border-indigo-100 shadow-sm active:scale-95"
                            >
                                Open Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Official ID Card Modal */}
            {showIdModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
                    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" onClick={() => setShowIdModal(false)}></div>
                    <div className="relative w-full max-w-[24rem] animate-in zoom-in-95 duration-300">
                        {/* ID Card Front - Horizontal Layout */}
                        <div id="printable-id-card" className="bg-white rounded-2xl overflow-hidden shadow-2xl relative flex aspect-[1.58] w-full border border-gray-200">
                            {/* NEW: University Academic Background Design */}
                            <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-primary-50/30 to-white pointer-events-none"></div>

                            {/* NEW: Technical Grid Overlay (University Style) */}
                            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(to right, #2563eb 1px, transparent 1px),
                                        linear-gradient(to bottom, #2563eb 1px, transparent 1px)
                                    `,
                                    backgroundSize: '24px 24px'
                                }}></div>

                            {/* NEW: Micro-grid Texture Layer */}
                            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
                                style={{
                                    backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)',
                                    backgroundSize: '8px 8px'
                                }}></div>

                            {/* NEW: Branding Watermark Enhanced */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 rotate-[15deg]">
                                <span className="text-[140px] font-black text-primary-600 opacity-[0.04] leading-none tracking-tighter select-none uppercase">NEXUS</span>
                            </div>

                            {/* NEW: Security Corner Accent */}
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-600/10 rounded-full blur-2xl pointer-events-none"></div>

                            {/* Left Side: Photo & Brand */}
                            <div className="w-[35%] bg-gray-50/50 flex flex-col items-center justify-between py-4 px-2 border-r border-gray-100 relative z-10">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary-600/50"></div>
                                <h2 className="text-primary-600 font-black uppercase tracking-[0.2em] text-[8px] text-center leading-tight mb-2">Nexus<br />University</h2>

                                <div className="relative">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white p-1 shadow-md border border-gray-200 relative z-10 transition-transform group-hover:scale-105">
                                        {/* Profile Photo */}
                                        <div className="w-full h-full rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 font-black text-2xl overflow-hidden">
                                            {profile?.avatar ? (
                                                <img
                                                    src={profile.avatar}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => (e.target as any).style.display = 'none'}
                                                />
                                            ) : (
                                                <>{profile?.firstName?.[0]}{profile?.lastName?.[0]}</>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 w-4 h-4 rounded-full border-[3px] border-white shadow-sm z-20"></div>
                                    </div>

                                    {/* NEW: Holographic Security Seal */}
                                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-300 via-emerald-200 to-amber-200 mix-blend-overlay opacity-50 blur-sm pointer-events-none ring-1 ring-white/50"></div>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <p className="text-[6px] sm:text-[7px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100 shadow-sm">Verified Student</p>
                                    <p className="text-[5px] font-bold text-gray-400 italic">Est. 2024</p>
                                </div>
                            </div>

                            {/* Right Side: Details */}
                            <div className="w-[65%] p-4 relative z-10 flex flex-col justify-between bg-white/40 backdrop-blur-[1px] overflow-hidden">
                                {/* NEW: Right Side Branded Accent Bar */}
                                <div className="absolute top-0 right-0 w-1.5 h-full bg-primary-600/30"></div>

                                {/* Subtle Background texture */}
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
                                <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <h3 className="text-sm sm:text-base font-black text-gray-950 tracking-tight uppercase leading-tight mb-3">
                                        {profile?.firstName} <br /> {profile?.lastName}
                                    </h3>

                                    <div className="w-full space-y-2">
                                        <div>
                                            <span className="text-[6px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">ID N°</span>
                                            <span className="text-[9px] font-black text-gray-950 tracking-wide">{profile?.studentDetails?.matricNumber || 'PENDING'}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <span className="text-[6px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Faculty</span>
                                                <span className="text-[8px] font-black text-gray-950 tracking-wide line-clamp-2 leading-tight">{profile?.studentDetails?.department || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-[6px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Valid Thru</span>
                                                <span className="text-[9px] font-black text-gray-950 tracking-wide">
                                                    {profile?.studentDetails?.admissionDate ? new Date(profile.studentDetails.admissionDate).getFullYear() + 4 : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Simulated Barcode and Security Line */}
                                <div className="relative z-10 mt-auto pt-3 border-t border-primary-100/50">
                                    <div className="h-4 w-full bg-gray-950 flex opacity-90 rounded-sm overflow-hidden" style={{
                                        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 3px, transparent 3px, transparent 4px, white 4px, white 6px)',
                                        backgroundSize: '100% 100%'
                                    }}></div>
                                    {/* NEW: Enhanced Security Microtext */}
                                    <div className="text-[4px] font-black text-primary-600/40 uppercase tracking-[0.3em] mt-1.5 text-center whitespace-nowrap overflow-hidden italic shadow-sm">
                                        PROPERTY OF NEXUS UNIVERSITY • VALID ID REQUIRED ON CAMPUS • SECURE ACCESS SYSTEM • VERIFIED
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex gap-3 justify-center">
                            <button
                                onClick={() => setShowIdModal(false)}
                                className="px-4 py-2 bg-white/10 text-white rounded-lg font-black uppercase tracking-widest text-[8px] hover:bg-white/20 transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    window.print()
                                }}
                                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-black uppercase tracking-[0.1em] text-[8px] hover:bg-primary-700 hover:scale-105 transition-all shadow-md shadow-primary-900/20"
                            >
                                Print / Save PDF
                            </button>
                        </div>

                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @media print {
                                /* Hide everything except the printable card */
                                body * { visibility: hidden; }
                                #printable-id-card, #printable-id-card * { visibility: visible; }
                                
                                /* Position the card at the top-left for perfect sizing */
                                #printable-id-card {
                                    position: fixed;
                                    left: 0;
                                    top: 0;
                                    width: 3.375in !important;
                                    height: 2.125in !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    border: none !important;
                                    box-shadow: none !important;
                                    border-radius: 0 !important;
                                    background: white !important;
                                }

                                @page { 
                                    size: 3.375in 2.125in landscape; 
                                    margin: 0; 
                                }
                                
                                /* Ensure background colors and images are printed */
                                * {
                                    -webkit-print-color-adjust: exact !important;
                                    print-color-adjust: exact !important;
                                }
                            }
                        `}} />
                    </div>
                </div>
            )
            }

            {/* Change Password Modal */}
            {
                showPasswordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}></div>
                        <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight mb-1">Update Security</h2>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Change Access Password</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                                    <FiLock />
                                </div>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-bold text-gray-900"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-xl font-black uppercase tracking-widest text-[9px] transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={changingPassword} className="flex-1 py-3 bg-gray-950 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-black transition-all shadow-sm disabled:opacity-50">
                                        {changingPassword ? 'Updating...' : 'Save Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
