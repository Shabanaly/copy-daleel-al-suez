'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2, XCircle, Trash2, Clock,
    MapPin, Search, Filter, MoreVertical,
    Eye, Edit, AlertCircle, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import {
    updatePlaceStatusAction,
    deletePlaceAction,
    bulkUpdatePlacesStatusAction,
    bulkDeletePlacesAction,
    transferPlaceOwnershipAction
} from '@/actions/admin-places.actions';
import { Place } from '@/domain/entities/place';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog';

import { getUsersAction } from '@/actions/admin-users.actions';

interface PlacesManagementProps {
    initialPlaces: Place[];
    categories: { id: string; name: string }[];
    isSuperAdmin?: boolean;
}

export function PlacesManagement({ initialPlaces, categories, isSuperAdmin = false }: PlacesManagementProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null);
    const [ownershipInput, setOwnershipInput] = useState<Record<string, { id: string, name: string } | null>>({});

    // User Search State
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState<string | null>(null);

    // Dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        description: string;
        onConfirm: () => Promise<void>;
        variant: 'danger' | 'warning' | 'primary';
    } | null>(null);

    // Filtered Places
    const filteredPlaces = useMemo(() => {
        return initialPlaces.filter(place => {
            const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                place.address.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || place.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || place.categoryId === categoryFilter;
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [initialPlaces, searchQuery, statusFilter, categoryFilter]);

    // Handlers
    const handleUserSearch = async (query: string) => {
        setUserSearchQuery(query);

        setIsSearchingUsers(true);
        try {
            const result = await getUsersAction({ search: query || undefined, limit: 5 });
            console.log("getUsersAction payload:", result);
            if (result.success && result.users) {
                setUserSearchResults(result.users);
            } else {
                console.error("Server action failed:", result);
                setUserSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearchingUsers(false);
        }
    };

    const handleStatusUpdate = (id: string, status: 'active' | 'pending' | 'inactive') => {
        startTransition(async () => {
            const result = await updatePlaceStatusAction(id, status);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleDelete = (id: string, name: string) => {
        setConfirmConfig({
            title: 'حذف المكان',
            description: `هل أنت متأكد من حذف المكان "${name}" نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.`,
            variant: 'danger',
            onConfirm: async () => {
                const result = await deletePlaceAction(id);
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

    const handleBulkStatusUpdate = (status: 'active' | 'pending' | 'inactive') => {
        if (selectedIds.length === 0) return;
        setConfirmConfig({
            title: status === 'active' ? 'تفعيل الأماكن المختارة' : 'تعطيل الأماكن المختارة',
            description: `هل أنت متأكد من تغيير حالة ${selectedIds.length} مكان مختار؟`,
            variant: 'warning',
            onConfirm: async () => {
                const result = await bulkUpdatePlacesStatusAction(selectedIds, status);
                if (result.success) {
                    toast.success(result.message);
                    setSelectedIds([]);
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            }
        });
        setConfirmOpen(true);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setConfirmConfig({
            title: 'حذف الأماكن المختارة',
            description: `هل أنت متأكد من حذف ${selectedIds.length} مكان مختار نهائياً؟ هذا الإجراء سيقوم بإزالة جميع البيانات المتعلقة بها.`,
            variant: 'danger',
            onConfirm: async () => {
                const result = await bulkDeletePlacesAction(selectedIds);
                if (result.success) {
                    toast.success(result.message);
                    setSelectedIds([]);
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            }
        });
        setConfirmOpen(true);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredPlaces.length && filteredPlaces.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredPlaces.map(p => p.id));
        }
    };

    const handleTransferOwnership = (placeId: string, currentOwner?: string) => {
        const newOwner = ownershipInput[placeId];
        if (!newOwner || !newOwner.id) {
            toast.error('يرجى اختيار مستخدم أولاً');
            return;
        }

        setConfirmConfig({
            title: 'نقل ملكية المكان',
            description: `هل أنت متأكد من نقل ملكية هذا المكان إلى المالك الجديد: ${newOwner.name}؟`,
            variant: 'warning',
            onConfirm: async () => {
                const result = await transferPlaceOwnershipAction(placeId, newOwner.id);
                if (result.success) {
                    toast.success(result.message);
                    setOwnershipInput(prev => ({ ...prev, [placeId]: null }));
                    setShowUserDropdown(null);
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            }
        });
        setConfirmOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="بحث في الأماكن أو العناوين..."
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
                            <option value="pending">بانتظار المراجعة</option>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-lg">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                        >
                            <option value="all">كل التصنيفات</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-primary">{selectedIds.length} مكان مختار</span>
                        <div className="h-4 w-[1px] bg-primary/20" />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleBulkStatusUpdate('active')}
                                className="text-[10px] font-black px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm"
                            >
                                تفعيل الكل
                            </button>
                            <button
                                onClick={() => handleBulkStatusUpdate('inactive')}
                                className="text-[10px] font-black px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-sm"
                            >
                                تعطيل الكل
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="text-[10px] font-black px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all shadow-sm flex items-center gap-1.5"
                            >
                                <Trash2 size={12} />
                                حذف المختار
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedIds([])}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                        إلغاء التحديد
                    </button>
                </div>
            )}

            {/* Places List */}
            <div className="space-y-4">
                <div className="bg-muted/30 px-4 py-3 rounded-xl flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                    <input
                        type="checkbox"
                        checked={selectedIds.length === filteredPlaces.length && filteredPlaces.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-border"
                    />
                    <div className="flex-1">المكان / التفاصيل</div>
                    <div className="w-32 hidden md:block">التصنيف</div>
                    <div className="w-24 text-center">الحالة</div>
                    <div className="w-24 text-left">الإجراءات</div>
                </div>

                {filteredPlaces.length === 0 ? (
                    <div className="bg-card p-12 text-center rounded-2xl border border-dashed border-border">
                        <AlertCircle className="mx-auto text-muted-foreground mb-3" size={40} />
                        <p className="text-muted-foreground font-bold">لم يتم العثور على أماكن تطابق البحث</p>
                    </div>
                ) : (
                    filteredPlaces.map(place => (
                        <div key={place.id} className={cn(
                            "bg-card rounded-2xl border border-border transition-all duration-200",
                            selectedIds.includes(place.id) ? "border-primary/40 bg-primary/5 shadow-inner" : "hover:shadow-md hover:border-primary/20"
                        )}>
                            <div className="p-4 flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(place.id)}
                                    onChange={() => toggleSelect(place.id)}
                                    className="w-4 h-4 rounded border-border accent-primary"
                                />

                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/50 shadow-sm">
                                        {place.images?.[0] ? (
                                            <Image
                                                src={place.images[0]}
                                                alt={place.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <MapPin className="text-muted-foreground m-auto" size={20} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-sm text-foreground truncate">{place.name}</h3>
                                        <p className="text-[11px] font-medium text-muted-foreground truncate">{place.address}</p>
                                    </div>
                                </div>

                                <div className="w-32 hidden md:block">
                                    <span className="text-[10px] font-black bg-muted/50 border border-border/50 px-2.5 py-1 rounded-full uppercase truncate block max-w-fit">{place.categoryName}</span>
                                </div>

                                <div className="w-24 text-center">
                                    <StatusBadge status={place.status} />
                                </div>

                                <div className="w-24 flex items-center justify-end gap-1">
                                    <button
                                        onClick={() => setExpandedPlaceId(expandedPlaceId === place.id ? null : place.id)}
                                        className={cn(
                                            "p-2 hover:bg-muted rounded-xl transition-colors",
                                            expandedPlaceId === place.id ? "text-primary bg-primary/5" : "text-muted-foreground"
                                        )}
                                    >
                                        {expandedPlaceId === place.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedPlaceId === place.id && (
                                <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/5 animate-in fade-in slide-in-from-top-1">
                                    <div className="grid md:grid-cols-2 gap-6 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">الوصف</h4>
                                                <p className="text-xs font-bold text-foreground leading-relaxed">{place.description || 'لا يوجد وصف'}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-6 pt-2">
                                                <div>
                                                    <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">الهاتف</h4>
                                                    <p className="text-xs font-black text-foreground tabular-nums">{place.phone || '-'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">واتساب</h4>
                                                    <p className="text-xs font-black text-foreground tabular-nums">{place.whatsapp || '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-3">
                                                {place.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(place.id, 'active')}
                                                        disabled={isPending}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-all shadow-md shadow-green-600/10"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                        تفعيل المكان
                                                    </button>
                                                )}
                                                {place.status === 'active' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(place.id, 'inactive')}
                                                        disabled={isPending}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 transition-all shadow-md shadow-amber-500/10"
                                                    >
                                                        <XCircle size={16} />
                                                        تعطيل مؤقت
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(place.id, place.name)}
                                                    disabled={isPending}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-black hover:bg-rose-100 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                    حذف المكان
                                                </button>
                                            </div>

                                            <div className="flex gap-3">
                                                <a href={`/places/${place.slug}`} target="_blank" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-black hover:bg-muted transition-all text-muted-foreground">
                                                    <Eye size={16} />
                                                    عرض في الموقع
                                                </a>
                                                <Link
                                                    href={`/content-admin/places/${place.id}/edit`}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-black hover:bg-muted transition-all text-muted-foreground"
                                                >
                                                    <Edit size={16} />
                                                    تعديل البيانات
                                                </Link>
                                            </div>

                                            {isSuperAdmin && (
                                                <div className="mt-4 space-y-2 bg-muted/40 border border-border/60 rounded-xl p-3">
                                                    <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                                        نقل الملكية (سوبر أدمن فقط)
                                                    </h4>
                                                    <p className="text-[10px] text-muted-foreground mb-2">
                                                        يمكن ربط هذا المكان بمستخدم محدد عن طريق البحث عن اسمه أو بريده الإلكتروني.
                                                    </p>

                                                    <div className="relative flex flex-col sm:flex-row gap-2">
                                                        <div className="flex-1 relative">
                                                            {ownershipInput[place.id] ? (
                                                                <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-[11px] font-bold text-primary">
                                                                    <span>{ownershipInput[place.id]?.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setOwnershipInput(prev => ({ ...prev, [place.id]: null }))}
                                                                        className="hover:text-primary-foreground hover:bg-primary/80 rounded-full p-0.5"
                                                                    >
                                                                        <XCircle size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const isOpening = showUserDropdown !== place.id;
                                                                            setShowUserDropdown(isOpening ? place.id : null);
                                                                            if (isOpening) {
                                                                                handleUserSearch('');
                                                                            }
                                                                        }}
                                                                        className="w-full flex justify-between items-center px-3 py-2 bg-background border border-border rounded-lg text-[11px] font-bold text-muted-foreground hover:bg-muted/50 transition-colors focus:ring-1 focus:ring-primary outline-none"
                                                                    >
                                                                        <span>{place.ownerId ? 'تغيير المالك...' : 'اختر مستخدم'}</span>
                                                                        <ChevronDown size={14} className={cn("transition-transform duration-200", showUserDropdown === place.id && "rotate-180")} />
                                                                    </button>

                                                                    {showUserDropdown === place.id && (
                                                                        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-card border border-border rounded-xl shadow-2xl z-[100] flex flex-col min-w-[250px]">
                                                                            <div className="p-2 border-b border-border/50 bg-muted/20">
                                                                                <div className="relative">
                                                                                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground w-3 h-3" />
                                                                                    <input
                                                                                        type="text"
                                                                                        value={userSearchQuery}
                                                                                        onChange={(e) => handleUserSearch(e.target.value)}
                                                                                        placeholder="ابحث بالاسم أو البريد..."
                                                                                        className="w-full pr-7 pl-3 py-1.5 bg-background border border-border rounded text-[11px] font-bold outline-none focus:ring-1 focus:ring-primary"
                                                                                        autoFocus
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            <div className="max-h-48 overflow-y-auto w-full">
                                                                                {isSearchingUsers ? (
                                                                                    <div className="p-4 text-center text-[10px] text-muted-foreground font-bold flex items-center justify-center gap-2">
                                                                                        <Loader2 size={12} className="animate-spin" /> جاري التحميل...
                                                                                    </div>
                                                                                ) : userSearchResults.length > 0 ? (
                                                                                    userSearchResults.map(user => (
                                                                                        <button
                                                                                            key={user.id}
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                setOwnershipInput(prev => ({ ...prev, [place.id]: { id: user.id, name: user.full_name } }));
                                                                                                setShowUserDropdown(null);
                                                                                                setUserSearchQuery('');
                                                                                            }}
                                                                                            className="w-full text-right px-3 py-2.5 hover:bg-muted/50 border-b border-border/40 last:border-0 transition-colors flex flex-col gap-0.5"
                                                                                        >
                                                                                            <span className="text-[11px] font-bold text-foreground">{user.full_name}</span>
                                                                                            <span className="text-[9px] font-medium text-muted-foreground">{user.email}</span>
                                                                                        </button>
                                                                                    ))
                                                                                ) : (
                                                                                    <div className="p-4 text-center text-[10px] text-muted-foreground font-bold">لم يتم العثور على مستخدمين</div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTransferOwnership(place.id, place.ownerId)}
                                                            disabled={isPending || !ownershipInput[place.id]}
                                                            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-[11px] font-black hover:brightness-110 disabled:opacity-50"
                                                        >
                                                            تأكيد הנقل
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmConfig?.onConfirm || (async () => { })}
                title={confirmConfig?.title || ''}
                description={confirmConfig?.description || ''}
                variant={confirmConfig?.variant}
            />
        </div>
    );
}

function StatusBadge({ status }: { status: Place['status'] }) {
    switch (status) {
        case 'active':
            return <span className="text-[9px] font-black bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wider border border-green-200">نشط</span>;
        case 'pending':
            return <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-200">معلق</span>;
        case 'inactive':
            return <span className="text-[9px] font-black bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full uppercase tracking-wider border border-rose-100">غير نشط</span>;
        default:
            return <span className="text-[9px] font-black bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full uppercase tracking-wider border border-gray-200">{status}</span>;
    }
}
