'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, PartyPopper, Copy, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ClaimSuccessModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    placeName?: string
}

export function ClaimSuccessModal({ isOpen, onClose, title, placeName }: ClaimSuccessModalProps) {
    const [confetti, setConfetti] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setConfetti(true)
            const timer = setTimeout(() => setConfetti(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-card border border-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative p-8 flex flex-col items-center text-center"
                    dir="rtl"
                >
                    {confetti && (
                        <div className="absolute inset-0 pointer-events-none">
                            <PartyPopper className="absolute top-10 left-10 text-yellow-500 animate-bounce" />
                            <PartyPopper className="absolute top-20 right-10 text-primary animate-bounce delay-100" />
                        </div>
                    )}

                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-6 border-4 border-green-500/20">
                        <CheckCircle2 size={40} />
                    </div>

                    <h3 className="text-2xl font-black text-foreground mb-2">تهانينا! لقد حصلت على العرض</h3>
                    <p className="text-muted-foreground mb-6 font-medium">
                        تم تسجيل طلبك بنجاح لـ "{title}" {placeName && `من ${placeName}`}.
                    </p>

                    <div className="w-full bg-primary/5 rounded-2xl p-4 border border-primary/10 mb-6 space-y-3">
                        <div className="flex items-center gap-3 text-primary">
                            <Timer size={18} />
                            <span className="text-sm font-bold">يرجى إبراز هذه الشاشة لصاحب المكان</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            هذا التأكيد يثبت أحقيتك في الحصول على السعر المعلن. العرض ساري لفترة محدودة أو حتى نفاذ الكمية المخصصة.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg text-lg"
                    >
                        حسناً، فهمت
                    </button>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
