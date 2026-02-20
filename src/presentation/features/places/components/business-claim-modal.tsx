'use client'

import { useState } from 'react'
import { X, ShieldCheck, Phone, User, Briefcase, FileText, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitBusinessClaimAction } from '@/actions/business.actions'
import { toast } from 'sonner'

interface BusinessClaimModalProps {
    isOpen: boolean
    onClose: () => void
    placeId: string
    placeName: string
}

export function BusinessClaimModal({ isOpen, onClose, placeId, placeName }: BusinessClaimModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        businessRole: 'owner',
        additionalNotes: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await submitBusinessClaimAction({
                placeId,
                fullName: formData.fullName,
                phone: formData.phone,
                businessRole: formData.businessRole,
                additionalNotes: formData.additionalNotes
            })

            if (res.success) {
                toast.success('تم إرسال طلب التوثيق بنجاح. سنقوم بمراجعته والتواصل معك.')
                onClose()
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'فشل إرسال الطلب')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
                dir="rtl"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">توثيق ملكية المكان</h3>
                            <p className="text-sm text-muted-foreground">{placeName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <User size={16} className="text-primary" />
                                الاسم بالكامل
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="أدخل اسمك كما هو في البطاقة"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Phone size={16} className="text-primary" />
                                رقم الهاتف للتواصل
                            </label>
                            <input
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="01xxxxxxxxx"
                            />
                        </div>

                        {/* Business Role */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Briefcase size={16} className="text-primary" />
                                صفتك في المكان
                            </label>
                            <select
                                value={formData.businessRole}
                                onChange={(e) => setFormData({ ...formData, businessRole: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                <option value="owner">المالك</option>
                                <option value="manager">المدير</option>
                                <option value="marketing">مسؤول التسويق</option>
                                <option value="employee">موظف مفوض</option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <FileText size={16} className="text-primary" />
                                ملاحظات إضافية (اختياري)
                            </label>
                            <textarea
                                value={formData.additionalNotes}
                                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                                rows={3}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                placeholder="أي معلومات تساعدنا في التأكد من هويتك..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={20} />
                                    إرسال طلب التوثيق
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-center text-muted-foreground px-4">
                            بتقديمك لهذا الطلب، أنت تقر بصحة البيانات المقدمة. سيتم مراجعة الطلب خلال 24-48 ساعة عمل.
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
