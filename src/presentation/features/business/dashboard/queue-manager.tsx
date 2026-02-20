'use client'

import { useState } from 'react'
import { Users, UserPlus, Bell, Play, Pause, RotateCcw, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function QueueManager({ placeId }: { placeId: string }) {
    const [queue, setQueue] = useState([
        { id: '1', name: 'أحمد محمد', number: 105, time: '10:30 م', status: 'waiting' },
        { id: '2', name: 'سارة محمود', number: 106, time: '10:35 م', status: 'waiting' },
        { id: '3', name: 'ياسين علي', number: 107, time: '10:40 م', status: 'waiting' },
    ])

    const [currentNumber, setCurrentNumber] = useState(104)

    const handleCallNext = () => {
        if (queue.length === 0) return
        const next = queue[0]
        setCurrentNumber(next.number)
        setQueue(queue.slice(1))
        // In real app, trigger Supabase Realtime broadcast here
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Users size={24} className="text-blue-500" />
                    نظام حجز الدور المحترف
                </h3>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-bold text-green-600">البث المباشر نشط</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Main Controller */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-blue-600 text-white rounded-3xl p-8 shadow-xl shadow-blue-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />

                        <div className="relative z-10 text-center">
                            <p className="text-blue-100 font-medium mb-2">الرقم الحالي المنادى عليه</p>
                            <h2 className="text-8xl font-black mb-6">{currentNumber}</h2>

                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={handleCallNext}
                                    className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xl hover:scale-105 transition-transform flex items-center gap-3 shadow-lg"
                                >
                                    <Bell size={24} />
                                    نادِ الرقم التالي
                                </button>
                                <button className="bg-blue-500 text-white p-4 rounded-2xl hover:bg-blue-400 transition-colors">
                                    <RotateCcw size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                            <h4 className="font-bold">قائمة الانتظار ({queue.length})</h4>
                            <button className="text-xs font-bold text-primary flex items-center gap-1">
                                <UserPlus size={14} />
                                إضافة يدوي
                            </button>
                        </div>
                        <div className="divide-y divide-border">
                            <AnimatePresence mode="popLayout">
                                {queue.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                {item.number}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{item.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{item.time}</p>
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-blue-500/10 hover:text-blue-600 rounded-lg transition-colors">
                                            <ChevronRight size={20} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {queue.length === 0 && (
                                <div className="p-12 text-center text-muted-foreground">
                                    <p>لا يوجد أحد في قائمة الانتظار</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Side Settings */}
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                            <Play size={18} className="text-green-500" />
                            حالة النظام
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                                <span className="text-sm">استقبال الحجوزات</span>
                                <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                                <span className="text-sm">تنبيهات الرسائل القصيرة</span>
                                <div className="w-10 h-5 bg-muted rounded-full relative">
                                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-500 text-white rounded-3xl p-6 shadow-lg shadow-orange-500/20">
                        <h4 className="font-bold mb-2">شاشة الزبائن</h4>
                        <p className="text-xs text-orange-100 mb-4">انسخ الرابط التالي لفتح شاشة العرض للجمهور في مكانك.</p>
                        <button className="w-full bg-white/20 hover:bg-white/30 py-2 rounded-xl text-sm font-bold transition-colors">
                            نسخ رابط الشاشة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
