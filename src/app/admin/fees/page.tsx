'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiDollarSign, FiActivity, FiArrowUpRight, FiSearch, FiCheckCircle, FiClock, FiShield, FiTrendingUp, FiXCircle } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function FeeManagement() {
    const [payments, setPayments] = useState<any[]>([])
    const [fees, setFees] = useState<any[]>([])
    const [stats, setStats] = useState({ totalCollected: 0, pendingCount: 0, growth: '+0%' })
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isEditingFee, setIsEditingFee] = useState<any>(null)
    const [isReconciling, setIsReconciling] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [paymentsRes, statsRes, feesRes] = await Promise.all([
                axios.get('/api/admin/payments'),
                axios.get('/api/admin/payments/stats'),
                axios.get('/api/admin/fees')
            ])
            setPayments(paymentsRes.data)
            setStats(statsRes.data)
            setFees(feesRes.data)
        } catch (error) {
            toast.error('Payment data sync failed')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateFee = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsReconciling(true)
            await axios.post('/api/admin/fees', isEditingFee)
            toast.success('Fee structure updated')
            setIsEditingFee(null)
            fetchData()
        } catch (error) {
            toast.error('Update failed')
        } finally {
            setTimeout(() => setIsReconciling(false), 800)
        }
    }

    const handleVerify = async (paymentId: string) => {
        try {
            setIsReconciling(true)
            await axios.patch(`/api/admin/payments/${paymentId}`, { status: 'SUCCESS' })
            toast.success('Payment Verified')
            fetchData()
        } catch (error) {
            toast.error('Verification failed')
        } finally {
            setTimeout(() => setIsReconciling(false), 800)
        }
    }

    const filteredPayments = payments.filter(p =>
        p.studentId?.userId?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.studentId?.userId?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.studentId?.matricNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.reference?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(amount)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.2)]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fbfcfd] text-gray-900 font-outfit relative overflow-hidden">
            {/* System Background Scan Line */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent absolute animate-scan"></div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
                {/* Money Hub Authority Header */}
                <div className="bg-[#0a0a0b] rounded-[3rem] p-12 mb-12 shadow-2xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-2 h-2 rounded-full ${isReconciling ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'} shadow-[0_0_15px_#10b981]`}></div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
                                    {isReconciling ? 'Processing payments...' : 'Fee Management'}
                                </p>
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">Fee <span className="text-emerald-500 italic">Management</span></h1>
                            <p className="text-gray-500 text-[11px] font-bold mt-4 uppercase tracking-widest leading-relaxed max-w-sm">Manage student fees, payment structures, and transaction history.</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Revenue Collected</p>
                            <div className="text-3xl font-black text-white tabular-nums tracking-tighter">
                                {formatCurrency(stats.totalCollected).replace('.00', '')}
                                <span className="text-emerald-500/50 text-xl ml-2">↑</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fiscal KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 relative overflow-hidden group shadow-sm hover:shadow-2xl transition-all active:scale-[0.98]">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 blur-[60px] group-hover:bg-emerald-100/50 transition-all duration-700"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 relative z-10">Net Collections</p>
                        <div className="flex items-baseline gap-2 mb-6 relative z-10">
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(stats.totalCollected).replace('.00', '')}</p>
                        </div>
                        {/* Mini Sparkline Mockup */}
                        <div className="h-4 flex items-end gap-1 mb-6 relative z-10">
                            {[40, 70, 45, 90, 65, 80, 55, 100].map((h, i) => (
                                <div key={i} className="flex-1 bg-emerald-500/20 rounded-full group-hover:bg-emerald-500/40 transition-all" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 w-fit relative z-10 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <FiTrendingUp /> {stats.growth} Growth
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 group hover:border-amber-200 transition-all shadow-sm hover:shadow-2xl active:scale-[0.98] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-50 blur-[60px] group-hover:bg-amber-100/50 transition-all"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pending Verification</p>
                        <p className="text-5xl font-black text-gray-900 tracking-tighter mb-8">{stats.pendingCount}</p>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Awaiting Approval</span>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0b] rounded-[2.5rem] p-10 group transition-all shadow-2xl active:scale-[0.98] relative overflow-hidden border border-white/5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] pointer-events-none"></div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Scholarship Credits</p>
                        <p className="text-5xl font-black text-white tracking-tighter mb-8">86</p>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20 px-3 py-1.5 rounded-lg w-fit">Active Awards</p>
                    </div>
                </div>

                {/* Registry Config Section */}
                <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm mb-12">
                    <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg">
                                <FiShield size={18} />
                            </div>
                            <div>
                                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Fee Configurations</h2>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Management of active student fees</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {fees.map((fee) => (
                            <div key={fee._id} className="p-8 rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:border-emerald-200 transition-all group relative overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                                            <FiDollarSign />
                                        </div>
                                        <button
                                            onClick={() => setIsEditingFee(fee)}
                                            className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-emerald-600 border border-gray-100 shadow-sm transition-all active:scale-95"
                                        >
                                            <FiActivity size={14} />
                                        </button>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">{formatCurrency(fee.baseAmount)}</p>
                                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">{fee.title}</h3>
                                    <div className="pt-4 border-t border-gray-200/50">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed line-clamp-2">{fee.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Advanced Ledger */}
                <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-2xl shadow-gray-200/50">
                    <div className="p-10 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-gray-50/20">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-inner">
                                <FiClock size={20} />
                            </div>
                            <div>
                                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Payment History</h2>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Recently processed student payments</p>
                            </div>
                        </div>
                        <div className="relative group w-full lg:w-96">
                            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-all font-black" />
                            <input
                                type="text"
                                placeholder="Scan Reference or Name..."
                                className="w-full pl-14 pr-8 py-4.5 bg-white border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 outline-none transition-all text-xs font-black text-gray-900 placeholder:text-gray-300 uppercase tracking-widest shadow-sm"
                                value={searchQuery || ''}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Student</th>
                                    <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] hide-mobile md:table-cell">Fee Type</th>
                                    <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Amount</th>
                                    <th className="p-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50 px-4">
                                {filteredPayments.map((pmt) => (
                                    <tr key={pmt._id} className="hover:bg-emerald-50/20 transition-all group">
                                        <td className="p-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 group-hover:bg-white group-hover:scale-110 transition-all shadow-sm">
                                                    <FiShield size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">
                                                        {pmt.studentId?.userId?.firstName} {pmt.studentId?.userId?.lastName}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                        {pmt.studentId?.matricNumber || pmt.reference}
                                                        {pmt.status === 'SUCCESS' && <span className="w-1 h-1 rounded-full bg-emerald-500"></span>}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-10 hide-mobile md:table-cell">
                                            <div className="inline-flex flex-col">
                                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">{pmt.feeType}</span>
                                                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{new Date(pmt.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-10">
                                            <div className="flex flex-col">
                                                <p className="text-base font-black text-gray-900 tracking-tighter">{formatCurrency(pmt.amount)}</p>
                                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1">Paid</span>
                                            </div>
                                        </td>
                                        <td className="p-10 text-right">
                                            {pmt.status === 'SUCCESS' ? (
                                                <div className="inline-flex items-center px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500">
                                                    Verified
                                                </div>
                                            ) : pmt.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => handleVerify(pmt._id)}
                                                    className="inline-flex items-center px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    Approve
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-rose-50 text-rose-500 border border-rose-100">
                                                    Failed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Adjustment Interface */}
            {isEditingFee && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsEditingFee(null)}></div>
                    <div className="relative bg-white rounded-[3.5rem] w-full max-w-lg p-12 shadow-2xl border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-3 uppercase">Edit <span className="text-emerald-600 italic">Fee</span></h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] italic">Update payment structure and policy</p>
                            </div>
                            <button onClick={() => setIsEditingFee(null)} className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                <FiXCircle size={28} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateFee} className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Billable Target</label>
                                <div className="px-8 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-black text-gray-900 uppercase tracking-widest">
                                    {isEditingFee.title}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Base Amount (NGN)</label>
                                <input
                                    type="number"
                                    value={isEditingFee.baseAmount}
                                    onChange={(e) => setIsEditingFee({ ...isEditingFee, baseAmount: Number(e.target.value) })}
                                    className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-100 transition-all text-2xl outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Policy Description</label>
                                <textarea
                                    value={isEditingFee.description}
                                    onChange={(e) => setIsEditingFee({ ...isEditingFee, description: e.target.value })}
                                    className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-100 transition-all text-sm h-32 outline-none resize-none"
                                    required
                                />
                            </div>

                            <button type="submit" disabled={isReconciling} className="w-full py-6.5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-black transition-all shadow-2xl shadow-black/20 active:scale-95 disabled:opacity-50">
                                {isReconciling ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
