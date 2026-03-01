'use client'

import { useState, useEffect } from 'react'
import { FiCreditCard, FiClock, FiDownload, FiCheckCircle, FiAlertCircle, FiShield, FiDollarSign, FiFileText, FiRefreshCw, FiArrowRight, FiBook, FiX, FiPrinter } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

interface FeeStructure {
    id: string;
    title: string;
    amount: number;
    description: string;
    isRecommended: boolean;
}

interface PaymentRecord {
    _id: string;
    reference: string;
    feeType: string;
    amount: number;
    status: string;
    createdAt: string;
    transactionId: string;
    paymentMethod: string;
}

export default function PaymentsPage() {
    const [activeTab, setActiveTab] = useState<'PAY' | 'HISTORY'>('PAY')
    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
    const [history, setHistory] = useState<PaymentRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null)
    const [showReceiptModal, setShowReceiptModal] = useState(false)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [feesRes, historyRes, profileRes] = await Promise.all([
                axios.get('/api/fees/structure'),
                axios.get('/api/fees/history'),
                axios.get('/api/profile')
            ])
            setFeeStructures(feesRes.data)
            setHistory(historyRes.data)
            setProfile(profileRes.data)
        } catch (error) {
            console.error('Fetch fees error:', error)
            toast.error('Failed to sync financial records')
        } finally {
            setLoading(false)
        }
    }

    const handleCheckout = async (fee: FeeStructure) => {
        setProcessingId(fee.id)

        // Simulate a payment gateway delay
        setTimeout(async () => {
            try {
                await axios.post('/api/payments/checkout', {
                    feeType: fee.id,
                    amount: fee.amount,
                    paymentMethod: 'CARD_GATEWAY' // Simulated
                })

                toast.success(`${fee.title} payment successful!`)

                // Refresh history and switch tab
                fetchData()
                setActiveTab('HISTORY')
            } catch (error) {
                toast.error(`Transaction failed for ${fee.title}`)
            } finally {
                setProcessingId(null)
            }
        }, 1500)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString))
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'FAILED': return 'bg-rose-50 text-rose-600 border-rose-100'
            case 'REFUNDED': return 'bg-gray-100 text-gray-500 border-gray-200'
            default: return 'bg-gray-50 text-gray-400 border-gray-100'
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
        <div className="relative overflow-hidden bg-[#fbfcfd] min-h-screen">
            <main className="max-w-6xl mx-auto px-3 sm:px-5 py-3 pb-20">
                <div className="flex flex-row items-center justify-between gap-3 mb-8">
                    <div>
                        <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em] mb-0.5 font-mono">Bursary // Finance</p>
                        <h1 className="text-2xl font-black text-gray-950 tracking-tighter leading-none uppercase">Fee <span className="text-primary-600">Portal.</span></h1>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">
                            Manage tuition &amp; track university transactions.
                        </p>
                    </div>

                    <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-100 flex-shrink-0">
                        <button
                            onClick={() => setActiveTab('PAY')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all ${activeTab === 'PAY' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Pay
                        </button>
                        <button
                            onClick={() => setActiveTab('HISTORY')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] transition-all ${activeTab === 'HISTORY' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            History
                        </button>
                    </div>
                </div>

                {activeTab === 'PAY' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                        {/* Summary / Protection Banner */}
                        <div className="bg-gray-950 rounded-2xl p-3 text-white flex flex-row items-center justify-between gap-3 relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600/20 blur-[80px] rounded-full pointer-events-none"></div>
                            <div className="relative z-10 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-primary-400 border border-white/10 flex-shrink-0">
                                    <FiShield size={16} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black tracking-tight uppercase">Secure Gateway</h3>
                                    <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Encrypted via Paystack.</p>
                                </div>
                            </div>
                            <div className="relative z-10 text-right flex-shrink-0">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Paid</p>
                                <p className="text-base font-black">{formatCurrency(history.filter(h => h.status === 'SUCCESS').reduce((acc, curr) => acc + curr.amount, 0)).replace('NGN', '₦')}</p>
                            </div>
                        </div>

                        {/* Fee Catalog Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {feeStructures.map(fee => {
                                const isProcessing = processingId === fee.id
                                return (
                                    <div key={fee.id} className={`group bg-white rounded-xl border p-3 transition-all duration-300 hover:shadow-md relative overflow-hidden ${fee.isRecommended ? 'border-primary-600 ring-2 ring-primary-500/10' : 'border-gray-100 hover:border-primary-100'
                                        }`}>
                                        {fee.isRecommended && (
                                            <div className="absolute top-0 right-0 bg-primary-600 text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-bl-lg">
                                                Top Pick
                                            </div>
                                        )}
                                        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100 group-hover:text-primary-600 transition-all">
                                            {fee.id === 'TUITION' ? <FiBook size={16} /> :
                                                fee.id === 'ACCOMMODATION' ? <FiShield size={16} /> :
                                                    fee.id === 'TRANSCRIPT' ? <FiFileText size={16} /> :
                                                        <FiCreditCard size={16} />}
                                        </div>

                                        <div className="mb-3">
                                            <h4 className="text-[10px] font-black text-gray-950 uppercase tracking-tight mb-1 leading-tight">{fee.title}</h4>
                                            <p className="text-[9px] font-medium text-gray-400 leading-relaxed line-clamp-2">{fee.description}</p>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            <div>
                                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">Rate</p>
                                                <p className="text-sm font-black text-gray-950 tracking-tighter">{formatCurrency(fee.amount).replace('NGN', '₦')}</p>
                                            </div>
                                            <button
                                                onClick={() => handleCheckout(fee)}
                                                disabled={isProcessing}
                                                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${isProcessing ? 'bg-gray-100 text-gray-400' :
                                                    fee.isRecommended ? 'bg-primary-600 text-white shadow-md active:scale-95' :
                                                        'bg-gray-950 text-white shadow-sm active:scale-95 hover:bg-black'
                                                    }`}
                                            >
                                                {isProcessing ? <FiRefreshCw size={13} className="animate-spin" /> : <FiArrowRight size={13} />}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'HISTORY' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {history.length === 0 ? (
                            <div className="py-14 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-gray-100">
                                    <FiClock size={18} className="text-gray-300" />
                                </div>
                                <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest">No Transactions Found</h3>
                                <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-[0.15em] font-bold">Ledger is empty.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                <div className="px-3 py-2.5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                    <h2 className="text-[10px] font-black text-gray-950 uppercase tracking-[0.15em]">Transaction Ledger</h2>
                                    <button className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                                        <FiDownload size={11} /> Export
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="px-2.5 py-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-100">Ref / Date</th>
                                                <th className="px-2.5 py-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-100">Type</th>
                                                <th className="px-2.5 py-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-100">Amount</th>
                                                <th className="px-2.5 py-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-100">Status</th>
                                                <th className="px-2.5 py-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-100 text-right">Rcpt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {history.map((record) => (
                                                <tr key={record._id} className="hover:bg-gray-50/30 transition-colors">
                                                    <td className="px-2.5 py-2">
                                                        <p className="font-black text-gray-950 text-[9px] tracking-tight truncate max-w-[80px]">{record.reference}</p>
                                                        <p className="text-[8px] font-bold text-gray-400 mt-0.5 uppercase">{formatDate(record.createdAt)}</p>
                                                    </td>
                                                    <td className="px-2.5 py-2">
                                                        <span className="text-[9px] font-black text-gray-600 uppercase">{record.feeType}</span>
                                                    </td>
                                                    <td className="px-2.5 py-2">
                                                        <p className="font-black text-gray-950 text-[10px] tracking-tighter whitespace-nowrap">{formatCurrency(record.amount).replace('NGN', '₦')}</p>
                                                    </td>
                                                    <td className="px-2.5 py-2">
                                                        <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wide border ${getStatusStyle(record.status)}`}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-2.5 py-2 text-right">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    setLoading(true)
                                                                    const response = await axios.get(`/api/payments/receipt/${record._id}`)
                                                                    setSelectedPayment(response.data)
                                                                    setShowReceiptModal(true)
                                                                    toast.success('Official receipt generated')
                                                                } catch (error) {
                                                                    toast.error('Failed to retrieve receipt')
                                                                } finally {
                                                                    setLoading(false)
                                                                }
                                                            }}
                                                            disabled={record.status !== 'SUCCESS'}
                                                            className={`p-1.5 rounded-lg transition-all ${record.status === 'SUCCESS' ? 'bg-gray-50 border border-gray-100 text-gray-400 hover:text-primary-600 active:scale-95' : 'opacity-30 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            <FiDownload size={12} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Official Receipt Modal */}
            {showReceiptModal && selectedPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" onClick={() => setShowReceiptModal(false)}></div>
                    <div id="receipt-modal-content" className="relative w-full max-w-2xl animate-in zoom-in-95 duration-300 flex flex-col gap-6">

                        {/* Printable Receipt Area */}
                        <div id="receipt-doc" className="bg-white p-12 shadow-2xl rounded-sm text-gray-950 border border-gray-100 flex flex-col font-sans">
                            {/* Watermark Logo */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
                                <FiShield size={400} className="rotate-12" />
                            </div>

                            <div className="relative z-10">
                                {/* Letterhead */}
                                <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">Nexus University</h2>
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 italic">Bursary Department // Automated Receipting</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-gray-950 text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest mb-2 inline-block">Official Receipt</div>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest tracking-[0.2em]">{selectedPayment.reference}</p>
                                    </div>
                                </div>

                                {/* Transaction Header */}
                                <div className="grid grid-cols-2 gap-8 mb-10 bg-gray-50 p-6 rounded-xl">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Date Issued</p>
                                        <p className="text-xs font-black uppercase">{formatDate(selectedPayment.createdAt)}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Payment Method</p>
                                        <p className="text-xs font-black uppercase">{selectedPayment.paymentMethod.replace('_', ' ')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Student Name</p>
                                        <p className="text-xs font-black uppercase">{(selectedPayment as any).studentId?.userId?.firstName} {(selectedPayment as any).studentId?.userId?.lastName}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Matric Number</p>
                                        <p className="text-xs font-black uppercase">{(selectedPayment as any).studentId?.matricNumber}</p>
                                    </div>
                                </div>

                                {/* Billing Table */}
                                <table className="w-full border-collapse mb-10">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="py-3 text-left text-[9px] font-black uppercase tracking-widest text-gray-500">Description</th>
                                            <th className="py-3 text-right text-[9px] font-black uppercase tracking-widest text-gray-500">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="py-6 min-w-[200px]">
                                                <p className="text-sm font-black uppercase tracking-tight mb-1">{selectedPayment.feeType} FEE PAYMENT</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Academic Session: 2023/2024</p>
                                            </td>
                                            <td className="py-6 text-right">
                                                <p className="text-lg font-black tracking-tighter">{formatCurrency(selectedPayment.amount)}</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-gray-900 bg-gray-50">
                                            <td className="py-4 px-4 text-[10px] font-black uppercase tracking-widest">Total Amount Paid</td>
                                            <td className="py-4 px-4 text-right">
                                                <p className="text-xl font-black tracking-tighter text-primary-600">{formatCurrency(selectedPayment.amount)}</p>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>

                                {/* Footer & Verification */}
                                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-end">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-950 rounded flex items-center justify-center text-white">
                                            <FiShield size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest mb-1">Authenticated By</p>
                                            <p className="text-[10px] font-black uppercase tracking-tight">Nexus Bursary System</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="mb-2 opacity-20">
                                            <FiCheckCircle size={40} className="float-right" />
                                        </div>
                                        <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.2em] clear-both pt-2">Digital Signature // 3B9X-72KV-LP91</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center gap-4 pb-4 print:hidden">
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="px-8 py-3 bg-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/20 transition-all backdrop-blur-md border border-white/20"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    const originalTitle = document.title;
                                    document.title = `Receipt-${selectedPayment.reference}`;
                                    window.print();
                                    document.title = originalTitle;
                                }}
                                className="px-10 py-4 bg-primary-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-700 transition-all shadow-xl flex items-center gap-3 active:scale-95 group"
                            >
                                <FiPrinter size={14} className="group-hover:rotate-12 transition-transform" />
                                Download PDF Receipt
                            </button>
                        </div>
                    </div>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            /* Hide everything by default */
                            body * { visibility: hidden !important; }
                            
                            /* Show only the receipt content */
                            #receipt-modal-content, #receipt-modal-content * { 
                                visibility: visible !important; 
                            }
                            
                            #receipt-modal-content {
                                position: absolute !important;
                                left: 0 !important;
                                top: 0 !important;
                                width: 100% !important;
                                height: auto !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                background: white !important;
                                box-shadow: none !important;
                                transform: none !important;
                            }

                            #receipt-doc {
                                border: none !important;
                                box-shadow: none !important;
                                width: 100% !important;
                                max-width: none !important;
                                margin: 0 !important;
                                padding: 0.5in !important;
                            }

                            /* Force background colors and images */
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }

                            .print\\:hidden { display: none !important; }
                            @page { size: auto; margin: 0.5in; }
                        }
                    ` }} />
                </div>
            )}
        </div>
    )
}