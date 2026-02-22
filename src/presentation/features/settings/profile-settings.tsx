'use client'

import { useState } from 'react'
import { User, Mail, Phone, MapPin, Loader2 } from 'lucide-react'
import { updateProfile } from '@/actions/profile.actions'
import { toast } from 'sonner'
import SupabaseImageUpload from '@/presentation/components/ui/supabase-image-upload'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { uploadImageAction } from '@/app/actions/upload-image-action'

interface ProfileSettingsProps {
    user: SupabaseUser
    profile: any
}

export function ProfileSettings({ user, profile }: ProfileSettingsProps) {
    const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
    const [phone, setPhone] = useState(user.user_metadata?.phone || '')
    const [isUpdating, setIsUpdating] = useState(false)
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string>(user.user_metadata?.avatar_url || '')

    const handleUpdate = async () => {
        setIsUpdating(true)
        try {
            let avatarUrl = user.user_metadata?.avatar_url

            if (pendingFile) {
                const formData = new FormData()
                formData.append('files', pendingFile)
                const uploadResult = await uploadImageAction(formData, 'avatars', user.id)
                if (uploadResult.success && uploadResult.urls) {
                    avatarUrl = uploadResult.urls[0]
                } else {
                    throw new Error(uploadResult.error || 'فشل رفع الصورة')
                }
            }

            const result = await updateProfile({
                fullName,
                phone,
                avatarUrl
            })
            if (result.success) {
                toast.success('تم تحديث الملف الشخصي بنجاح')
                setPendingFile(null)
            }
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء التحديث')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="space-y-1">
                <h2 className="text-2xl font-bold">الملف الشخصي</h2>
                <p className="text-muted-foreground text-sm">أدر معلوماتك الشخصية وكيف يراك الآخرون</p>
            </header>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-muted/30 rounded-3xl border border-border/50">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl overflow-hidden ring-4 ring-background">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                (fullName[0] || user.email?.[0] || 'U').toUpperCase()
                            )}
                        </div>
                    </div>
                    <div className="space-y-3 flex-1 w-full">
                        <div className="w-full max-w-xs">
                            <SupabaseImageUpload
                                value={avatarPreview}
                                onChange={(url) => {
                                    const imageUrl = Array.isArray(url) ? url[0] : url
                                    setAvatarPreview(imageUrl)
                                }}
                                onFilesSelected={(files) => {
                                    if (files.length > 0) {
                                        setPendingFile(files[0])
                                    }
                                }}
                                bucketName="avatars"
                                maxFiles={1}
                                autoUpload={false}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">يفضل استخدام صورة مربعة واضحة بجودة عالية.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2 px-1">
                            <User size={14} className="text-primary" />
                            الاسم بالكامل
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-border bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                            placeholder="أدخل اسمك بالكامل"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2 px-1">
                            <Mail size={14} className="text-primary" />
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            defaultValue={user.email}
                            className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/50 cursor-not-allowed outline-none"
                            readOnly
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold flex items-center gap-2 px-1">
                            <Phone size={14} className="text-primary" />
                            رقم الهاتف
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="01xxxxxxxxx"
                            className="w-full px-4 py-3 rounded-2xl border border-border bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-left"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                    {isUpdating ? (
                        <div className="flex items-center gap-2 justify-center">
                            <Loader2 size={18} className="animate-spin" />
                            جاري الحفظ...
                        </div>
                    ) : 'حفظ التغييرات'}
                </button>
            </div>
        </div>
    )
}
