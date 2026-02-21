import { z } from "zod";

export const placeSchema = z.object({
    name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100, "الاسم طويل جداً"),
    slug: z.string().min(2, "الرابط يجب أن يكون حرفين على الأقل").regex(/^[a-z0-9-]+$/, "الرابط يجب أن يحتوي على حروف وأرقام وشرطات فقط"),
    description: z.string().max(2000, "الوصف طويل جداً").optional().nullable(),
    address: z.string().min(5, "العنوان يجب أن يكون 5 حروف على الأقل").max(500, "العنوان طويل جداً"),

    // Location
    areaId: z.string().uuid("يرجى اختيار منطقة صحيحة").optional().nullable(),

    // Category
    categoryId: z.string().uuid("يرجى اختيار تصنيف صحيح"),

    // Contact
    phone: z.string().regex(/^[0-9+() -]+$/, "رقم الهاتف غير صحيح").optional().nullable(),
    whatsapp: z.string().regex(/^[0-9+() -]+$/, "رقم الواتساب غير صحيح").optional().nullable(),
    website: z.string().url("رابط الموقع غير صحيح").optional().nullable(),
    googleMapsUrl: z.string().url("رابط خرائط جوجل غير صحيح").optional().nullable(),

    // Media
    images: z.array(z.string().url("رابط الصورة غير صحيح")).min(1, "يرجى إضافة صورة واحدة على الأقل").max(10, "يمكن إضافة 10 صور كحد أقصى"),

    // Social
    socialLinks: z.record(z.string(), z.string().url("رابط غير صحيح")).optional().nullable(),

    // Business Info
    type: z.enum(['business', 'professional']).default('business'),
    status: z.enum(['active', 'pending', 'inactive']).default('pending'),

    // Opening Hours
    opensAt: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "تنسيق الوقت غير صحيح").optional().nullable(),
    closesAt: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "تنسيق الوقت غير صحيح").optional().nullable(),
    openingHours: z.record(z.string(), z.any()).optional().nullable(),

    // Delivery
    hasDelivery: z.boolean().default(false),
    talabatUrl: z.string().url("رابط طلبات غير صحيح").optional().nullable(),
    glovoUrl: z.string().url("رابط جلوفو غير صحيح").optional().nullable(),
    deliveryPhone: z.string().optional().nullable(),

    // Flags
    isFeatured: z.boolean().default(false),
    isVerified: z.boolean().default(false),
    isClaimed: z.boolean().default(false),

    // External
    googlePlaceId: z.string().optional().nullable(),
});

export const createPlaceSchema = placeSchema.omit({
    status: true, // Status is handled by backend logic (pending for users)
    isVerified: true,
    isClaimed: true,
});

export const updatePlaceSchema = placeSchema.partial();

export type PlaceInput = z.infer<typeof placeSchema>;
export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;
