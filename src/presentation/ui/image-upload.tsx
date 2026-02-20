'use client'

import React, { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Plus, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
    value?: string[]
    onChange: (urls: string[]) => void
    disabled?: boolean
    maxFiles?: number
}

// NOTE: In production, you'd typically use signed uploads or a server action to get a signature.
// For MVP/Demo, unsigned uploads are simpler but less secure. 
// We'll rely on a public unsigned preset name which needs to be added to ENV.
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'daleel_unsigned'
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

export default function ImageUpload({ value = [], onChange, disabled, maxFiles = 5 }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const onDrop = async (acceptedFiles: File[]) => {
        if (!CLOUDINARY_CLOUD_NAME) {
            alert("Cloudinary Cloud Name is missing in ENV")
            return
        }

        setIsUploading(true)
        const newUrls: string[] = []

        try {
            // Dynamic import to avoid SSR issues
            const imageCompression = (await import('browser-image-compression')).default

            const options = {
                maxSizeMB: 1, // Max size 1MB
                maxWidthOrHeight: 1920, // Max dimension
                useWebWorker: true,
                fileType: 'image/webp' // Force conversion to WebP
            }

            for (const file of acceptedFiles) {
                // Compress & Convert
                const compressedFile = await imageCompression(file, options)

                // Create a new file with .webp extension if needed
                const newFileName = file.name.replace(/\.[^.]+$/, "") + ".webp"
                const finalFile = new File([compressedFile], newFileName, { type: 'image/webp' })

                const formData = new FormData()
                formData.append('file', finalFile)
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData
                    }
                )

                if (!response.ok) throw new Error('Upload failed')

                const data = await response.json()
                newUrls.push(data.secure_url)
            }

            // Append new URLs to existing ones
            onChange([...value, ...newUrls])
        } catch (error) {
            console.error(error)
            alert("Failed to upload image")
        } finally {
            setIsUploading(false)
        }
    }

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: maxFiles - value.length,
        disabled: disabled || isUploading || value.length >= maxFiles
    })

    const removeImage = (urlToRemove: string) => {
        onChange(value.filter((url) => url !== urlToRemove))
    }

    if (!mounted) return null

    return (
        <div className="space-y-4">
            {/* Image Grid */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 ${value.length > 0 ? 'mb-4' : ''}`}>
                {value.map((url) => (
                    <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
                        <Image
                            src={url}
                            alt="Uploaded"
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                            disabled={disabled}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Dropzone */}
            {value.length < maxFiles && (
                <div
                    {...getRootProps()}
                    className={`
                        border-2 border-dashed rounded-xl p-8 
                        flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-colors
                        ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'border-slate-700 bg-slate-900/50'}
                    `}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="text-sm text-slate-400">جاري الرفع...</span>
                        </div>
                    ) : (
                        <>
                            <div className="p-3 bg-slate-800 rounded-full text-slate-400">
                                <Plus size={24} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-300">
                                    اضغط للرفع أو اسحب الصور هنا
                                </p>
                                <p className="text-xs text-slate-500">
                                    الحد الأقصى {maxFiles} صور (JPG, PNG, WebP)
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
