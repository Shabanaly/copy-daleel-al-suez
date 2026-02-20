/**
 * تنظيف المدخلات النصية لمنع XSS وحقن أكواد ضارة
 * يُستخدم server-side قبل تخزين البيانات في قاعدة البيانات
 */

/**
 * تنظيف نص عام — إزالة HTML tags و javascript URIs
 */
export function sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // إزالة script tags
        .replace(/<[^>]*>/g, '')            // إزالة كل HTML tags
        .replace(/javascript\s*:/gi, '')     // إزالة javascript: URIs
        .replace(/on\w+\s*=/gi, '')         // إزالة event handlers (onclick, onerror, etc.)
        .replace(/data\s*:\s*text\/html/gi, '') // إزالة data URIs
        .trim();
}

/**
 * تنظيف رقم هاتف — أرقام فقط
 */
export function sanitizePhone(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input.replace(/[^0-9+]/g, '').trim();
}

/**
 * تنظيف رقم — أرقام ونقطة فقط
 */
export function sanitizeNumber(input: string | number): number {
    if (typeof input === 'number') return input;
    if (!input || typeof input !== 'string') return 0;
    const parsed = parseFloat(input.replace(/[^0-9.]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * تنظيف كائن attributes — تنظيف كل القيم النصية
 */
export function sanitizeAttributes(attrs: Record<string, any>): Record<string, any> {
    if (!attrs || typeof attrs !== 'object') return {};

    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(attrs)) {
        const cleanKey = sanitizeText(key);
        if (typeof value === 'string') {
            cleaned[cleanKey] = sanitizeText(value);
        } else if (typeof value === 'boolean' || typeof value === 'number') {
            cleaned[cleanKey] = value;
        }
        // تجاهل أي قيم غير مدعومة
    }
    return cleaned;
}

/**
 * التحقق من صحة رابط صورة
 */
export function isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    // نقبل فقط روابط Supabase Storage أو روابط نسبية
    const allowedPatterns = [
        /^\/storage\//,                          // روابط نسبية
        /^https:\/\/[a-z]+\.supabase\.co\//,     // روابط Supabase المباشرة
    ];

    return allowedPatterns.some(pattern => pattern.test(url));
}

/**
 * تنظيف مصفوفة روابط صور
 */
export function sanitizeImageUrls(urls: any[]): string[] {
    if (!Array.isArray(urls)) return [];
    return urls
        .filter(url => typeof url === 'string' && url.trim().length > 0)
        .slice(0, 10); // حد أقصى 10 صور
}
