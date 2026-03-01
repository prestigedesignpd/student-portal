'use client'

import { useState, useEffect } from 'react'
import { FiHome, FiCheckCircle, FiInfo, FiArrowRight, FiShield, FiX, FiRefreshCw } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'

interface HostelData {
    _id: string;
    name: string;
    type: string;
    price: number;
    status: string;
    availableSlots: number;
    totalCapacity: number;
}

export default function StudentHostels() {
    const [hostels, setHostels] = useState<HostelData[]>([])
    const [loading, setLoading] = useState(true)
    const [bookingHostel, setBookingHostel] = useState<HostelData | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [bookedRoom, setBookedRoom] = useState<{ hostelName: string, roomNumber: string } | null>(null)

    useEffect(() => {
        fetchHostels()
    }, [])

    const fetchHostels = async () => {
        try {
            const response = await axios.get('/api/hostels')
            setHostels(response.data)
        } catch (error) {
            toast.error('Failed to synchronize residential data.')
        } finally {
            setLoading(false)
        }
    }

    const confirmBooking = async () => {
        if (!bookingHostel) return

        setIsProcessing(true)
        try {
            const response = await axios.post('/api/hostels/book', {
                hostelId: bookingHostel._id
            })
            setBookedRoom({
                hostelName: response.data.hostelName,
                roomNumber: response.data.roomNumber
            })
            toast.success(`Allocated Room ${response.data.roomNumber} in ${response.data.hostelName}`)
            fetchHostels() // Refresh capacity
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Allocation failed. Ensure no duplicate bookings exist.')
        } finally {
            setIsProcessing(false)
            setBookingHostel(null)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount).replace('NGN', '₦')
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
                <div className="flex flex-row items-center justify-between gap-3 mb-5">
                    <div>
                        <p className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em] mb-0.5 font-mono">Residency // Campus</p>
                        <h1 className="text-2xl font-black text-gray-950 tracking-tighter leading-none uppercase">Accommodation <span className="text-primary-600">Booking.</span></h1>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">
                            Real-time inventory. Strictly first-come, first-served.
                        </p>
                    </div>
                </div>

                {bookedRoom && (
                    <div className="mb-6 p-4 bg-gray-950 text-white rounded-2xl flex items-center justify-between shadow-lg overflow-hidden relative group animate-in slide-in-from-top-4 duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none"></div>
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                                <FiCheckCircle size={18} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black tracking-tight uppercase">Allocation Confirmed</h3>
                                <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mt-0.5">
                                    Room: <span className="text-white bg-white/10 px-1.5 py-0.5 rounded-md">{bookedRoom.roomNumber}</span> • {bookedRoom.hostelName}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 mb-6">
                    {hostels.map((hostel) => {
                        const isAvailable = hostel.availableSlots > 0
                        return (
                            <div key={hostel._id} className={`bg-white rounded-xl border p-3 flex flex-col group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${isAvailable ? 'border-gray-100 hover:border-primary-100' : 'border-gray-50 opacity-75'
                                }`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:scale-105 group-hover:text-primary-600 transition-all">
                                        <FiHome size={16} />
                                    </div>
                                    <span className={`px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-[0.1em] border ${!isAvailable
                                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                        {!isAvailable ? 'Full' : 'Available'}
                                    </span>
                                </div>

                                <div className="mb-3 flex-grow">
                                    <h3 className="text-sm font-black text-gray-950 tracking-tight leading-none mb-1">{hostel.name}</h3>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 truncate">{hostel.type} Residency</p>

                                    {/* Capacity progress bar */}
                                    <div className="w-full bg-gray-100 rounded-full h-1 mb-1.5 overflow-hidden">
                                        <div
                                            className={`h-1 rounded-full ${isAvailable ? 'bg-primary-500' : 'bg-rose-500'}`}
                                            style={{ width: `${((hostel.totalCapacity - hostel.availableSlots) / hostel.totalCapacity) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[7px] font-black uppercase tracking-wider">
                                        <span className="text-gray-400 truncate">{hostel.totalCapacity - hostel.availableSlots} Occupied</span>
                                        <span className={isAvailable ? 'text-primary-600' : 'text-rose-600'}>{hostel.availableSlots} Left</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-50 flex items-end justify-between mb-3">
                                    <div>
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">Rate</p>
                                        <p className="text-sm font-black text-gray-950 tracking-tighter">{formatCurrency(hostel.price)}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setBookingHostel(hostel)}
                                    disabled={!isAvailable}
                                    className={`w-full py-2.5 rounded-lg font-black uppercase tracking-[0.1em] text-[8px] transition-all flex items-center justify-center gap-1.5 group/btn active:scale-95 border ${!isAvailable
                                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                        : 'bg-gray-950 text-white hover:bg-black border-transparent shadow-sm'
                                        }`}
                                >
                                    {!isAvailable ? 'Waitlist Closed' : 'Secure Book Unit'}
                                    {isAvailable && <FiArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />}
                                </button>
                            </div>
                        )
                    })}
                </div>

                <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 bg-white rounded-lg text-indigo-600 border border-indigo-50 shadow-sm shrink-0">
                            <FiShield size={14} />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black text-indigo-950 mb-1 uppercase tracking-widest">Residency Policy Enforcement</h3>
                            <p className="text-indigo-900/60 text-[9px] font-medium leading-relaxed italic md:pr-8">
                                Allocations are processed on a first-applied basis. System automatically restricts requests when at capacity. Ensure tuition balance is cleared prior to residential application.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Booking Confirmation Modal */}
            {bookingHostel && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3">
                    <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={() => !isProcessing && setBookingHostel(null)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-4">
                        <div className="text-center mb-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-gray-100 text-gray-950">
                                <FiHome size={18} />
                            </div>
                            <h3 className="text-sm font-black text-gray-950 tracking-tight uppercase mb-1">Confirm Allocation</h3>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                Reserving unit in {bookingHostel.name}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-4 space-y-2">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                <span className="text-gray-400">Total Rate</span>
                                <span className="text-gray-950">{formatCurrency(bookingHostel.price)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                <span className="text-gray-400">Availability</span>
                                <span className="text-primary-600">{bookingHostel.availableSlots} Left</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                disabled={isProcessing}
                                onClick={() => setBookingHostel(null)}
                                className="flex-1 py-2.5 rounded-xl font-black uppercase tracking-[0.1em] text-[8px] bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isProcessing}
                                onClick={confirmBooking}
                                className="flex-1 py-2.5 rounded-xl font-black uppercase tracking-[0.1em] text-[8px] bg-primary-600 text-white hover:bg-primary-700 transition-all active:scale-95 shadow-md flex justify-center items-center gap-1.5"
                            >
                                {isProcessing ? <FiRefreshCw size={10} className="animate-spin" /> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
