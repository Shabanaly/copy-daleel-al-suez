'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2, XCircle, Trash2, Star, Clock,
    Package, ShoppingBag, AlertTriangle, TrendingUp,
    Eye, ChevronDown, ChevronUp, Flag, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
    AdminStats,
    PendingItem,
    approveItemAction,
    rejectItemAction,
    featureItemAction,
    adminDeleteItemAction,
} from '@/actions/admin-marketplace.actions';
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms';
import Image from 'next/image';

interface AdminDashboardProps {
    stats?: AdminStats;
    pendingItems: PendingItem[];
    error?: string;
}

export function AdminDashboard({ stats, pendingItems, error }: AdminDashboardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    if (error) {
        return (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <AlertTriangle className="mx-auto mb-3 text-destructive" size={32} />
                <p className="text-destructive font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* إحصائيات */}
            {stats && <StatsCards stats={stats} />}

            {/* الإعلانات المعلقة */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <Clock className="text-amber-500" size={20} />
                    <h2 className="text-lg font-bold text-foreground">
                        إعلانات بانتظار المراجعة
                        {pendingItems.length > 0 && (
                            <span className="mr-2 text-sm font-normal text-muted-foreground">
                                ({pendingItems.length})
                            </span>
                        )}
                    </h2>
                </div>

                {pendingItems.length === 0 ? (
                    <div className="bg-card rounded-xl border border-border p-8 text-center">
                        <CheckCircle2 className="mx-auto mb-3 text-green-500" size={40} />
                        <p className="text-lg font-medium text-foreground">لا توجد إعلانات معلقة 🎉</p>
                        <p className="text-sm text-muted-foreground mt-1">كل الإعلانات تمت مراجعتها</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingItems.map(item => (
                            <PendingItemCard
                                key={item.id}
                                item={item}
                                isPending={isPending}
                                onApprove={(id) => {
                                    startTransition(async () => {
                                        const result = await approveItemAction(id);
                                        if (result.success) {
                                            toast.success('تم قبول الإعلان ✅');
                                            router.refresh();
                                        } else {
                                            toast.error(result.error || 'حدث خطأ');
                                        }
                                    });
                                }}
                                onReject={(id, reason) => {
                                    startTransition(async () => {
                                        const result = await rejectItemAction(id, reason);
                                        if (result.success) {
                                            toast.success('تم رفض الإعلان');
                                            router.refresh();
                                        } else {
                                            toast.error(result.error || 'حدث خطأ');
                                        }
                                    });
                                }}
                                onDelete={(id) => {
                                    startTransition(async () => {
                                        const result = await adminDeleteItemAction(id);
                                        if (result.success) {
                                            toast.success('تم حذف الإعلان');
                                            router.refresh();
                                        } else {
                                            toast.error(result.error || 'حدث خطأ');
                                        }
                                    });
                                }}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

// ========== Stats Cards ==========



// ========== Stats Cards (Compact View) ==========

function StatsCards({ stats }: { stats: AdminStats }) {
    const cards = [
        { label: 'نشط', value: stats.totalActive, icon: ShoppingBag, color: 'text-green-600 bg-green-50/50' },
        { label: 'معلق', value: stats.totalPending, icon: Clock, color: 'text-amber-600 bg-amber-50/50' },
        { label: 'بلاغات', value: stats.totalReports, icon: Flag, color: 'text-rose-600 bg-rose-50/50' },
        { label: 'مرفوض', value: stats.totalRejected, icon: XCircle, color: 'text-red-600 bg-red-50/50' },
        { label: 'مباع', value: stats.totalSold, icon: Package, color: 'text-blue-600 bg-blue-50/50' },
        { label: 'منتهي', value: stats.totalExpired, icon: AlertTriangle, color: 'text-gray-500 bg-gray-50/50' },
        { label: 'جديد', value: stats.todayNew, icon: TrendingUp, color: 'text-purple-600 bg-purple-50/50' },
    ];

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {cards.map(card => (
                <div
                    key={card.label}
                    className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-lg border border-border/50",
                        card.color
                    )}
                >
                    <card.icon size={18} className="mb-1 opacity-80" />
                    <span className="text-xl font-bold leading-none mb-1">{card.value}</span>
                    <span className="text-[10px] font-medium opacity-70">{card.label}</span>
                </div>
            ))}
        </div>
    );
}

// Helper for class names
import { cn } from '@/lib/utils';

// ========== Pending Item Card ==========

function PendingItemCard({
    item,
    isPending,
    onApprove,
    onReject,
    onDelete,
}: {
    item: PendingItem;
    isPending: boolean;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onDelete: (id: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    const categoryLabel = MARKETPLACE_FORMS[item.category]?.label || item.category;
    const firstImage = item.images?.[0];

    const timeAgo = getTimeAgo(item.created_at);

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Main Row */}
            <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                {/* Header for mobile - Title and Price stacked */}
                <div className="flex sm:hidden items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        إعلان معلق
                    </span>
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Image */}
                    {firstImage ? (
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border/50">
                            <Image
                                src={firstImage}
                                alt={item.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border/50">
                            <Package className="text-muted-foreground" size={24} />
                        </div>
                    )}

                    {/* Title & Stats - visible on mobile next to image */}
                    <div className="flex-1 min-w-0 sm:hidden">
                        <h3 className="font-bold text-sm text-foreground line-clamp-1">{item.title}</h3>
                        <p className="font-bold text-primary text-sm mt-0.5">{item.price.toLocaleString('ar-EG')} ج.م</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{categoryLabel}</p>
                    </div>
                </div>

                {/* Info - Desktop view */}
                <div className="hidden sm:block flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="font-bold text-primary">{item.price.toLocaleString('ar-EG')} ج.م</span>
                        <span>•</span>
                        <span>{categoryLabel}</span>
                        <span>•</span>
                        <span>{timeAgo}</span>
                    </div>
                    {item.seller?.full_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            البائع: {item.seller.full_name} — {item.seller_phone}
                        </p>
                    )}
                </div>

                {/* Seller Info - Mobile specific */}
                <div className="sm:hidden w-full bg-muted/30 p-2 rounded-lg border border-border/50">
                    <p className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {item.seller?.full_name || 'بائع غير معروف'} — {item.seller_phone}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onApprove(item.id)}
                            disabled={isPending}
                            className="flex items-center justify-center gap-2 h-10 sm:h-9 px-4 sm:px-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 text-xs font-bold shadow-sm shadow-green-200"
                        >
                            <CheckCircle2 size={16} />
                            <span>قبول</span>
                        </button>
                        <button
                            onClick={() => setShowRejectForm(!showRejectForm)}
                            disabled={isPending}
                            className="flex items-center justify-center gap-2 h-10 sm:h-9 px-4 sm:px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 text-xs font-bold border border-red-100"
                        >
                            <XCircle size={16} />
                            <span>رفض</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-2.5 sm:p-2 rounded-lg bg-muted text-muted-foreground hover:bg-accent transition-colors border border-border/50"
                    >
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {/* Reject Form */}
            {showRejectForm && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="سبب الرفض..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            dir="rtl"
                        />
                        <button
                            onClick={() => {
                                if (rejectReason.trim().length >= 3) {
                                    onReject(item.id, rejectReason);
                                    setShowRejectForm(false);
                                    setRejectReason('');
                                } else {
                                    toast.error('اكتب سبب الرفض (3 حروف على الأقل)');
                                }
                            }}
                            disabled={isPending}
                            className="px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50"
                        >
                            رفض
                        </button>
                    </div>
                </div>
            )}

            {/* Expanded Details */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-border pt-3 space-y-4 bg-muted/10">
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">الوصف</h4>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{item.description}</p>
                    </div>

                    {/* Images */}
                    {item.images.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">الصور ({item.images.length})</h4>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {item.images.map((img, i) => (
                                    <div key={i} className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border/50">
                                        <Image
                                            src={img}
                                            alt={`${item.title} - ${i + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Admin Actions */}
                    <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                        <button
                            onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) {
                                    onDelete(item.id);
                                }
                            }}
                            disabled={isPending}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-100"
                        >
                            <Trash2 size={14} />
                            حذف نهائي
                        </button>
                        <a
                            href={`/marketplace/${item.slug}`}
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-white text-foreground hover:bg-muted transition-colors border border-border shadow-sm"
                        >
                            <Eye size={14} />
                            معاينة
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

// ========== Helper ==========

function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
}
