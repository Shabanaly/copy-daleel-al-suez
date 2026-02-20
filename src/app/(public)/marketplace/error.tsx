'use client';

import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function MarketplaceError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-destructive" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">حدث خطأ غير متوقع</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                    عذراً، حدثت مشكلة أثناء تحميل سوق السويس. جرب مرة تانية.
                </p>
                {process.env.NODE_ENV === 'development' && error?.message && (
                    <pre className="text-xs text-start bg-muted p-3 rounded-lg mb-6 overflow-auto max-h-32 text-destructive" dir="ltr">
                        {error.message}
                    </pre>
                )}
                <button
                    onClick={() => reset()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors font-medium shadow-sm"
                >
                    <RotateCcw size={16} />
                    <span>حاول مرة أخرى</span>
                </button>
            </div>
        </div>
    );
}
