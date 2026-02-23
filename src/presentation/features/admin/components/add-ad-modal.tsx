'use client'

import { useEffect, useState } from 'react'
import { X, Megaphone, Target, CheckCircle2, Loader2, Search, Percent, Link as LinkIcon, Image as ImageIcon, LayoutGrid, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createAdminAdAction, updateAdminAdAction } from '@/actions/admin-ads.actions'
import { CreateFlashDealDTO, FlashDeal } from '@/domain/entities/flash-deal'
import SupabaseImageUpload from '@/presentation/components/ui/supabase-image-upload'
import { searchAdminPlacesAction, searchAdminItemsAction } from '@/actions/admin-search.actions'
import { SearchableDropdown } from '@/presentation/components/ui/SearchableDropdown'

interface AddAdModalProps {
    isOpen: boolean
    onClose: () => void
    adToEdit?: FlashDeal | null
}

export function AddAdModal({ isOpen, onClose, adToEdit }: AddAdModalProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [localFile, setLocalFile] = useState<File | null>(null)
    const [formData, setFormData] = useState<CreateFlashDealDTO>({
        title: '',
        description: '',
        type: 'place_deal',
        placement: 'home_top',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })

    // Update form data when adToEdit changes or modal opens
    useEffect(() => {
        if (adToEdit && isOpen) {
            setFormData({
                title: adToEdit.title,
                description: adToEdit.description || '',
                type: adToEdit.type,
                placement: adToEdit.placement,
                startDate: adToEdit.startDate,
                endDate: adToEdit.endDate,
                placeId: adToEdit.placeId,
                marketplaceItemId: adToEdit.marketplaceItemId,
                imageUrl: adToEdit.imageUrl,
                targetUrl: adToEdit.targetUrl,
                adCode: adToEdit.adCode,
                originalPrice: adToEdit.originalPrice,
                dealPrice: adToEdit.dealPrice,
                maxClaims: adToEdit.maxClaims,
                backgroundColor: adToEdit.backgroundColor,
            })
            setLocalFile(null)
        } else if (!adToEdit && isOpen) {
            setFormData({
                title: '',
                description: '',
                type: 'place_deal',
                placement: 'home_top',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                backgroundColor: '#3b82f6', // Default blue
            })
            setLocalFile(null)
        }
    }, [adToEdit, isOpen])

    // Date formatting helper for input fields
    const formatDateForInput = (isoString: string) => {
        try {
            return new Date(isoString).toISOString().slice(0, 16)
        } catch (e) {
            return ''
        }
    }

    const handlePlaceSearch = async (query: string) => {
        const res = await searchAdminPlacesAction(query);
        if (res.success && res.results) {
            return res.results.map(r => ({ id: r.id, slug: r.slug, label: r.name }));
        }
        return [];
    };

    const handleItemSearch = async (query: string) => {
        const res = await searchAdminItemsAction(query);
        if (res.success && res.results) {
            return res.results.map(r => ({ id: r.id, slug: r.slug, label: r.title }));
        }
        return [];
    };

    const handlePlaceSelect = (id: string, slug: string, label: string) => {
        setFormData({
            ...formData,
            placeId: id,
            targetUrl: `/places/${slug}` // Auto-fill URL
        });
    };

    const handleItemSelect = (id: string, slug: string, label: string) => {
        setFormData({
            ...formData,
            marketplaceItemId: id,
            targetUrl: `/marketplace/${slug}` // Auto-fill URL
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let finalImageUrl = formData.imageUrl

            // 1. Upload image if a new file was selected
            if (localFile) {
                const { uploadImageAction } = await import('@/app/actions/upload-image-action')
                const uploadFormData = new FormData()
                uploadFormData.append('files', localFile)

                const uploadResult = await uploadImageAction(uploadFormData, 'promotions', 'banners')
                if (uploadResult.success && uploadResult.urls) {
                    finalImageUrl = uploadResult.urls[0]
                } else {
                    toast.error('فشل رفع الصورة: ' + (uploadResult.error || 'خطأ غير معروف'))
                    setLoading(false)
                    return
                }
            }

            const submissionData = { ...formData, imageUrl: finalImageUrl }

            const res = adToEdit
                ? await updateAdminAdAction(adToEdit.id, submissionData)
                : await createAdminAdAction(submissionData)

            if (res.success) {
                toast.success(res.message)
                router.refresh()
                onClose()
            } else {
                toast.error(res.message || 'حدث خطأ أثناء الحفظ')
            }
        } catch (error) {
            console.error('Submit Error:', error)
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
                            <Megaphone size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">
                                {adToEdit ? 'تعديل الإعلان' : 'إضافة إعلان أو ترويج جديد'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {adToEdit ? 'قم بتحديث تفاصيل الإعلان الحالي' : 'قم بإعداد تفاصيل الإعلان ليظهر في المكان المحدد'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Type & Placement */}
                        <div className="space-y-1.5 md:col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold flex items-center gap-2 mb-2">نوع الإعلان</label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => {
                                        const newType = e.target.value as any;
                                        setFormData({
                                            ...formData,
                                            type: newType,
                                            placement: newType === 'platform_announcement' ? 'home_top' : formData.placement,
                                            targetUrl: (newType === 'adsense' || newType === 'platform_announcement') ? '' : formData.targetUrl,
                                            imageUrl: newType === 'platform_announcement' ? '' : formData.imageUrl,
                                            adCode: newType === 'adsense' ? formData.adCode : ''
                                        });
                                    }}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="place_deal">خصم لمكان (مطعم/محل)</option>
                                    <option value="item_deal">ترويج منتج من السوق</option>
                                    <option value="native_ad">بنر إعلاني مدفوع</option>
                                    <option value="platform_announcement">إعلان تنبيهي إداري (شريط علوي)</option>
                                    <option value="adsense">مساحة جوجل AdSense</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold flex items-center gap-2 mb-2">مكان الظهور</label>
                                <select
                                    required
                                    value={formData.placement}
                                    onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {formData.type === 'platform_announcement' ? (
                                        <option value="home_top">الرئيسية (أعلى شريط)</option>
                                    ) : (
                                        <>
                                            <option value="home_top">الرئيسية (أعلى - تحت الهيرو مباشرة)</option>
                                            <option value="home_middle">الرئيسية (وسط - بين الأقسام)</option>
                                            <option value="home_bottom">الرئيسية (أسفل - فوق الفوتر)</option>
                                            <option value="marketplace_feed">وسط قائمة منتجات السوق (Feed)</option>
                                            {(formData.type === 'native_ad' || formData.type === 'adsense') && (
                                                <option value="marketplace_sidebar">السوق (شريط جانبي)</option>
                                            )}
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold flex items-center gap-2">العنوان أو الوصف القصير (إلزامي)</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder={formData.type === 'adsense' ? 'مثال: إعلان أعلى السوق' : 'أدخل عنواناً للمتابعة...'}
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold flex items-center gap-2">الوصف التفصيلي (اختياري)</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                                placeholder="أدخل تفاصيل إضافية عن العرض أو الإعلان..."
                            />
                        </div>

                        {formData.type === 'platform_announcement' && (
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-bold flex items-center gap-2 mb-2">لون خلفية الشريط (تطبيقي)</label>
                                <div className="flex flex-wrap gap-4">
                                    {[
                                        { color: '#3b82f6', label: 'أزرق' },
                                        { color: '#ef4444', label: 'أحمر' },
                                        { color: '#f59e0b', label: 'برتقالي' },
                                        { color: '#10b981', label: 'أخضر' },
                                        { color: '#6366f1', label: 'بنفسجي' },
                                        { color: '#000000', label: 'أسود' },
                                    ].map((c) => (
                                        <button
                                            key={c.color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, backgroundColor: c.color })}
                                            className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${formData.backgroundColor === c.color ? 'border-primary scale-110 shadow-lg' : 'border-transparent'}`}
                                            style={{ backgroundColor: c.color }}
                                            title={c.label}
                                        />
                                    ))}
                                    <div className="flex items-center gap-2 mr-2">
                                        <span className="text-xs text-muted-foreground">لون مخصص:</span>
                                        <input
                                            type="color"
                                            value={formData.backgroundColor || '#3b82f6'}
                                            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                            className="w-8 h-8 rounded border-none p-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold">تاريخ البدء</label>
                            <input
                                required
                                type="datetime-local"
                                value={formData.startDate ? formatDateForInput(formData.startDate) : ''}
                                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value).toISOString() })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold">تاريخ الانتهاء</label>
                            <input
                                required
                                type="datetime-local"
                                value={formData.endDate ? formatDateForInput(formData.endDate) : ''}
                                onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value).toISOString() })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>

                        {/* Conditional Fields based on Type */}

                        {formData.type === 'place_deal' && (
                            <>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-bold flex items-center gap-2 text-indigo-600">
                                        <Target size={16} /> ربط الإعلان بمكان (ابحث باسم المكان)
                                    </label>
                                    <div className="border border-indigo-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20">
                                        <SearchableDropdown
                                            value={formData.placeId || ''}
                                            onChange={handlePlaceSelect}
                                            onSearch={handlePlaceSearch}
                                            placeholder="اكتب اسم المكان للبحث..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold">السعر الأصلي (اختياري)</label>
                                    <input type="number" min={0} value={formData.originalPrice || ''} onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || undefined })} className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-indigo-600">سعر العرض (مطلوب)</label>
                                    <input type="number" min={0} required value={formData.dealPrice || ''} onChange={(e) => setFormData({ ...formData, dealPrice: parseFloat(e.target.value) || undefined })} className="w-full bg-muted/30 border border-indigo-300 rounded-xl px-4 py-2.5 outline-none font-black" />
                                </div>
                            </>
                        )}

                        {formData.type === 'item_deal' && (
                            <>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-bold flex items-center gap-2 text-fuchsia-600">
                                        <ShoppingBag size={16} /> ربط الإعلان بمنتج (ابحث باسم المنتج)
                                    </label>
                                    <div className="border border-fuchsia-200 rounded-xl focus-within:ring-2 focus-within:ring-fuchsia-500/20">
                                        <SearchableDropdown
                                            value={formData.marketplaceItemId || ''}
                                            onChange={handleItemSelect}
                                            onSearch={handleItemSearch}
                                            placeholder="اكتب اسم المنتج أو الخدمة للبحث..."
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">سيتم جلب صورة المنتج والـ URL وتعبئتها تلقائياً لاحقاً لتسهيل العملية.</p>
                                </div>
                            </>
                        )}

                        {formData.type === 'native_ad' && (
                            <div className="space-y-1.5 md:col-span-2 mt-4 pt-4 border-t border-border">
                                <label className="text-sm font-bold flex items-center gap-2 text-emerald-600">
                                    <LinkIcon size={16} /> رابط التوجيه (Target URL)
                                </label>
                                <input
                                    type="url"
                                    value={formData.targetUrl || ''}
                                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                                    className="w-full bg-emerald-50/30 border border-emerald-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 outline-none text-left"
                                    dir="ltr"
                                    placeholder="https://example.com"
                                />
                            </div>
                        )}

                        {(formData.type === 'native_ad' || formData.type === 'item_deal' || formData.type === 'place_deal') && (
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-bold flex items-center gap-2 text-emerald-600">
                                    <ImageIcon size={16} /> صورة البنر أو الإعلان
                                </label>
                                <div className="bg-emerald-50/20 p-4 rounded-2xl border border-dashed border-emerald-200 transition-colors">
                                    <SupabaseImageUpload
                                        value={formData.imageUrl || ''}
                                        onChange={(url: string | string[]) => setFormData({ ...formData, imageUrl: url as string })}
                                        onFilesSelected={(files) => setLocalFile(files[0] || null)}
                                        maxFiles={1}
                                        bucketName="promotions"
                                        autoUpload={false}
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-2 text-center font-bold">قم برفع بنر جذاب يتناسب مع واجهة الموقع.</p>
                                </div>
                            </div>
                        )}

                        {formData.type === 'adsense' && (
                            <div className="space-y-1.5 md:col-span-2 mt-4 pt-4 border-t border-border">
                                <label className="text-sm font-bold flex items-center gap-2 text-amber-600">
                                    <LayoutGrid size={16} /> رقم تعريف الوحدة الإعلانية (AdSense Slot ID)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.adCode || ''}
                                    onChange={(e) => setFormData({ ...formData, adCode: e.target.value })}
                                    className="w-full bg-amber-50/30 border border-amber-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500/20 outline-none font-mono text-left"
                                    dir="ltr"
                                    placeholder="مثال: 1234567890"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1 text-center">قم بإدخال الـ data-ad-slot فقط وليس كود السكريبت بالكامل.</p>
                            </div>
                        )}
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
                                    {adToEdit ? 'تحديث الإعلان' : 'تأكيد وإطلاق الحملة'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
