'use client'

import { useState } from 'react'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { sendDeleteAccountCode, deleteAccountPermanently } from '../../../actions/profile-security.actions'


interface DangerZoneProps {
    isOAuthUser: boolean
}

export function DangerZone({ isOAuthUser }: DangerZoneProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteStep, setDeleteStep] = useState<'confirm' | 'verify'>('confirm')
    const [confirmText, setConfirmText] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleDeleteRequest = async () => {
        if (confirmText !== 'حذف حسابي') {
            alert('يرجى كتابة "حذف حسابي" للتأكيد')
            return
        }

        setLoading(true)
        try {
            if (isOAuthUser) {
                // Send verification code to email
                const result = await sendDeleteAccountCode()
                setDeleteStep('verify')

                // In development, show the code directly
                if (result.code) {
                    alert(`رمز التحقق (للتطوير فقط): ${result.code}\n\nتم إرسال رمز التحقق إلى بريدك الإلكتروني`)
                } else {
                    alert('تم إرسال رمز التحقق إلى بريدك الإلكتروني')
                }
            } else {
                // Move to password verification
                setDeleteStep('verify')
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : 'حدث خطأ')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteConfirm = async () => {
        setLoading(true)
        try {
            if (isOAuthUser) {
                await deleteAccountPermanently({ code: verificationCode })
            } else {
                await deleteAccountPermanently({ password })
            }

            // Account deleted, redirect to home
            window.location.href = '/'
        } catch (error) {
            alert(error instanceof Error ? error.message : 'فشل حذف الحساب')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="p-4 bg-red-100/50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="text-red-700 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                        <h3 className="font-bold text-red-950 dark:text-red-500 mb-2">منطقة الخطر</h3>
                        <p className="text-sm text-red-900 dark:text-red-500 leading-relaxed font-semibold">
                            الإجراءات التالية لا يمكن التراجع عنها. يرجى التأكد قبل المتابعة.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-sm"
                    >
                        <Trash2 size={18} />
                        حذف الحساب نهائياً
                    </button>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
                            </div>
                            <h2 className="text-xl font-bold">حذف الحساب نهائياً</h2>
                        </div>

                        {deleteStep === 'confirm' ? (
                            <>
                                <div className="mb-6 space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        ⚠️ سيتم حذف جميع بياناتك بشكل نهائي:
                                    </p>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                        <li>جميع المراجعات التي كتبتها</li>
                                        <li>قائمة المفضلات</li>
                                        <li>الإشعارات</li>
                                        <li>معلومات الحساب</li>
                                    </ul>
                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                        هذا الإجراء لا يمكن التراجع عنه!
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">
                                        اكتب &quot;حذف حسابي&quot; للتأكيد:
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={e => setConfirmText(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                        placeholder="حذف حسابي"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false)
                                            setConfirmText('')
                                            setDeleteStep('confirm')
                                        }}
                                        className="flex-1 px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors font-medium"
                                        disabled={loading}
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={handleDeleteRequest}
                                        className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                                        disabled={loading || confirmText !== 'حذف حسابي'}
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        متابعة
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-6">
                                    {isOAuthUser ? (
                                        <>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                تم إرسال رمز التحقق إلى بريدك الإلكتروني. أدخل الرمز للمتابعة:
                                            </p>
                                            <input
                                                type="text"
                                                value={verificationCode}
                                                onChange={e => setVerificationCode(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-center text-2xl tracking-widest"
                                                placeholder="000000"
                                                maxLength={6}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                أدخل كلمة المرور للتأكيد:
                                            </p>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                                placeholder="كلمة المرور"
                                            />
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setDeleteStep('confirm')
                                            setVerificationCode('')
                                            setPassword('')
                                        }}
                                        className="flex-1 px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors font-medium"
                                        disabled={loading}
                                    >
                                        رجوع
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                                        disabled={loading || (isOAuthUser ? verificationCode.length !== 6 : !password)}
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        حذف الحساب
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
