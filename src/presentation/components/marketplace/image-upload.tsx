'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

interface ImageUploadProps {
    value: File[];
    onChange: (files: File[]) => void;
    maxFiles?: number;
    error?: string;
}

export function ImageUpload({ value, onChange, maxFiles = 5, error }: ImageUploadProps) {
    const [processing, setProcessing] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (value.length + acceptedFiles.length > maxFiles) {
            toast.error(`يمكنك رفع بحد أقصى ${maxFiles} صور فقط`);
            return;
        }

        setProcessing(true);
        const compressedFiles: File[] = [];

        try {
            for (const file of acceptedFiles) {
                if (file.type.startsWith('image/')) {
                    const options = {
                        maxSizeMB: 0.5, // 500KB max size to save storage
                        maxWidthOrHeight: 1280, // Reasonable resolution for web
                        useWebWorker: true
                    };
                    const compressedFile = await imageCompression(file, options);
                    compressedFiles.push(compressedFile);
                }
            }
            onChange([...value, ...compressedFiles]);
        } catch (error) {
            console.error('Error compressing images:', error);
            toast.error('حدث خطأ أثناء معالجة الصور');
        } finally {
            setProcessing(false);
        }
    }, [value, onChange, maxFiles]);

    const removeImage = (index: number) => {
        const newFiles = [...value];
        newFiles.splice(index, 1);
        onChange(newFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        disabled: processing || value.length >= maxFiles
    });

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium mb-1 text-foreground">صور الإعلان ({value.length}/{maxFiles})</label>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {/* Preview Images */}
                {value.map((file, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                        <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {/* Dropzone */}
                {value.length < maxFiles && (
                    <div
                        {...getRootProps()}
                        className={`
                            aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
                            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary hover:bg-muted'}
                            ${error ? 'border-red-500' : ''}
                        `}
                    >
                        <input {...getInputProps()} />
                        {processing ? (
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        ) : (
                            <>
                                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                <span className="text-xs text-center text-muted-foreground px-2">
                                    {isDragActive ? 'أفلت الصور هنا' : 'اضغط أو اسحب الصور'}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}
