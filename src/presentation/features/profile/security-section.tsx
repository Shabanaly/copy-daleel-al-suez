'use client'

import { useState } from 'react'
import { Lock, Key, Loader2 } from 'lucide-react'

interface SecuritySectionProps {
    isOAuthUser: boolean
}

export function SecuritySection({ isOAuthUser }: SecuritySectionProps) {
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            alert('كلمات المرور غير متطابقة')
            return
        }

        if (newPassword.length < 6) {
            alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
            return
        }

        setLoading(true)
        try {
            const { updatePassword } = await import('@/actions/profile.actions')
            await updatePassword({ currentPassword, newPassword })

            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setIsChangingPassword(false)
            alert('تم تغيير كلمة المرور بنجاح')
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : 'فشل تغيير كلمة المرور')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold mb-4">إعدادات الأمان</h3>

                {isOAuthUser ? (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Lock className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
                            <div>
                                <p className="font-medium text-blue-900 dark:text-blue-100">تسجيل الدخول عبر Google</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    أنت تستخدم حساب Google للدخول. لا يمكنك تغيير كلمة المرور من هنا.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {!isChangingPassword ? (
                            <button
                                onClick={() => setIsChangingPassword(true)}
                                className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
                            >
                                <Key size={18} />
                                تغيير كلمة المرور
                            </button>
                        ) : (
                            <form onSubmit={handlePasswordChange} className="space-y-4 p-4 border border-border rounded-xl">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">كلمة المرور الحالية</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5">كلمة المرور الجديدة</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5">تأكيد كلمة المرور</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsChangingPassword(false)
                                            setCurrentPassword('')
                                            setNewPassword('')
                                            setConfirmPassword('')
                                        }}
                                        className="flex-1 px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors font-medium"
                                        disabled={loading}
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
                                        disabled={loading}
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        حفظ
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
