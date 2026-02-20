import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface UseImageUploadOptions {
    bucketName?: string;
    folderPath?: string;
    maxFiles?: number;
    maxSizeMB?: number;
}

export function useImageUpload({
    bucketName = 'marketplace-ads',
    folderPath = 'uploads',
    maxFiles = 5,
    maxSizeMB = 5
}: UseImageUploadOptions = {}) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);

    const validateFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error(`الملف ${file.name} ليس صورة صالحة`);
            return false;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`حجم الصورة ${file.name} أكبر من ${maxSizeMB} ميجابايت`);
            return false;
        }

        return true;
    };

    const uploadImages = async (files: File[], userId: string, subfolder: string = 'items'): Promise<string[]> => {
        if (files.length === 0) return [];

        setUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (const file of files) {
                if (!validateFile(file)) continue;

                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${folderPath}/${userId}/${subfolder}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    toast.error(`فشل رفع الصورة ${file.name}`);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }
        } catch (error) {
            console.error('Unexpected upload error:', error);
            toast.error('حدث خطأ غير متوقع أثناء رفع الصور');
        } finally {
            setUploading(false);
        }

        return uploadedUrls;
    };

    return {
        uploadImages,
        uploading
    };
}
