'use client';

import { MarketplaceItem } from '@/domain/entities/marketplace-item';
import { getFieldsForItem } from '@/config/marketplace-forms';
import { cn } from '@/lib/utils';
import { Check, Info, FileText, CheckCircle2, MapPin, Calendar, Tag } from 'lucide-react';

interface MarketplaceItemDetailsProps {
    item: MarketplaceItem;
}

export function MarketplaceItemDetails({ item }: MarketplaceItemDetailsProps) {
    // 1. Get the configuration for this item's specific category/sub-type
    const fields = getFieldsForItem(item.category, item.attributes || {});

    // 2. Helper to find the display label
    const getDisplayValue = (fieldName: string, storedValue: any) => {
        if (storedValue === null || storedValue === undefined) return null;

        const fieldConfig = fields.find(f => f.name === fieldName);
        if (!fieldConfig) return storedValue;

        // Handle Boolean / Checkbox (Though handled separately in UI, good for fallback)
        if (fieldConfig.type === 'checkbox') {
            return storedValue ? 'نعم' : 'لا';
        }

        // Handle Select Options
        if (fieldConfig.type === 'select' && fieldConfig.options) {
            const option = fieldConfig.options.find(opt => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return optValue === storedValue;
            });

            if (option) {
                return typeof option === 'string' ? option : option.label;
            }
        }

        // Handle Custom "Other" Input
        if (storedValue === 'other' || storedValue === 'أخرى') {
            const customValue = item.attributes?.[`${fieldName}_custom`];
            return customValue || storedValue;
        }

        return storedValue;
    };

    // 3. Helper for Condition Label
    const getConditionLabel = (condition: string | null) => {
        if (!condition) return 'غير محدد';
        const conditionField = fields.find(f => f.name === 'condition');
        if (conditionField) {
            return getDisplayValue('condition', condition);
        }

        const map: Record<string, string> = {
            'new': 'جديد / زيرو',
            'like_new': 'كالجديد',
            'good': 'جيد',
            'fair': 'مقبول',
            'for_parts': 'قطع غيار'
        };
        return map[condition] || condition;
    };

    // 4. Identify Primary vs Secondary Fields
    const primaryFieldNames = [
        'brand', 'model', 'year', // Vehicles/Electronics
        'kilometers', 'transmission', 'fuel_type', // Vehicles
        'area', 'rooms', 'floor', 'finishing', // Real Estate
        'storage', 'ram', 'processor', // Electronics
        'job_type', 'salary_range', 'experience' // Jobs
    ];

    // Filter fields that actually have data
    const primaryFields = fields.filter(f => primaryFieldNames.includes(f.name) && item.attributes?.[f.name]);
    const booleanFields = fields.filter(f => f.type === 'checkbox' && item.attributes?.[f.name]);
    const otherFields = fields.filter(f =>
        !primaryFieldNames.includes(f.name) &&
        f.type !== 'checkbox' &&
        f.name !== 'condition' &&
        item.attributes?.[f.name]
    );

    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <span className="bg-primary/10 text-primary p-2 rounded-lg">
                    <FileText size={20} />
                </span>
                تفاصيل الإعلان
            </h2>

            {/* Top Summary Chips - Always Visible Core Info */}
            <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-border/50">
                {item.condition && (
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                        <Info size={16} />
                        <span>الحالة:</span>
                        <span className="font-bold">{getConditionLabel(item.condition)}</span>
                    </div>
                )}

                {item.attributes?.listing_type && (
                    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border",
                        item.attributes.listing_type === 'wanted' ? "bg-orange-50 text-orange-700 border-orange-100" : "bg-green-50 text-green-700 border-green-100"
                    )}>
                        <Tag size={16} />
                        <span>النوع:</span>
                        <span className="font-bold">
                            {item.attributes.listing_type === 'wanted' ? 'مطلوب للشراء' : 'معروض للبيع'}
                        </span>
                    </div>
                )}

                <div className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm text-foreground/80 border border-border/50">
                    <MapPin size={16} />
                    <span>{item.location || 'السويس'}</span>
                </div>

                <div className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm text-foreground/80 border border-border/50">
                    <Calendar size={16} />
                    <span>{new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
            </div>

            {/* 1. Primary Specifications (Highlighted Grid) */}
            {primaryFields.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Info size={16} />
                        المواصفات الأساسية
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {primaryFields.map(field => (
                            <div key={field.name} className="flex flex-col bg-muted/50 p-3 rounded-xl border border-border/50">
                                <span className="text-xs text-muted-foreground mb-1">{field.label}</span>
                                <span className="font-bold text-foreground text-sm line-clamp-1">{getDisplayValue(field.name, item.attributes?.[field.name])}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Features (Tags / Checkmarks) */}
            {booleanFields.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        المميزات والإضافات
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {booleanFields.map(field => (
                            <div key={field.name} className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-100 text-sm font-medium">
                                <Check size={16} />
                                <span>{field.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Other Technical Specifications */}
            {otherFields.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">تفاصيل إضافية</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                        {otherFields.map(field => {
                            const val = getDisplayValue(field.name, item.attributes?.[field.name]);
                            if (val === undefined || val === null || val === '') return null;

                            return (
                                <div key={field.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 group hover:bg-muted/30 px-2 rounded-lg transition-colors">
                                    <span className="text-muted-foreground text-sm">{field.label}</span>
                                    <span className="font-medium text-foreground text-sm text-left">{val}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-bold mb-3 text-foreground">الوصف</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                    {item.description}
                </p>
            </div>
        </div>
    );
}
