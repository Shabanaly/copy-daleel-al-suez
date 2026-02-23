import { SupabaseMarketplaceRepository } from '@/data/repositories/supabase-marketplace.repository';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Clock, Shield, ArrowRight } from 'lucide-react';
import { MarketplaceImageGallery } from '@/presentation/features/marketplace/components/marketplace-image-gallery';
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms';
import { ViewTracker } from '@/presentation/components/shared/view-tracker';
import { MarketplaceItemDetails } from '@/presentation/components/marketplace/marketplace-item-details';
import { RelatedItems } from '@/presentation/components/marketplace/related-items';
import { FavoriteButton } from '@/presentation/features/places/components/favorite-button';
import { createReadOnlyClient } from '@/lib/supabase/server';
import { MarketplaceSellerActions } from '@/presentation/components/marketplace/marketplace-seller-actions';
import { MarketplaceReportAction } from '@/presentation/components/marketplace/marketplace-report-action';
import { ItemViewTracker } from '@/presentation/components/marketplace/item-view-tracker';
import type { Metadata } from 'next';
import { getCachedMarketplaceItem, getCachedMarketplaceItems } from '@/actions/marketplace.actions';
import { getItemPromotionsAction } from '@/actions/flash-deals.actions';

export const revalidate = 120; // ISR: إعادة التحقق كل دقيقتين

// ========== SEO Metadata ==========

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const item = await getCachedMarketplaceItem(slug);

    if (!item) {
        return {
            title: 'الإعلان غير موجود | سوق السويس',
            description: 'هذا الإعلان غير متاح حالياً.',
        };
    }

    const categoryLabel = MARKETPLACE_FORMS[item.category]?.label || item.category;
    const description = item.description?.substring(0, 155) || `${item.title} - ${categoryLabel} في السويس`;

    return {
        title: `${item.title} | سوق السويس`,
        description,
        openGraph: {
            title: `${item.title} — ${item.price.toLocaleString('ar-EG')} ج.م`,
            description,
            images: item.images?.[0] ? [item.images[0]] : [],
            type: 'website',
            locale: 'ar_EG',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${item.title} — ${item.price.toLocaleString('ar-EG')} ج.م`,
            description,
            images: item.images?.[0] ? [item.images[0]] : [],
        },
    };
}

// ========== Page ==========

export default async function MarketplaceItemPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const item = await getCachedMarketplaceItem(slug);

    if (!item) {
        notFound();
    }

    // Fetch related items and promotions in parallel
    const [{ items: relatedItems }, promotions] = await Promise.all([
        getCachedMarketplaceItems(
            { category: item.category as any },
            5,
            0
        ),
        getItemPromotionsAction(item.id)
    ]);
    const filteredRelated = relatedItems.filter(r => r.id !== item.id).slice(0, 4);

    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " سنة";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " شهر";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " يوم";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " ساعة";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " دقيقة";
        return "الآن";
    };

    return (
        <div className="min-h-screen bg-background" dir="rtl">
            <ViewTracker tableName="marketplace_items" id={item.id} categoryId={item.category} />
            <ItemViewTracker categoryId={item.category} attributes={item.attributes || {}} />

            {/* Immersive Gallery Header */}
            <div className="relative w-full">
                {/* Back Button Overlay */}
                <div className="absolute top-4 md:top-8 right-4 md:right-8 z-20">
                    <Link
                        href="/marketplace"
                        className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-md hover:bg-background border border-border shadow-lg rounded-full text-foreground transition-all group"
                    >
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        <span className="font-bold text-sm">العودة للسوق</span>
                    </Link>
                </div>

                <div className="max-w-7xl mx-auto px-0 md:px-4">
                    <MarketplaceImageGallery images={item.images || []} title={item.title} />
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Right Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description & Specs */}
                        <MarketplaceItemDetails item={item} promotions={promotions} />
                    </div>

                    {/* Left Column: Price & Seller Info */}
                    <div className="space-y-6">
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h1 className="text-2xl font-bold text-foreground leading-tight">{item.title}</h1>
                                <FavoriteButton id={item.id} type="ad" size={24} className="bg-muted hover:bg-muted/80" />
                            </div>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-bold text-primary">
                                    {item.price.toLocaleString()} ج.م
                                </span>
                                {item.price_type === 'negotiable' && (
                                    <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-lg font-bold border border-secondary/20">
                                        قابل للتفاوض
                                    </span>
                                )}
                                {item.price_type === 'contact' && (
                                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-lg font-bold border border-border">
                                        اتصل للسعر
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center text-muted-foreground text-sm mb-6">
                                <MapPin className="w-4 h-4 ml-1" />
                                {item.location || 'السويس'}
                                <span className="mx-2">•</span>
                                <Clock className="w-4 h-4 ml-1" />
                                منذ {timeAgo(item.created_at)}
                                <span className="mx-2">•</span>
                                {item.viewCount || 0} مشاهدة
                            </div>

                            {/* Seller Info Card */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border mb-6">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-background border border-border shrink-0">
                                    {item.seller_avatar ? (
                                        <img
                                            src={item.seller_avatar}
                                            alt={item.seller_name || 'Seller'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-foreground text-sm truncate">{item.seller_name || 'مستخدم السويس'}</h3>
                                    <Link
                                        href={`/marketplace/seller/${item.seller_id}`}
                                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                                    >
                                        عرض الملف الشخصي
                                        <ArrowRight className="w-3 h-3 rotate-180" />
                                    </Link>
                                </div>
                            </div>

                            <MarketplaceSellerActions item={item as any} />
                        </div>

                        {/* Safety Tips */}
                        <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                            <div className="flex items-center gap-2 text-primary font-bold mb-3">
                                <Shield className="w-5 h-5" />
                                نصائح للأمان
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside mb-4">
                                <li>قابِل البائع في مكان عام ومكشوف.</li>
                                <li>افحص المنتج جيداً قبل الشراء.</li>
                                <li>لا تدفع أي مبالغ قبل الاستلام.</li>
                            </ul>

                            <MarketplaceReportAction itemId={item.id} sellerId={item.seller_id} />
                        </div>
                    </div>
                </div>

                {/* Related Items */}
                <RelatedItems items={filteredRelated} />
            </div>
        </div>
    );
}
