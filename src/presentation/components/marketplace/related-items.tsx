import Link from 'next/link';
import Image from 'next/image';
import { MarketplaceItem } from '@/domain/entities/marketplace-item';
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms';

interface RelatedItemsProps {
    items: MarketplaceItem[];
}

export function RelatedItems({ items }: RelatedItemsProps) {
    if (items.length === 0) return null;

    return (
        <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">إعلانات مشابهة</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(item => {
                    const firstImage = item.images?.[0];
                    const categoryLabel = MARKETPLACE_FORMS[item.category]?.label || item.category;

                    return (
                        <Link
                            key={item.id}
                            href={`/marketplace/${item.slug || item.id}`}
                            className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Image */}
                            <div className="relative aspect-square bg-muted">
                                {firstImage ? (
                                    <Image
                                        src={firstImage}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📦</div>
                                )}
                                {item.is_featured && (
                                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                        مميز
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <h3 className="text-sm font-bold text-foreground truncate mb-1 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-primary font-bold text-sm">{item.price.toLocaleString('ar-EG')} ج.م</p>
                                <p className="text-xs text-muted-foreground mt-1">{categoryLabel}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
