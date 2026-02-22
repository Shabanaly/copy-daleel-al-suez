'use client'

import { useState } from 'react'
import { Shield, Lock, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { updatePassword } from '@/actions/profile.actions'
import { toast } from 'sonner'
import { User as SupabaseUser } from '@supabase/supabase-js'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/presentation/ui/dialog"

interface SecuritySettingsProps {
    user: SupabaseUser
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('كلمات المرور الجديدة غير متطابقة')
            return
        }
        if (newPassword.length < 6) {
            toast.error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
            return
        }

        setIsUpdating(true)
        try {
            const result = await updatePassword({
                currentPassword,
                newPassword
            })
            if (result.success) {
                toast.success('تم تحديث كلمة المرور بنجاح')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            }
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ أثناء التحديث')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        // Implementation for account deletion would go here
        toast.error('هذه الميزة غير متاحة حالياً، يرجى التواصل مع الدعم')
        setIsDeleting(false)
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="space-y-1">
                <h2 className="text-2xl font-bold">الأمان والخصوصية</h2>
                <p className="text-muted-foreground text-sm">تحكم في كلمات المرور وجلسات الدخول الخاصة بك</p>
            </header>

            <div className="space-y-8">
                {/* Change Password Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Lock size={18} className="text-primary" />
                        <h3 className="text-lg font-bold">تغيير كلمة المرور</h3>
                    </div>
                    <div className="bg-muted/30 p-6 md:p-8 rounded-3xl border border-border/50 grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold opacity-80 px-1">كلمة المرور الحالية</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-border bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold opacity-80 px-1">كلمة المرور الجديدة</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold opacity-80 px-1">تأكيد كلمة المرور الجديدة</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={handleUpdatePassword}
                                disabled={isUpdating || !currentPassword || !newPassword}
                                className="px-8 py-3 bg-secondary text-secondary-foreground rounded-2xl font-bold shadow-lg hover:shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {isUpdating ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        جاري التحديث...
                                    </div>
                                ) : 'تحديث كلمة المرور'}
                            </button>
                        </div>
                    </div>
                </section>

                <hr className="border-border/50" />

                {/* Danger Zone */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <AlertCircle size={18} className="text-red-500" />
                        <h3 className="text-lg font-bold text-red-500">منطقة الخطر</h3>
                    </div>
                    <div className="p-6 md:p-8 bg-red-500/5 rounded-3xl border border-red-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h4 className="font-bold text-red-600 dark:text-red-400">حذف الحساب نهائياً</h4>
                            <p className="text-sm text-red-500/70 leading-relaxed max-w-xl">
                                بمجرد حذف حسابك، سيتم حذف جميع بياناتك، اشتراكاتك، وأنشطتك نهائياً من دليل السويس. لا يمكن التراجع عن هذا الإجراء أبداً.
                            </p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] active:scale-95 transition-all">
                                    <Trash2 size={18} />
                                    حذف الحساب
                                </button>
                            </DialogTrigger>
                            <DialogContent dir="rtl">
                                <DialogHeader>
                                    <DialogTitle>هل أنت متأكد من حذف الحساب؟</DialogTitle>
                                    <DialogDescription>
                                        هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم مسح كافة البيانات المرتبطة بحسابك فوراً.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-3 sm:gap-0 mt-4">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                        className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isDeleting && <Loader2 size={16} className="animate-spin" />}
                                        تأكيد الحذف النهائي
                                    </button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </section>
            </div>
        </div>
    )
}
