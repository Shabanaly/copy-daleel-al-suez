'use client'

import React, { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Plus, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadImageAction } from '@/app/actions/upload-image-action'
import imageCompression from 'browser-image-compression'

interface ImageUploadProps {
    value?: string | string[] // Support single or multiple
    onChange: (urls: string | string[]) => void
    onFilesSelected?: (files: File[]) => void
    disabled?: boolean
    maxFiles?: number
    bucketName?: string
    autoUpload?: boolean
}

export default function SupabaseImageUpload({
    value = [],
    onChange,
    onFilesSelected,
    disabled,
    maxFiles = 5,
    bucketName = 'places',
    autoUpload = true
}: ImageUploadProps) {
    const urlsValue = Array.isArray(value) ? value : (value ? [value] : [])
    const [mounted, setMounted] = useState(false)
    const [localFiles, setLocalFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [isCompressing, setIsCompressing] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => {
            urlsValue.forEach(url => {
                if (url.startsWith('blob:')) URL.revokeObjectURL(url)
            })
        }
    }, [])

    const compressImage = async (file: File) => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            initialQuality: 0.8
        }
        try {
            return await imageCompression(file, options)
        } catch (error) {
            console.error('Compression failed, using original file:', error)
            return file
        }
    }

    const onDrop = async (acceptedFiles: File[]) => {
        setIsCompressing(true)
        const processedFiles: File[] = []
        const previews: string[] = []

        for (const file of acceptedFiles) {
            // Only compress if it's an image and larger than 0.5MB or HEIC
            const isHEIC = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')
            let finalFile = file

            if (file.size > 0.5 * 1024 * 1024 || isHEIC) {
                finalFile = await compressImage(file)
            }

            processedFiles.push(finalFile)
            previews.push(URL.createObjectURL(finalFile))
        }

        const newFiles = [...localFiles, ...processedFiles].slice(0, maxFiles)
        setLocalFiles(newFiles)
        setIsCompressing(false)

        if (onFilesSelected) {
            onFilesSelected(newFiles)
        }

        if (maxFiles === 1 && autoUpload) {
            // Personal/Profile mode: Auto upload
            setIsUploading(true)
            try {
                const formData = new FormData()
                formData.append('files', processedFiles[0])
                const result = await uploadImageAction(formData, bucketName, 'avatars')
                if (result.success && result.urls) {
                    onChange(result.urls[0])
                }
            } catch (error) {
                console.error('Auto-upload failed:', error)
            } finally {
                setIsUploading(false)
            }
        } else {
            // Standard/Deferred mode
            const newUrls = [...urlsValue, ...previews].slice(0, maxFiles)
            onChange(newUrls)
        }
    }

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif']
        },
        maxFiles: maxFiles - urlsValue.length,
        disabled: disabled || urlsValue.length >= maxFiles || isUploading || isCompressing
    })

    const removeImage = (urlToRemove: string, index: number) => {
        if (urlToRemove.startsWith('blob:')) {
            URL.revokeObjectURL(urlToRemove)

            // Find which local file this corresponds to. 
            // Existing URLs are at the start, followed by blob previews for local files.
            const existingUrlsCount = urlsValue.length - localFiles.length
            const localFileIndex = index - existingUrlsCount

            if (localFileIndex >= 0) {
                const newFiles = localFiles.filter((_, i) => i !== localFileIndex)
                setLocalFiles(newFiles)
                if (onFilesSelected) {
                    onFilesSelected(newFiles)
                }
            }
        }

        const newValue = urlsValue.filter((_, i: number) => i !== index)
        onChange(Array.isArray(value) ? newValue : (newValue[0] || ''))
    }

    const getDisplayUrl = (url: string) => {
        return url
    }

    if (!mounted) return null

    return (
        <div className="space-y-4">
            {/* Image Grid */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 ${urlsValue.length > 0 ? 'mb-4' : ''}`}>
                {urlsValue.map((url, index) => (
                    <div key={url + index} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted group">
                        <img
                            src={getDisplayUrl(url)}
                            alt="Preview"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(url, index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed hover:bg-red-600"
                            disabled={disabled}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Dropzone */}
            {urlsValue.length < maxFiles && (
                <div
                    {...getRootProps()}
                    className={`
                        border-2 border-dashed rounded-xl p-8 
                        flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all
                        ${(disabled || isUploading) ? 'opacity-50 cursor-not-allowed' : 'border-border bg-card hover:border-primary hover:bg-primary/5'}
                    `}
                >
                    <input {...getInputProps()} />
                    <div className="p-4 bg-muted rounded-full text-muted-foreground">
                        {isUploading ? <Loader2 size={28} className="animate-spin" /> : <ImageIcon size={28} />}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                            {isUploading ? 'جاري الرفع...' : 'اضغط للرفع أو اسحب الصور هنا'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            (JPG, PNG, WebP)
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
