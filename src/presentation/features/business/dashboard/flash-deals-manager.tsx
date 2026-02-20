'use client'

import { useEffect, useState } from 'react'
import { getActiveFlashDealsAction, createFlashDealAction } from '@/actions/business.actions'
import { FlashDeal } from '@/domain/entities/flash-deal'
import { Zap, Plus, X, Loader2, Clock, Users, Trash2, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface FlashDealsManagerProps {
    placeId: string
}

export function FlashDealsManager({ placeId }: FlashDealsManagerProps) {
    const [deals, setDeals] = useState<FlashDeal[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const data = await getActiveFlashDealsAction(placeId)
                setDeals(data)
            } catch (error) {
                console.error('Error fetching deals:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDeals()
    }, [placeId])

    const handleCreateDeal = async (formData: any) => {
        try {
            const res = await createFlashDealAction({
                placeId,
                ...formData
            })
            if (res.success) {
                toast.success('تم إنشاء العرض اللحظي بنجاح!')
                setDeals([res.deal, ...deals])
                setIsCreateModalOpen(false)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'فشل إنشاء العرض')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Zap size={24} className="text-orange-500" />
                    العروض اللحظية النشطة
                </h3>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                >
                    <Plus size={18} />
                    إنشاء عرض جديد
                </button>
            </div>

            {deals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deals.map((deal) => (
                        <div key={deal.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-[100px] -z-10 transition-all group-hover:w-32 group-hover:h-32" />

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-lg text-foreground">{deal.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{deal.description}</p>
                                </div>
                                <div className="text-left">
                                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{deal.dealPrice} ج.م</div>
                                    {deal.originalPrice && (
                                        <div className="text-xs text-muted-foreground line-through">{deal.originalPrice} ج.م</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-muted/30 p-2 rounded-lg flex items-center gap-2">
                                    <Users size={14} className="text-primary" />
                                    <div className="text-[10px] text-muted-foreground">
                                        المطالبات: <span className="text-foreground font-bold">{deal.currentClaims} / {deal.maxClaims || '∞'}</span>
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-2 rounded-lg flex items-center gap-2">
                                    <Clock size={14} className="text-primary" />
                                    <div className="text-[10px] text-muted-foreground">
                                        ينتهي في: <span className="text-foreground font-bold">{new Date(deal.endDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-green-600">نشط الآن</span>
                                </div>
                                <button className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border">
                    <Zap size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-muted-foreground font-medium">لا توجد عروض نشطة حالياً</p>
                    <p className="text-xs text-muted-foreground mt-1">ابدأ بإنشاء عرضك الأول لجذب المزيد من الزبائن</p>
                </div>
            )}

            <CreateFlashDealModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateDeal}
            />
        </div>
    )
}

function CreateFlashDealModal({ isOpen, onClose, onSubmit }: any) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        originalPrice: '',
        dealPrice: '',
        duration: '2', // hours
        maxClaims: ''
    })

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setLoading(true)

        const startDate = new Date().toISOString()
        const endDate = new Date(Date.now() + parseInt(formData.duration) * 60 * 60 * 1000).toISOString()

        await onSubmit({
            title: formData.title,
            description: formData.description,
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
            dealPrice: parseFloat(formData.dealPrice),
            startDate,
            endDate,
            maxClaims: formData.maxClaims ? parseInt(formData.maxClaims) : undefined
        })

        setLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-border"
                dir="rtl"
            >
                <div className="p-6 border-b border-border bg-orange-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold">إنشاء عرض لحظي</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold">عنوان العرض</label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20"
                                placeholder="مثلاً: خصم 50% على الوجبة الكبيرة"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-muted-foreground line-through">السعر الأصلي</label>
                                <input
                                    type="number"
                                    value={formData.originalPrice}
                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20"
                                    placeholder="200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-orange-600">سعر العرض</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.dealPrice}
                                    onChange={(e) => setFormData({ ...formData, dealPrice: e.target.value })}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20"
                                    placeholder="100"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <Clock size={16} className="text-orange-500" />
                                    مدة العرض (ساعة)
                                </label>
                                <select
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 outline-none"
                                >
                                    <option value="1">ساعة واحدة</option>
                                    <option value="2">ساعتين</option>
                                    <option value="4">4 ساعات</option>
                                    <option value="6">6 ساعات</option>
                                    <option value="12">12 ساعة</option>
                                    <option value="24">يوم كامل</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <Users size={16} className="text-orange-500" />
                                    أقصى عدد (اختياري)
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxClaims}
                                    onChange={(e) => setFormData({ ...formData, maxClaims: e.target.value })}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20"
                                    placeholder="مثلاً: أول 10 أشخاص"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold">وصف العرض</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 outline-none resize-none"
                                placeholder="تفاصيل العرض أو شروط الاستخدام..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                        تفعيل العرض الآن
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
