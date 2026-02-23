'use client'

import { useState } from 'react'
import { X, Newspaper, FileText, Image as ImageIcon, Tag, Hash, Loader2, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createArticleAction } from '@/actions/admin-news.actions'
import SupabaseImageUpload from '@/presentation/components/ui/supabase-image-upload'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AddNewsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function AddNewsModal({ isOpen, onClose }: AddNewsModalProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'News',
        cover_image_url: '',
        display_order: 1,
        is_published: true
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await createArticleAction(formData)

            if (res.success) {
                toast.success('تم إضافة المقال بنجاح')
                router.refresh()
                onClose()
                // Reset form
                setFormData({
                    title: '',
                    excerpt: '',
                    content: '',
                    category: 'News',
                    cover_image_url: '',
                    display_order: 1,
                    is_published: true
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
                            <Newspaper size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">إضافة مقال جديد</h3>
                            <p className="text-sm text-muted-foreground">قم بإدخال تفاصيل الخبر أو المقال للنشر على الموقع</p>
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
                                عنوان المقال
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="أدخل عنواناً جذاباً..."
                            />
                        </div>

                        {/* Excerpt */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Tag size={16} className="text-primary" />
                                نبذة مختصرة
                            </label>
                            <textarea
                                required
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                rows={2}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                placeholder="وصف قصير يظهر في قائمة الأخبار..."
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Hash size={16} className="text-primary" />
                                التصنيف
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                <option value="News">أخبار</option>
                                <option value="Story">قصص وحكايات</option>
                                <option value="Article">مقالات</option>
                                <option value="Announcement">إعلانات رسمية</option>
                            </select>
                        </div>

                        {/* Display Order */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <Hash size={16} className="text-primary" />
                                الترتيب
                            </label>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <ImageIcon size={16} className="text-primary" />
                                صورة الغلاف
                            </label>
                            <div className="bg-muted/20 p-4 rounded-2xl border border-dashed border-border transition-colors hover:border-primary/50">
                                <SupabaseImageUpload
                                    value={formData.cover_image_url}
                                    onChange={(url: string | string[]) => setFormData({ ...formData, cover_image_url: url as string })}
                                    maxFiles={1}
                                    bucketName="news"
                                    autoUpload={true}
                                />
                                <p className="text-[10px] text-muted-foreground mt-2 text-center font-bold">يفضل استخدام صور عالية الجودة بنسبة 16:9</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold flex items-center gap-2">
                                <FileText size={16} className="text-primary" />
                                محتوى المقال
                            </label>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={8}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="اكتب محتوى المقال هنا..."
                            />
                        </div>

                        {/* Publish Toggle */}
                        <div className="flex items-center gap-3 py-2 md:col-span-2">
                            <input
                                type="checkbox"
                                id="is_published"
                                checked={formData.is_published}
                                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                            />
                            <label htmlFor="is_published" className="text-sm font-bold cursor-pointer select-none">
                                نشر المقال فوراً
                            </label>
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
                                    حفظ ونشر المقال
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
