'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, Mail, ArrowRight } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)

    const supabase = createClient()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/callback?next=/profile/reset-password`,
            })

            if (error) throw error

            setMessage({
                text: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.',
                type: 'success'
            })
        } catch (error) {
            setMessage({ text: error instanceof Error ? error.message : 'حدث خطأ', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <div className="w-full max-w-md bg-card rounded-3xl shadow-xl overflow-hidden border border-border">
                <div className="p-8">
                    {/* Back to Home */}
                    <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                        <ArrowRight size={16} className="ml-2" />
                        الرجوع لتسجيل الدخول
                    </Link>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-foreground">استعادة كلمة المرور</h1>
                        <p className="text-muted-foreground mt-2">
                            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
                        </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">البريد الإلكتروني</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 pr-10 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="name@example.com"
                                />
                                <Mail className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5 pointer-events-none" />
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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إرسال الرابط'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
