import slugify from 'slugify';

// Simple map for common Arabic characters to English for fallback transliteration
const arabicToEnglishMap: Record<string, string> = {
    'ا': 'a', 'b': 'b', 'ت': 't', 'ث': 'th', 'ج': 'g', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'h', 'ى': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a', 'ؤ': 'o', 'ئ': 'e',
};

async function translateText(text: string): Promise<string> {
    try {
        // Try Google Translate API (undocumented endpoint, but widely used for quick translation)
        // If this fails, we fall back to transliteration. 
        // Note: Using `fetch` in Node environment requires Node 18+ or polyfill. Next.js environment has it.
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Translation failed');
        const data = await response.json();
        // Extract translated text from response structure [[["translated", "original", ...], ...], ...]
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            return data[0][0][0];
        }
    } catch (error) {
        console.warn('Translation API failed, falling back to transliteration', error);
    }

    // Fallback: Transliteration
    return text.split('').map(char => arabicToEnglishMap[char] || char).join('');
}

export async function generateSmartSlug(text: string): Promise<string> {
    let slugBase = text;

    // 1. Try to translate or transliterate Arabic text
    if (/[\u0600-\u06FF]/.test(text)) {
        slugBase = await translateText(text);
    }

    // 2. Slugify (kebab-case, remove special chars)
    const slug = slugify(slugBase, {
        lower: true,
        strict: true,
        locale: 'en',
        replacement: '-'
    });

    // 3. Append random string for uniqueness (collision avoidance)
    // Using a timestamp + random 4 char string is robust enough for this scale
    const uniqueSuffix = `${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 6)}`;

    return `${slug}-${uniqueSuffix}`;
}
