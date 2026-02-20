'use client'

import { toast } from 'sonner'
import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createPlaceAction, updatePlaceAction, PlaceState } from '@/actions/place.actions'
import { translateAndSlugify } from '@/app/actions/translate'
import { useDebounce } from 'use-debounce'
import { Loader2, Store, User, MapPin, Globe, Phone, Facebook, Instagram, Youtube, Bike } from 'lucide-react'
import SupabaseImageUpload from '@/presentation/components/ui/supabase-image-upload'
import { uploadImageAction } from '@/app/actions/upload-image-action'
import { Place } from '@/domain/entities/place'
import { Area } from '@/domain/entities/area'
import { createPlaceSchema } from '@/domain/schemas/place.schema'

// Types
type AddPlaceFormProps = {
    categories: { id: string; name: string }[]
    areas: Area[]
    initialPlace?: Place
}

const initialState: PlaceState = {
    message: '',
    errors: {}
}

export default function AddPlaceForm({ categories, areas, initialPlace }: AddPlaceFormProps) {
    const router = useRouter()
    const isEditMode = !!initialPlace

    // --- State ---
    const [name, setName] = useState(initialPlace?.name || '')
    const [slug, setSlug] = useState(initialPlace?.slug || '')
    const [type, setType] = useState<'business' | 'professional'>(initialPlace?.type || 'business')
    const [images, setImages] = useState<string[]>(initialPlace?.images || [])
    const [address, setAddress] = useState(initialPlace?.address || '')
    const [opensAt, setOpensAt] = useState(initialPlace?.opensAt || '')
    const [closesAt, setClosesAt] = useState(initialPlace?.closesAt || '')
    const [phone, setPhone] = useState(initialPlace?.phone || '')
    const [whatsapp, setWhatsapp] = useState(initialPlace?.whatsapp || '')
    const [website, setWebsite] = useState(initialPlace?.website || '')
    const [googleMapsUrl, setGoogleMapsUrl] = useState(initialPlace?.googleMapsUrl || '')
    const [description, setDescription] = useState(initialPlace?.description || '')
    const [categoryId, setCategoryId] = useState(initialPlace?.categoryId || '')
    const [areaId, setAreaId] = useState(initialPlace?.areaId || '')

    // Delivery State
    const [hasDelivery, setHasDelivery] = useState(initialPlace?.hasDelivery || false)
    const [deliveryPhone, setDeliveryPhone] = useState(initialPlace?.deliveryPhone || '')
    const [talabatUrl, setTalabatUrl] = useState(initialPlace?.talabatUrl || '')
    const [glovoUrl, setGlovoUrl] = useState(initialPlace?.glovoUrl || '')

    // Social Links State
    const [socialLinks, setSocialLinks] = useState(initialPlace?.socialLinks || {
        facebook: '',
        instagram: '',
    })
    const [videoUrl, setVideoUrl] = useState(initialPlace?.videoUrl || '')
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isUploadingImages, setIsUploadingImages] = useState(false)

    const [debouncedName] = useDebounce(name, 1000)
    const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)

    // --- Actions ---
    const handleSubmit = async (prevState: PlaceState, formData: FormData): Promise<PlaceState> => {
        const rawData = Object.fromEntries(formData.entries()) as Record<string, unknown>

        // 1. Construct preliminary payload for client-side validation
        const prePayload = {
            ...rawData,
            name: name.trim(),
            slug: slug.trim(),
            address: address.trim(),
            description: description.trim() || undefined,
            phone: phone.trim(),
            whatsapp: whatsapp.trim() || undefined,
            website: website.trim() || undefined,
            googleMapsUrl: googleMapsUrl.trim() || undefined,
            socialLinks: Object.fromEntries(
                Object.entries(socialLinks).filter(([_, v]) => v && v.trim() !== '')
            ),
            videoUrl: videoUrl.trim() || undefined,
            type,
            opensAt: opensAt || null,
            closesAt: closesAt || null,
            areaId: areaId || undefined,
            categoryId: categoryId || undefined,
            hasDelivery,
            deliveryPhone: (hasDelivery && deliveryPhone) ? deliveryPhone.trim() : undefined,
            talabatUrl: (hasDelivery && talabatUrl) ? talabatUrl.trim() : undefined,
            glovoUrl: (hasDelivery && glovoUrl) ? glovoUrl.trim() : undefined,
        }

        // 2. Client-side validation check BEFORE upload
        const validation = createPlaceSchema.safeParse(prePayload)
        if (!validation.success) {
            const errors: Record<string, string[]> = {}
            validation.error.issues.forEach((issue) => {
                const path = issue.path[0] as string
                if (!errors[path]) errors[path] = []
                errors[path].push(issue.message)
            })
            return { message: "يرجى تصحيح الأخطاء في النموذج قبل المتابعة", errors, success: false }
        }

        setIsUploadingImages(true)
        let finalImageUrls = [...images]

        try {
            if (selectedFiles.length > 0) {
                const imageFormData = new FormData()
                selectedFiles.forEach(file => imageFormData.append('files', file))

                const uploadResult = await uploadImageAction(imageFormData, 'places', 'user-uploads')
                if (uploadResult.success && uploadResult.urls) {
                    finalImageUrls = [...finalImageUrls.filter(url => !url.startsWith('blob:')), ...uploadResult.urls]
                } else {
                    return { message: uploadResult.error || "خطأ في رفع الصور", success: false }
                }
            }
        } catch (error) {
            console.error("Upload error:", error)
            return { message: "حدث خطأ أثناء معالجة الصور", success: false }
        } finally {
            setIsUploadingImages(false)
        }

        const payload: Partial<Place> = {
            ...rawData,
            name: name.trim(),
            slug: slug.trim(),
            address: address.trim(),
            description: description.trim() || undefined,
            phone: phone.trim(),
            whatsapp: whatsapp.trim() || undefined,
            website: website.trim() || undefined,
            googleMapsUrl: googleMapsUrl.trim() || undefined,
            images: finalImageUrls,
            socialLinks: Object.fromEntries(
                Object.entries(socialLinks).filter(([_, v]) => v && v.trim() !== '')
            ),
            videoUrl: videoUrl.trim() || undefined,
            type,
            opensAt: opensAt || null,
            closesAt: closesAt || null,
            areaId: areaId || undefined,
            categoryId: categoryId || undefined,
            hasDelivery,
            deliveryPhone: (hasDelivery && deliveryPhone) ? deliveryPhone.trim() : undefined,
            talabatUrl: (hasDelivery && talabatUrl) ? talabatUrl.trim() : undefined,
            glovoUrl: (hasDelivery && glovoUrl) ? glovoUrl.trim() : undefined,
            status: isEditMode ? initialPlace?.status : 'pending'
        }

        if (isEditMode && initialPlace) {
            return await updatePlaceAction(initialPlace.id, payload)
        }
        return await createPlaceAction(payload)
    }

    const [state, action, isPending] = useActionState(handleSubmit, initialState)

    // --- Effects ---
    useEffect(() => {
        if (state.success) {
            toast.success(isEditMode ? 'تم تحديث البيانات بنجاح!' : 'تم إرسال طلبك بنجاح! سيتم مراجعته قريباً.')
            if (!isEditMode) {
                router.push('/places/thank-you')
            } else {
                router.refresh()
            }
        } else if (state.message) {
            toast.error(state.message)
        }
    }, [state, router, isEditMode])

    // Auto-generate slug
    useEffect(() => {
        const generateSlug = async () => {
            if (debouncedName && !slug) {
                setIsGeneratingSlug(true)
                try {
                    const generated = await translateAndSlugify(debouncedName)
                    setSlug(generated)
                } catch (error) {
                    console.error("Slug generation failed", error)
                } finally {
                    setIsGeneratingSlug(false)
                }
            }
        }
        generateSlug()
    }, [debouncedName, slug])

    // --- Helper Functions ---
    const handleSearchOnMap = () => {
        const query = `${name} ${address}`.trim()
        if (!query) {
            toast.error('يرجى إدخال الاسم والعنوان أولاً للبحث')
            return
        }
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank')
    }


    return (
        <div className="w-full space-y-8">

            <form action={action} className="space-y-8 bg-card p-8 rounded-2xl border border-border shadow-xl w-full">

                {/* Type Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-muted-foreground">نوع الإضافة</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setType('business')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${type === 'business'
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-background border-border text-muted-foreground hover:bg-accent'
                                }`}
                        >
                            <Store size={32} />
                            <span className="font-bold">مكان تجاري / شركة</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setType('professional')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${type === 'professional'
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-background border-border text-muted-foreground hover:bg-accent'
                                }`}
                        >
                            <User size={32} />
                            <span className="font-bold">فني / مهني مستقل</span>
                        </button>
                    </div>
                </div>

                <div className="border-t border-border"></div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Right Column: Basic Info */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">الاسم (بالعربي) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground/50"
                                placeholder={type === 'business' ? "مثال: مطعم اسماك السويس" : "مثال: ورشة الأسطى محمد"}
                            />
                            {state.errors?.name && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.name[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">الرابط (Slug) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-muted-foreground font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                                {isGeneratingSlug && <div className="absolute left-3 top-3"><Loader2 className="animate-spin text-primary w-5 h-5" /></div>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">يتم إنشاؤه تلقائياً باللغة الإنجليزية ليكون رابط الصفحة</p>
                            {state.errors?.slug && <p className="text-red-500 text-xs mt-1">{state.errors.slug[0]}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">التصنيف <span className="text-red-500">*</span></label>
                                <select
                                    name="categoryId"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>اختر التصنيف...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {state.errors?.categoryId && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.categoryId[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">المنطقة</label>
                                <select
                                    name="areaId"
                                    value={areaId}
                                    onChange={(e) => setAreaId(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="">بدون منطقة</option>
                                    {areas?.map(area => (
                                        <option key={area.id} value={area.id}>{area.name}</option>
                                    ))}
                                </select>
                                {state.errors?.areaId && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.areaId[0]}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                {type === 'business' ? 'العنوان وتفاصيل الموقع' : 'العنوان (اختياري)'}
                            </label>
                            <textarea
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required={type === 'business'}
                                rows={3}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground/50"
                                placeholder="مثال: شارع الجيش، بجوار البنك الأهلي"
                            />
                            {state.errors?.address && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.address[0]}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">مواعيد العمل</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">يفتح</label>
                                        <input
                                            type="time"
                                            name="opensAt"
                                            value={opensAt}
                                            onChange={(e) => setOpensAt(e.target.value)}
                                            className="w-full px-2 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-center dir-ltr"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">يغلق</label>
                                        <input
                                            type="time"
                                            name="closesAt"
                                            value={closesAt}
                                            onChange={(e) => setClosesAt(e.target.value)}
                                            className="w-full px-2 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-center dir-ltr"
                                        />
                                    </div>
                                </div>
                                {(state.errors?.opensAt || state.errors?.closesAt) && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">تنسيق الوقت غير صحيح</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">رابط خرائط جوجل</label>
                                <div className="relative">
                                    <MapPin className="absolute right-3 top-3.5 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="url"
                                        name="googleMapsUrl"
                                        value={googleMapsUrl}
                                        onChange={(e) => setGoogleMapsUrl(e.target.value)}
                                        className="w-full pr-10 pl-24 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ltr:text-left placeholder:text-muted-foreground/50"
                                        placeholder="https://maps.app.goo.gl/..."
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSearchOnMap}
                                        className="absolute left-2 top-2 px-3 py-1.5 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg text-xs font-medium transition-colors"
                                    >
                                        بحث في الخرائط
                                    </button>
                                </div>
                                {state.errors?.googleMapsUrl && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.googleMapsUrl[0]}</p>}
                            </div>
                        </div>

                        {/* Delivery Section */}
                        <div className="bg-accent/50 p-4 rounded-xl border border-border">
                            <div className="flex items-center gap-2 mb-4">
                                <Bike className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-foreground">خدمات التوصيل</h3>
                            </div>

                            <label className="flex items-center gap-2 mb-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hasDelivery}
                                    onChange={(e) => setHasDelivery(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium">يوجد خدمة توصيل</span>
                            </label>

                            {hasDelivery && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">رقم التوصيل (مخصص)</label>
                                        <input
                                            type="tel"
                                            value={deliveryPhone}
                                            onChange={(e) => setDeliveryPhone(e.target.value)}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-primary dir-ltr"
                                            placeholder="رقم خاص بالدليفري"
                                        />
                                        {state.errors?.deliveryPhone && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.deliveryPhone[0]}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-muted-foreground mb-1">رابط طلبات (Talabat)</label>
                                            <input
                                                type="url"
                                                value={talabatUrl}
                                                onChange={(e) => setTalabatUrl(e.target.value)}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-primary ltr:text-left"
                                                placeholder="https://talabat.com/..."
                                            />
                                            {state.errors?.talabatUrl && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.talabatUrl[0]}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-muted-foreground mb-1">رابط جلوفو (Glovo)</label>
                                            <input
                                                type="url"
                                                value={glovoUrl}
                                                onChange={(e) => setGlovoUrl(e.target.value)}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:ring-1 focus:ring-primary ltr:text-left"
                                                placeholder="https://glovoapp.com/..."
                                            />
                                            {state.errors?.glovoUrl && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.glovoUrl[0]}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Left Column: Contact & Media */}
                    <div className="space-y-6">

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">الصور <span className="text-xs text-muted-foreground/70">(صورة واحدة على الأقل)</span></label>
                            <SupabaseImageUpload
                                value={images}
                                onChange={(urls) => setImages(Array.isArray(urls) ? urls : [urls])}
                                onFilesSelected={(files) => setSelectedFiles(files)}
                            />
                        </div>

                        <div className="border-t border-border my-4"></div>

                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary" />
                            بيانات التواصل
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">رقم الهاتف <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors dir-ltr placeholder:text-muted-foreground/50"
                                    placeholder="01xxxxxxxxx"
                                />
                                {state.errors?.phone && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.phone[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">رقم الواتساب</label>
                                <input
                                    type="tel"
                                    name="whatsapp"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors dir-ltr placeholder:text-muted-foreground/50"
                                    placeholder="201xxxxxxxxx"
                                />
                                {state.errors?.whatsapp && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.whatsapp[0]}</p>}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">فيسبوك</label>
                                <div className="relative">
                                    <Facebook className="absolute right-3 top-3.5 text-blue-500 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={socialLinks.facebook || ''}
                                        onChange={e => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                                        className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ltr:text-left placeholder:text-muted-foreground/50"
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">انستجرام</label>
                                <div className="relative">
                                    <Instagram className="absolute right-3 top-3.5 text-pink-500 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={socialLinks.instagram || ''}
                                        onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                        className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ltr:text-left placeholder:text-muted-foreground/50"
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">الموقع الإلكتروني</label>
                                <div className="relative">
                                    <Globe className="absolute right-3 top-3.5 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="url"
                                        name="website"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ltr:text-left placeholder:text-muted-foreground/50"
                                        placeholder="https://example.com"
                                    />
                                </div>
                                {state.errors?.website && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.website[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">رابط فيديو (يوتيوب / تيك توك ...)</label>
                                <div className="relative">
                                    <Youtube className="absolute right-3 top-3.5 text-red-500 w-5 h-5" />
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={e => setVideoUrl(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ltr:text-left placeholder:text-muted-foreground/50"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                                {state.errors?.videoUrl && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.videoUrl[0]}</p>}
                            </div>
                        </div>
                        {state.errors?.socialLinks && <p className="text-red-500 text-xs font-medium">يوجد خطأ في روابط التواصل الاجتماعي</p>}
                    </div>
                </div>

                <div className="border-t border-border mt-8 pt-6">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">الوصف / عن المكان</label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground/50"
                        placeholder="اكتب وصفاً جذاباً للمكان أو الخدمات المقدمة..."
                    />
                    {state.errors?.description && <p className="text-red-500 text-xs mt-1 font-medium">{state.errors.description[0]}</p>}
                </div>

                {
                    state.message && !state.success && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
                            {state.message}
                        </div>
                    )
                }

                <div className="flex items-center justify-end gap-3 pt-4">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl font-medium transition-colors">
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-8 py-3 bg-primary text-primary-foreground hover:brightness-110 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending || isUploadingImages ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {isUploadingImages ? 'جاري رفع الصور...' : 'جاري الحفظ...'}
                            </>
                        ) : (isEditMode ? 'حفظ التعديلات' : 'إرسال المكان للمراجعة')}
                    </button>
                </div>
            </form>
        </div>
    )
}
