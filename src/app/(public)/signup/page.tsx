'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, Lock, User, ArrowRight, Compass } from 'lucide-react'

export default function SignUpPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                },
            })

            if (error) throw error

            setMessage({
                text: 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.',
                type: 'success'
            })

            // Optional: Redirect to login after a delay
            setTimeout(() => {
                router.push('/login')
            }, 3000)

        } catch (error) {
            setMessage({ text: error instanceof Error ? error.message : 'حدث خطأ', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-row-reverse">
            {/* Left Side - Form (Right in RTL) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {/* Back to Home */}
                    <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
                        <ArrowRight size={16} className="ml-2" />
                        الرجوع للرئيسية
                    </Link>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mb-2">
                            إنشاء حساب جديد
                        </h1>
                        <p className="text-muted-foreground">
                            انضم إلينا واستمتع بتجربة كاملة في دليل السويس
                        </p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">الاسم الكامل</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 pr-10 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="الاسم الثنائي"
                                />
                                <User className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">كلمة المرور</label>
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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء الحساب'}
                        </button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        لديك حساب بالفعل؟{' '}
                        <Link href="/login" className="font-bold text-primary hover:underline">
                            سجل الدخول
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Banner (Hidden on Mobile) */}
            <div className="hidden lg:block w-1/2 relative bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-bl from-primary/40 to-blue-900/60 mix-blend-multiply z-10" />
                {/* Fallback pattern or generic image if no specific image is available */}
                <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center" />

                <div className="relative z-20 h-full flex flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-4" dir="ltr">
                        <Compass className="w-6 h-6 text-white" />
                        <span className="text-2xl font-bold">دليل السويس</span>
                    </div>

                    <div className="max-w-md">
                        <h2 className="text-4xl font-bold mb-6 leading-tight">
                            ابدأ رحلتك معنا اليوم
                        </h2>
                        <ul className="space-y-4 text-lg text-white/90">
                            <li className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</div>
                                <span>احفظ أماكنك المفضلة</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</div>
                                <span>شارك تقييماتك وتجاربك</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</div>
                                <span>تعرف على أحدث الفعاليات</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>© 2024 دليل السويس</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
