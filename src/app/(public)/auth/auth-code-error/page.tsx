import Link from 'next/link'
import { AlertCircle, ArrowRight, Home } from 'lucide-react'

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="max-w-md w-full text-center space-y-8 p-8 border border-border rounded-2xl bg-card shadow-sm">
                <div className="flex justify-center">
                    <div className="p-4 bg-red-50 rounded-full">
                        <AlertCircle className="w-12 h-12 text-red-600" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-foreground">عذراً، حدث خطأ في المصادقة</h1>
                    <p className="text-muted-foreground leading-relaxed">
                        يبدو أن الرابط المستخدم غير صالح أو انتهت صلاحيته. يرجى محاولة تسجيل الدخول مرة أخرى.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/login"
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowRight size={18} />
                        العودة لتسجيل الدخول
                    </Link>
                    <Link
                        href="/"
                        className="w-full border border-input py-3 rounded-xl font-medium hover:bg-muted transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={18} />
                        الرجوع للرئيسية
                    </Link>
                </div>

                <p className="text-xs text-muted-foreground">
                    إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني.
                </p>
            </div>
        </div>
    )
}
