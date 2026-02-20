import Link from 'next/link';
import { CheckCircle2, Eye, Plus, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SuccessPageProps {
    searchParams: Promise<{ slug?: string; status?: string }>;
}

export default async function MarketplaceSuccessPage({ searchParams }: SuccessPageProps) {
    const params = await searchParams;
    const slug = params.slug;
    const status = params.status || 'pending';
    const isPending = status === 'pending';

    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-lg mx-auto">
                {/* Success Animation */}
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle2 className="text-green-600" size={44} />
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-3">
                    {isPending ? 'تم استلام إعلانك بنجاح! ⏳' : 'تم نشر إعلانك بنجاح! 🎉'}
                </h1>
                <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                    {isPending
                        ? 'إعلانك قيد المراجعة حالياً من قبل الإدارة. هيظهر في السوق بمجرد التأكد من مطابقتة للشروط.'
                        : 'إعلانك متاح الآن في سوق السويس. هيظهر لكل المستخدمين في القسم المناسب.'
                    }
                </p>

                {/* Tips */}
                <div className="bg-card rounded-xl border border-border p-5 mb-8 text-start">
                    <h3 className="font-bold text-foreground mb-3 text-sm">💡 خطوات تالية:</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                        {isPending ? (
                            <>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary font-bold mt-0.5">•</span>
                                    <span>فريقنا هيراجع الإعلان خلال 24 ساعة بأقصى حد.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary font-bold mt-0.5">•</span>
                                    <span>هيوصلك إشعار أول ما الإعلان يتوافق عليه.</span>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary font-bold mt-0.5">•</span>
                                    <span>تقدر تشارك إعلانك على فيسبوك وواتساب لزيادة المشاهدات.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary font-bold mt-0.5">•</span>
                                    <span>تابع الإحصائيات وعدد المشاهدات من لوحة التحكم.</span>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {slug && (
                        <Link
                            href={isPending ? '/marketplace/my-items' : `/marketplace/${slug}`}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors font-medium shadow-sm"
                        >
                            <Eye size={18} />
                            <span>{isPending ? 'عرض إعلاناتي' : 'شوف إعلانك'}</span>
                        </Link>
                    )}
                    <Link
                        href="/marketplace/new"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-foreground hover:bg-accent transition-colors font-medium"
                    >
                        <Plus size={18} />
                        <span>أضف إعلان جديد</span>
                    </Link>
                    <Link
                        href="/marketplace"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-foreground hover:bg-accent transition-colors font-medium"
                    >
                        <ArrowRight size={18} />
                        <span>تصفح السوق</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
