'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Lock, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)
    const [validSession, setValidSession] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // If no session, they might have clicked a bad link or it expired.
                // However, the auth/callback should have established the session.
                setMessage({ text: 'رابط غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.', type: 'error' })
            } else {
                setValidSession(true)
            }
            setCheckingSession(false)
        }
        checkSession()
    }, [supabase])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setMessage({ text: 'كلمات المرور غير متطابقة', type: 'error' })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setMessage({
                text: 'تم تحديث كلمة المرور بنجاح! سيتم توجيهك لصفحة تسجيل الدخول.',
                type: 'success'
            })

            setTimeout(() => {
                router.push('/login')
            }, 3000)

        } catch (error) {
            setMessage({ text: error instanceof Error ? error.message : 'حدث خطأ', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!validSession) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-card p-8 rounded-3xl shadow-xl text-center">
                    <p className="text-red-500 mb-4">جلسة غير صالحة</p>
                    <Link href="/forgot-password" className="text-primary hover:underline">
                        طلب رابط استعادة جديد
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <div className="w-full max-w-md bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
                <div className="p-8">
                    {/* Back to Home */}
                    <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                        <ArrowRight size={16} className="ml-2" />
                        الرجوع للرئيسية
                    </Link>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-foreground">تعيين كلمة مرور جديدة</h1>
                        <p className="text-muted-foreground mt-2">
                            الرجاء إدخال كلمة المرور الجديدة لحسابك
                        </p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">كلمة المرور الجديدة</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 pr-10 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">تأكيد كلمة المرور</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 pr-10 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                {message.type === 'error' ? '⚠️' : '✅'}
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تحديث كلمة المرور'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
