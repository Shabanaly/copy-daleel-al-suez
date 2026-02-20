'use server'

import { slugify } from '@/lib/slugify'

export async function translateAndSlugify(text: string): Promise<string> {
    if (!text || text.trim() === '') return ''

    try {
        // Using Google Translate 'gtx' (free) endpoint
        // Valid for low-volume usage. For high-volume, use official Google Cloud Translation API.
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`

        const response = await fetch(url)
        if (!response.ok) throw new Error('Translation failed')

        const data = await response.json()
        // Data format: [[["Translated Text", "Original Text", ...], ...], ...]
        const translatedText = data[0][0][0]

        return slugify(translatedText)
    } catch (error) {
        console.error('Translation error:', error)
        // Fallback to simple transliteration if API fails
        return slugify(text) // This will use the basic logic we have or we can import the transliterator if needed, 
        // but for now let's just return safe slug
    }
}
