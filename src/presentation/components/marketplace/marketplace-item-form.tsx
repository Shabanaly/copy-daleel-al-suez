'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Tag } from 'lucide-react';
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms';
import { DynamicFormBuilder, FormField } from '@/presentation/components/marketplace/dynamic-form-builder';
import { ImageUpload } from '@/presentation/components/marketplace/image-upload';
import { LocationSelect } from '@/presentation/components/marketplace/location-select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';
import { MarketplaceItem } from '@/domain/entities/marketplace-item';
import { useImageUpload } from '@/hooks/use-image-upload';
import { createMarketplaceItemAction, updateMarketplaceItemAction } from '@/actions/marketplace.actions';

const itemSchema = z.object({
    title: z.string().min(5, 'عنوان الإعلان يجب أن يكون 5 حروف على الأقل'),
    description: z.string().min(10, 'الوصف يجب أن يكون 10 حروف على الأقل'),
    price: z.number().min(1, 'السعر يجب أن يكون أكبر من 0'),
    category: z.string().min(1, 'اختر القسم'),
    location: z.string().min(1, 'اختر الموقع'),
    seller_phone: z.string().regex(/^01[0125][0-9]{8}$/, 'رقم الهاتف غير صحيح (يجب أن يبدأ ب 01 ويتكون من 11 رقم)'),
    seller_whatsapp: z.string().regex(/^01[0125][0-9]{8}$/, 'رقم الواتساب غير صحيح').optional().or(z.literal('')),
});

interface MarketplaceItemFormProps {
    initialData?: MarketplaceItem | null;
    categoryConfig: any;
    onSuccess?: () => void;
}

export function MarketplaceItemForm({ initialData, categoryConfig, onSuccess }: MarketplaceItemFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const { uploadImages, uploading: isUploading } = useImageUpload();
    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
    const [attributes, setAttributes] = useState<Record<string, any>>(initialData?.attributes || {});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        price: initialData?.price?.toString() || '',
        category: initialData?.category || categoryConfig.id || '',
        condition: initialData?.condition || '',
        location: initialData?.location || '',
        area_id: initialData?.area_id || '',
        seller_phone: initialData?.seller_phone || '',
        seller_whatsapp: initialData?.seller_whatsapp || '',
        listing_type: initialData?.attributes?.listing_type || 'offered',
        price_type: (initialData as any)?.price_type || 'fixed',
        honeypot: '',
    });

    // Get base category configuration
    const baseConfig = MARKETPLACE_FORMS[formData.category];

    // Get sub-type value from attributes if typeSelector exists
    const selectedSubType = baseConfig?.typeSelector ? attributes[baseConfig.typeSelector.name] : null;

    // Get sub-type config (fields come only from sub-type in V3)
    const subTypeConfig = (selectedSubType && baseConfig?.subTypes?.[selectedSubType]) || null;

    // Fields to render = sub-type fields only
    const dynamicFields: FormField[] = subTypeConfig?.fields || [];
    const effectiveHint = subTypeConfig?.hint;
    const effectivePlaceholder = subTypeConfig?.placeholder;

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const parsedPrice = Number(formData.price);

        if (isNaN(parsedPrice) || formData.price === '') {
            newErrors.price = 'السعر يجب أن يكون رقم';
        } else if (parsedPrice <= 0) {
            newErrors.price = 'السعر يجب أن يكون أكبر من 0';
        }

        try {
            itemSchema.parse({
                ...formData,
                price: parsedPrice
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.issues.forEach((err) => {
                    if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
                });
            }
        }

        // Add validation for sub-type if selector exists
        if (baseConfig?.typeSelector && !attributes[baseConfig.typeSelector.name]) {
            newErrors[baseConfig.typeSelector.name] = `يرجى اختيار ${baseConfig.typeSelector.label}`;
        }

        // Total images check (existing + new)
        const totalImages = images.length + existingImages.length;
        if (totalImages > 10) {
            toast.error('الحد الأقصى للصور هو 10 صور فقط (شاملة الصور الحالية)');
            return false;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('يرجى التأكد من صحة البيانات المدخلة');
            return;
        }

        if (images.length === 0 && existingImages.length === 0) {
            toast.error('يجب إضافة صورة واحدة على الأقل');
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('يجب تسجيل الدخول أولاً');
                return;
            }

            // Upload new images (client-side — OK, only returns URLs)
            const newImageUrls = await uploadImages(images, user.id);
            const uploadedUrls = [...existingImages, ...newImageUrls];

            // Prepare data for server action
            // Remove condition from attributes to avoid duplication (condition has its own column)
            const { condition: _condAttr, ...cleanAttributes } = attributes;
            const itemData = {
                title: formData.title,
                description: formData.description,
                price: Number(formData.price),
                category: formData.category,
                condition: _condAttr || formData.condition || null,
                location: formData.location,
                area_id: formData.area_id,
                seller_phone: formData.seller_phone,
                seller_whatsapp: formData.seller_whatsapp || formData.seller_phone,
                images: uploadedUrls,
                attributes: { ...cleanAttributes },
                listing_type: formData.listing_type,
                price_type: formData.price_type as any,
                honeypot: formData.honeypot,
            };

            let createdSlug: string | undefined;
            let result: any;

            if (initialData) {
                // Update via Server Action (validates + sanitizes server-side)
                result = await updateMarketplaceItemAction(initialData.id, itemData);
                if (!result.success) throw new Error(result.error || 'حدث خطأ');
                toast.success('تم تحديث الإعلان بنجاح');
            } else {
                // Create via Server Action (validates + sanitizes + generates slug server-side)
                result = await createMarketplaceItemAction(itemData);
                if (!result.success) throw new Error(result.error || 'حدث خطأ');
                createdSlug = result.slug;
                toast.success('تم إضافة الإعلان بنجاح');
            }

            if (onSuccess) onSuccess();
            else if (!initialData && createdSlug) {
                const status = (result as any).status || 'pending';
                router.push(`/marketplace/success?slug=${createdSlug}&status=${status}`);
            }
            else router.push('/marketplace');
            router.refresh();

        } catch (error: any) {
            console.error('Error saving item:', error);
            // Don't show technical "null" or database errors directly if we can't parse them
            const userFriendlyMessage = error.message?.includes('duplicate key') ? 'هذا الإعلان موجود بالفعل' : (error.message || 'حدث خطأ غير متوقع');
            toast.error(`نأسف، حدث خطأ: ${userFriendlyMessage}`);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field (hidden from users, but robots will fill it) */}
            <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={e => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
            />

            {/* Images */}
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                <ImageUpload
                    value={images}
                    onChange={setImages}
                    maxFiles={10}
                />
                {existingImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-5 gap-2">
                        {existingImages.map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                                <img src={url} alt="" className="object-cover w-full h-full" />
                                <button
                                    type="button"
                                    onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                                >
                                    <Tag className="w-3 h-3 rotate-45" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Basic Info */}
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">عنوان الإعلان</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border outline-none bg-muted ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        placeholder="اكتب عنوان واضح ومختصر لإعلانك"
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">السعر (ج.م)</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border outline-none bg-muted ${errors.price ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                            placeholder="0"
                        />
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">نوع السعر</label>
                        <select
                            value={formData.price_type}
                            onChange={e => setFormData({ ...formData, price_type: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-border outline-none bg-muted focus:border-primary"
                        >
                            <option value="fixed">سعر ثابت</option>
                            <option value="negotiable">قابل للتفاوض</option>
                            <option value="contact">اتصل للسعر</option>
                        </select>
                    </div>
                </div>

                {/* Global Metadata */}
                <div className="py-2">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">نوع الإعلان</label>
                        <div className="flex gap-2">
                            {['offered', 'wanted'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, listing_type: type as any })}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl border font-bold transition-all",
                                        formData.listing_type === type
                                            ? (type === 'offered' ? "bg-primary/10 border-primary text-primary" : "bg-secondary/10 border-secondary text-secondary")
                                            : "bg-muted border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                                    )}
                                >
                                    {type === 'offered' ? 'معروض للبيع' : 'مطلوب للشراء'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sub-Type Selector (if exists) */}
                {baseConfig?.typeSelector && (
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">
                            {baseConfig.typeSelector.label} <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={attributes[baseConfig.typeSelector.name] || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setAttributes(prev => {
                                    const next = { ...prev, [baseConfig.typeSelector!.name]: val };
                                    // Reset sub-type fields when type changes if needed
                                    return next;
                                });
                            }}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl border outline-none bg-muted transition-all",
                                errors[baseConfig.typeSelector.name] ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
                            )}
                        >
                            <option value="">اختر {baseConfig.typeSelector.label}</option>
                            {baseConfig.typeSelector.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        {errors[baseConfig.typeSelector.name] && <p className="text-red-500 text-xs mt-1">{errors[baseConfig.typeSelector.name]}</p>}
                    </div>
                )}

                {/* Dynamic Fields */}
                {dynamicFields.length > 0 && (
                    <DynamicFormBuilder
                        key={`${formData.category}-${selectedSubType}`}
                        fields={dynamicFields}
                        onChange={setAttributes}
                        initialValues={attributes}
                    />
                )}

                <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">الوصف</label>
                    <textarea
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border outline-none bg-muted ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        placeholder={effectivePlaceholder || "اكتب تفاصيل إعلانك هنا... الحالة، السبب، أي معلومات مهمة"}
                    />
                    {effectiveHint && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="text-primary">💡</span> {effectiveHint}
                        </p>
                    )}
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
            </div>

            {/* Location & Phone */}
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-4">
                <LocationSelect
                    value={formData.area_id}
                    onChange={(id, name) => setFormData({ ...formData, area_id: id, location: name || '' })}
                    error={errors.location}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">رقم الهاتف</label>
                        <input
                            type="tel"
                            value={formData.seller_phone}
                            onChange={e => setFormData({ ...formData, seller_phone: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border outline-none bg-muted ${errors.seller_phone ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">رقم الواتساب</label>
                        <input
                            type="tel"
                            value={formData.seller_whatsapp}
                            onChange={e => setFormData({ ...formData, seller_whatsapp: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border outline-none bg-muted ${errors.seller_whatsapp ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? 'حفظ التغييرات' : 'نشر الإعلان')}
            </button>
        </form>
    );
}
