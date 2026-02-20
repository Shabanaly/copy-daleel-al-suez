'use client'

import React, { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Plus, X, Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { uploadImageAction } from '@/app/actions/upload-image-action'

interface ImageUploadProps {
    value?: string | string[] // Support single or multiple
    onChange: (urls: string | string[]) => void
    onFilesSelected?: (files: File[]) => void
    disabled?: boolean
    maxFiles?: number
    bucketName?: string
}

export default function SupabaseImageUpload({
    value = [],
    onChange,
    onFilesSelected,
    disabled,
    maxFiles = 5,
    bucketName = 'places'
}: ImageUploadProps) {
    const urlsValue = Array.isArray(value) ? value : (value ? [value] : [])
    const [mounted, setMounted] = useState(false)
    const [localFiles, setLocalFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => {
            urlsValue.forEach(url => {
                if (url.startsWith('blob:')) URL.revokeObjectURL(url)
            })
        }
    }, [])

    const onDrop = async (acceptedFiles: File[]) => {
        const newFiles = [...localFiles, ...acceptedFiles].slice(0, maxFiles)
        setLocalFiles(newFiles)

        if (onFilesSelected) {
            onFilesSelected(newFiles)
        }

        if (maxFiles === 1) {
            // Personal/Profile mode: Auto upload
            setIsUploading(true)
            try {
                const formData = new FormData()
                formData.append('files', acceptedFiles[0])
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
            const previews = acceptedFiles.map(file => URL.createObjectURL(file))
            const newUrls = [...urlsValue, ...previews].slice(0, maxFiles)
            onChange(newUrls)
        }
    }

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: maxFiles - urlsValue.length,
        disabled: disabled || urlsValue.length >= maxFiles || isUploading
    })

    const removeImage = (urlToRemove: string, index: number) => {
        if (urlToRemove.startsWith('blob:')) {
            URL.revokeObjectURL(urlToRemove)
        }

        const newValue = urlsValue.filter((_, i) => i !== index)
        const newFiles = localFiles.filter((_, i) => i !== index)

        setLocalFiles(newFiles)
        onChange(Array.isArray(value) ? newValue : (newValue[0] || ''))
        if (onFilesSelected) {
            onFilesSelected(newFiles)
        }
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
