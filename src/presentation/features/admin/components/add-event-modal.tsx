'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, FileText, Image as ImageIcon, MapPin, Link as LinkIcon, Loader2, CheckCircle2, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createEventAction } from '@/actions/admin-news.actions'
import { getAdminPlacesAction } from '@/actions/admin-places.actions'
import SupabaseImageUpload from '@/presentation/components/ui/supabase-image-upload'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AddEventModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AddEventModal({ isOpen, onClose }: AddEventModalProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        image_url: '',
        start_date: '',
        end_date: '',
        location: '',
        type: 'general',
        place_id: '' as string | null,
        status: 'active'
    })

    const [places, setPlaces] = useState<any[]>([])

    useEffect(() => {
        if (isOpen) {
            getAdminPlacesAction({ status: 'active' }).then(res => {
                if (res.success) setPlaces(res.places || [])
            })
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Generate slug if empty
            const dataToSubmit = {
                ...formData,
                slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
            }

            const res = await createEventAction(dataToSubmit)

            if (res.success) {
                toast.success('تم إضافة الفعالية بنجاح')
                router.refresh()
                onClose()
                // Reset form
                setFormData({
                    title: '',
                    slug: '',
                    description: '',
                    image_url: '',
                    start_date: '',
                    end_date: '',
                    location: '',
                    type: 'general',
                    place_id: '',
                    status: 'active'
                })
            } else {
                toast.error(res.error || 'حدث خطأ أثناء الإضافة')
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع')
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
                className="bg-card border border-border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                dir="rtl"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">إضافة فعالية جديدة</h3>
                            <p className="text-sm text-muted-foreground">أضف تفاصيل الفعالية، موعدها ومكان إقامتها</p>
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
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <FileText size={16} className="text-primary" />
                                عنوان الفعالية
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="مثلاً: مهرجان السويس الصيفي..."
                            />
                        </div>

                        {/* Start Date */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Calendar size={16} className="text-primary" />
                                تاريخ البدء
                            </label>
                            <input
                                required
                                type="datetime-local"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Calendar size={16} className="text-primary" />
                                تاريخ الانتهاء
                            </label>
                            <input
                                required
                                type="datetime-local"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <MapPin size={16} className="text-primary" />
                                الموقع / المكان
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="مثلاً: بورتوفيق، ممشى النصر..."
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <ImageIcon size={16} className="text-primary" />
                                صورة الفعالية
                            </label>
                            <div className="bg-muted/20 p-4 rounded-2xl border border-dashed border-border transition-colors hover:border-primary/50">
                                <SupabaseImageUpload
                                    value={formData.image_url}
                                    onChange={(url: string | string[]) => setFormData({ ...formData, image_url: url as string })}
                                    maxFiles={1}
                                    bucketName="events"
                                    autoUpload={true}
                                />
                            </div>
                        </div>

                        {/* Slug */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <LinkIcon size={16} className="text-primary" />
                                الرابط (Slug)
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="suez-festival-2024"
                            />
                        </div>

                        {/* Type */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Tag size={16} className="text-primary" />
                                النوع
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                <option value="general">عامة</option>
                                <option value="place_hosted">مستضافة في مكان</option>
                            </select>
                        </div>

                        {/* Place Selection (Conditional) */}
                        {formData.type === 'place_hosted' && (
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <MapPin size={16} className="text-primary" />
                                    المكان المستضيف
                                </label>
                                <select
                                    required
                                    value={formData.place_id || ''}
                                    onChange={(e) => setFormData({ ...formData, place_id: e.target.value })}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="">اختر المكان...</option>
                                    {places.map(place => (
                                        <option key={place.id} value={place.id}>{place.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <FileText size={16} className="text-primary" />
                                وصف الفعالية
                            </label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="اكتب وصفاً مفصلاً للفعالية..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3 shrink-0">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    حفظ الفعالية نياشر
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
