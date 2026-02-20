export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\u0600-\u06FF\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

export function transliterateArabic(text: string): string {
    const map: { [key: string]: string } = {
        'أ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'g', 'h': '7', 'خ': 'kh', 'd': 'd', 'ذ': 'th',
        'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
        'ع': '3', 'غ': 'gh', 'ف': 'f', 'q': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
        'ه': 'h', 'و': 'w', 'ي': 'y', 'ة': 'h', 'ى': 'a', 'ا': 'a', 'إ': 'e', 'آ': 'a',
        'ؤ': 'o', 'ئ': 'e', 'ء': 'a'
    };

    return text.split('').map(char => map[char] || char).join('');
}

export function generateSlug(text: string): string {
    const englishText = transliterateArabic(text);
    return slugify(englishText);
}
