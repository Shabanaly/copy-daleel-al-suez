'use server'

import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export async function uploadImageAction(formData: FormData, bucketName: string = 'places', folderPath: string = 'uploads') {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'يجب تسجيل الدخول لرفع الصور' }
        }

        const files = formData.getAll('files') as File[]

        if (!files || files.length === 0) {
            return { success: false, error: 'No files provided' }
        }

        const urls: string[] = []

        for (const file of files) {
            console.log(`Processing file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB, type: ${file.type}`)

            // 1. Convert File to Buffer
            const buffer = Buffer.from(await file.arrayBuffer())

            // 2. Process with Sharp
            const processedBuffer = await sharp(buffer)
                .rotate() // Auto-rotate based on EXIF orientation
                .resize(1200, 1200, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 75 })
                .toBuffer()

            // 3. Prepare File Name
            const fileName = `${folderPath}/${uuidv4()}.webp`

            // 4. Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, processedBuffer, {
                    contentType: 'image/webp',
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error('Upload Error:', uploadError)
                return { success: false, error: `فشل رفع صورة ${file.name}: ${uploadError.message}` }
            }

            // 5. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName)

            urls.push(publicUrl)
        }

        return { success: true, urls }
    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, error: 'Failed to process and upload images' }
    }
}
