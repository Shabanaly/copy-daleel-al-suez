'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FlashDeal } from '@/domain/entities/flash-deal';
import {
    Plus, Search, Filter, Trash2, Edit, AlertCircle,
    CheckCircle2, XCircle, LayoutGrid, Image as ImageIcon, MapPin, ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog';
import { deleteAdminAdAction, updateAdminAdStatusAction } from '@/actions/admin-ads.actions';
import Image from 'next/image';
import { AddAdModal } from './add-ad-modal';

interface AdsManagementProps {
    initialAds: FlashDeal[];
}

export function AdsManagement({ initialAds }: AdsManagementProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive' | 'expired'>('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [adToEdit, setAdToEdit] = useState<FlashDeal | null>(null);

    // Dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        description: string;
        onConfirm: () => Promise<void>;
        variant: 'danger' | 'warning' | 'primary';
    } | null>(null);

    // Filtered Ads
    const filteredAds = useMemo(() => {
        return initialAds.filter(ad => {
            const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (ad.placeName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
            const matchesType = typeFilter === 'all' || ad.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [initialAds, searchQuery, statusFilter, typeFilter]);

    // Handlers
    const handleStatusUpdate = (id: string, status: 'active' | 'inactive' | 'expired') => {
        startTransition(async () => {
            const result = await updateAdminAdStatusAction(id, status);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleDelete = (id: string, title: string) => {
        setConfirmConfig({
            title: 'حذف الإعلان',
            description: `هل أنت متأكد من حذف الإعلان "${title}" نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.`,
            variant: 'danger',
            onConfirm: async () => {
                const result = await deleteAdminAdAction(id);
                if (result.success) {
                    toast.success(result.message);
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            }
        });
        setConfirmOpen(true);
    };

    const handleEdit = (ad: FlashDeal) => {
        setAdToEdit(ad);
        setIsAddModalOpen(true);
    };

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'place_deal': return { label: 'خصم مكان', icon: MapPin, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
            case 'item_deal': return { label: 'ترويج منتج', icon: ShoppingBag, color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200' };
            case 'native_ad': return { label: 'بنر داخلي', icon: ImageIcon, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
            case 'platform_announcement': return { label: 'إعلان إداري', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' };
            case 'adsense': return { label: 'Google AdSense', icon: LayoutGrid, color: 'text-amber-600 bg-amber-50 border-amber-200' };
            default: return { label: type, icon: LayoutGrid, color: 'text-gray-600 bg-gray-50 border-gray-200' };
        }
    };

    const getPlacementDetails = (placement: string) => {
        switch (placement) {
            case 'home_top': return 'الرئيسية (أعلى)';
            case 'home_middle': return 'الرئيسية (منتصف)';
            case 'home_bottom': return 'الرئيسية (أسفل)';
            case 'marketplace_feed': return 'إعلانات السوق';
            case 'marketplace_sidebar': return 'الشريط الجانبي للسوق';
            case 'place_details': return 'داخل تفاصيل المكان';
            default: return placement || 'غير محدد';
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-card p-4 rounded-xl border border-border flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="بحث في الإعلانات والعروض..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 bg-background border border-border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-lg">
                        <Filter size={16} className="text-muted-foreground" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                        >
                            <option value="all">كل الحالات</option>
                            <option value="pending">بانتظار الموافقة</option>
                            <option value="active">نشط</option>
                            <option value="inactive">موقوف</option>
                            <option value="expired">منتهي</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-lg">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                        >
                            <option value="all">كل الأنواع</option>
                            <option value="place_deal">خصم لمكان</option>
                            <option value="item_deal">ترويج منتج سوق</option>
                            <option value="native_ad">بنر داخلي</option>
                            <option value="platform_announcement">إعلان إداري (شريط)</option>
                            <option value="adsense">Google AdSense</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Create New Ad Card */}
                <div
                    onClick={() => {
                        setAdToEdit(null);
                        setIsAddModalOpen(true);
                    }}
                    className="bg-primary/5 hover:bg-primary/10 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer transition-colors group min-h-[250px]"
                >
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus size={32} className="text-primary" />
                    </div>
                    <h3 className="font-black text-lg text-primary">إضافة إعلان جديد</h3>
                    <p className="text-xs text-muted-foreground mt-2 text-center">أضف خصم، بنر مدفوع، أو مساحة AdSense</p>
                </div>

                {filteredAds.map(ad => {
                    const typeInfo = getTypeDetails(ad.type || 'place_deal');
                    const TypeIcon = typeInfo.icon;

                    return (
                        <div key={ad.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg flex flex-col">
                            {/* Media / Header area */}
                            <div className="h-32 bg-muted relative border-b border-border/50 shrink-0 flex items-center justify-center overflow-hidden">
                                {ad.type === 'adsense' ? (
                                    <div className="text-center">
                                        <LayoutGrid size={32} className="mx-auto text-amber-500 mb-2 opacity-50" />
                                        <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">Slot: {ad.adCode}</span>
                                    </div>
                                ) : ad.type === 'platform_announcement' ? (
                                    <div className="text-center p-4">
                                        <AlertCircle size={32} className="mx-auto text-rose-500 mb-2 opacity-50" />
                                        <h4 className="text-sm font-black text-rose-700 truncate">{ad.title}</h4>
                                    </div>
                                ) : ad.imageUrl ? (
                                    <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="text-muted-foreground flex flex-col items-center">
                                        <ImageIcon size={32} className="opacity-30 mb-2" />
                                        <span className="text-[10px] font-bold opacity-50">بدون صورة</span>
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-2 right-2">
                                    <StatusBadge status={ad.status} />
                                </div>
                                {/* Type Badge */}
                                <div className={cn("absolute top-2 left-2 px-2 py-1 rounded text-[9px] font-black border uppercase flex items-center gap-1", typeInfo.color)}>
                                    <TypeIcon size={10} />
                                    {typeInfo.label}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-black text-foreground truncate">{ad.title}</h3>
                                {ad.placeName && <p className="text-[10px] text-muted-foreground font-bold mt-1 max-w-full truncate flex items-center gap-1"><MapPin size={10} /> {ad.placeName}</p>}

                                <div className="mt-4 space-y-1">
                                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                                        <span>موقع الظهور:</span>
                                        <span className="font-black text-foreground">{getPlacementDetails(ad.placement || 'home_top')}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                                        <span>مشاهدات الإعلان (فريدة):</span>
                                        <span className="font-black text-slate-600 bg-slate-50 px-1.5 rounded">{ad.viewsCount}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                                        <span>النقرات المسجلة:</span>
                                        <span className="font-black text-blue-600 bg-blue-50 px-1.5 rounded">
                                            {ad.clicksCount}
                                            {ad.viewsCount > 0 && (
                                                <span className="text-[9px] text-blue-400 mr-1 opacity-70">
                                                    ({((ad.clicksCount / ad.viewsCount) * 100).toFixed(1)}%)
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                                        <span>سحوبات العرض:</span>
                                        <span className="font-black text-emerald-600 bg-emerald-50 px-1.5 rounded">{ad.currentClaims}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 flex gap-2">
                                    {ad.status === 'active' ? (
                                        <button onClick={() => handleStatusUpdate(ad.id, 'inactive')} className="flex-1 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[11px] font-black hover:bg-amber-100 transition-colors flex items-center justify-center gap-1">
                                            <XCircle size={14} /> إيقاف
                                        </button>
                                    ) : (
                                        <button onClick={() => handleStatusUpdate(ad.id, 'active')} className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-lg text-[11px] font-black hover:bg-green-100 transition-colors flex items-center justify-center gap-1">
                                            <CheckCircle2 size={14} /> تفعيل
                                        </button>
                                    )}
                                    <button onClick={() => handleEdit(ad)} className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
                                        <Edit size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(ad.id, ad.title)} className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmConfig?.onConfirm || (async () => { })}
                title={confirmConfig?.title || ''}
                description={confirmConfig?.description || ''}
                variant={confirmConfig?.variant}
            />

            <AddAdModal
                isOpen={isAddModalOpen}
                adToEdit={adToEdit}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setAdToEdit(null);
                }}
            />
        </div>
    );
}

function StatusBadge({ status }: { status: FlashDeal['status'] | string }) {
    switch (status) {
        case 'active': return <span className="text-[10px] font-black bg-green-500 text-white px-2 py-0.5 rounded shadow-sm uppercase">نشط</span>;
        case 'expired': return <span className="text-[10px] font-black bg-gray-500 text-white px-2 py-0.5 rounded shadow-sm uppercase">منتهي</span>;
        case 'pending': return <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded shadow-sm uppercase">معلق</span>;
        case 'cancelled':
        case 'inactive': return <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded shadow-sm uppercase">موقوف</span>;
        default: return <span className="text-[10px] font-black bg-gray-500 text-white px-2 py-0.5 rounded shadow-sm uppercase">{status}</span>;
    }
}
