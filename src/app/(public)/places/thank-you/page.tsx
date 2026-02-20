import Link from 'next/link'
import { CheckCircle, Home, PlusCircle } from 'lucide-react'

export default function ThankYouPage() {
    return (
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="text-green-500 w-10 h-10" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">شكراً لك! تم استلام طلبك</h1>
            <p className="text-slate-400 max-w-md mx-auto mb-8 text-lg">
                تم إرسال بيانات المكان للمراجعة بنجاح. سنقوم بالتحقق من البيانات والموافقة على النشر في أقرب وقت ممكن.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/"
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                    <Home size={20} />
                    العودة للرئيسية
                </Link>
                <Link
                    href="/places/new"
                    className="bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                    <PlusCircle size={20} />
                    إضافة مكان آخر
                </Link>
            </div>
        </div>
    )
}
