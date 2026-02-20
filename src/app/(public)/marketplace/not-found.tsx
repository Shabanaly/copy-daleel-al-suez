import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';

export default function MarketplaceNotFound() {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
                <div className="text-7xl mb-6 opacity-60">🔍</div>
                <h2 className="text-2xl font-bold text-foreground mb-3">الصفحة مش موجودة</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                    الإعلان اللي بتدور عليه ممكن يكون اتحذف أو الرابط غلط.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/marketplace"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors font-medium shadow-sm"
                    >
                        <ArrowRight size={16} />
                        <span>تصفح سوق السويس</span>
                    </Link>
                    <Link
                        href="/marketplace/search"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-muted text-foreground hover:bg-accent transition-colors font-medium"
                    >
                        <Search size={16} />
                        <span>ابحث عن إعلان</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
