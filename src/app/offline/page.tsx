import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
            <div className="text-center max-w-md">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-muted rounded-full">
                        <WifiOff size={64} className="text-muted-foreground" />
                    </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">لا يوجد اتصال بالإنترنت</h1>
                <p className="text-muted-foreground mb-8 text-lg">
                    عذراً، يبدو أنك غير متصل بالإنترنت. بعض الميزات قد لا تعمل بشكل كامل.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                >
                    العودة للصفحة الرئيسية
                </Link>
            </div>
        </div>
    )
}
