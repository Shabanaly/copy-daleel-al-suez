'use client';

import { useState, useTransition } from 'react';
import { CityPulseItem } from '@/domain/entities/city-pulse-item';
import {
    createCityPulseItemAction,
    updateCityPulseItemAction,
    deleteCityPulseItemAction,
    CreateCityPulseInput,
} from '@/actions/city-pulse.actions';
import { Sparkles, TrendingUp, MapPin, Zap, Info, Calendar, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Save } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ICON_OPTIONS: { value: CityPulseItem['iconType']; label: string; icon: React.ReactNode }[] = [
    { value: 'sparkles', label: 'نجمة', icon: <Sparkles size={15} className="text-yellow-500" /> },
    { value: 'trending', label: 'ترند', icon: <TrendingUp size={15} className="text-green-500" /> },
    { value: 'mappin', label: 'موقع', icon: <MapPin size={15} className="text-primary" /> },
    { value: 'zap', label: 'طاقة', icon: <Zap size={15} className="text-orange-500" /> },
    { value: 'info', label: 'معلومة', icon: <Info size={15} className="text-blue-400" /> },
    { value: 'calendar', label: 'فعالية', icon: <Calendar size={15} className="text-purple-400" /> },
];

const SOURCE_LABELS: Record<CityPulseItem['source'], string> = {
    manual: 'يدوي',
    event: 'فعالية',
    auto: 'تلقائي',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
    text: string;
    iconType: CityPulseItem['iconType'];
    isActive: boolean;
    startsAt: string;
    endsAt: string;
    priority: number;
};

const EMPTY_FORM: FormState = {
    text: '',
    iconType: 'sparkles',
    isActive: true,
    startsAt: '',
    endsAt: '',
    priority: 0,
};

// ─── Form Component ───────────────────────────────────────────────────────────

function PulseItemForm({
    initial,
    onSave,
    onCancel,
    isPending,
}: {
    initial?: FormState;
    onSave: (data: FormState) => void;
    onCancel: () => void;
    isPending: boolean;
}) {
    const [form, setForm] = useState<FormState>(initial ?? EMPTY_FORM);

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm(prev => ({ ...prev, [key]: val }));

    return (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4" dir="rtl">
            {/* Text */}
            <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">نص الرسالة *</label>
                <input
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="مثلاً: افتتاح مطعم جديد في قلب السويس 🎊"
                    value={form.text}
                    onChange={e => set('text', e.target.value)}
                />
            </div>

            {/* Icon + Active + Priority */}
            <div className="flex flex-wrap items-end gap-4">
                {/* Icon */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">الأيقونة</label>
                    <div className="flex gap-2">
                        {ICON_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                title={opt.label}
                                onClick={() => set('iconType', opt.value)}
                                className={`p-2 rounded-lg border transition-all ${form.iconType === opt.value
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-background border-border hover:border-primary/50'
                                    }`}
                            >
                                {opt.icon}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">الأولوية</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        className="w-20 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={form.priority}
                        onChange={e => set('priority', Number(e.target.value))}
                    />
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-2 pb-1">
                    <button
                        type="button"
                        onClick={() => set('isActive', !form.isActive)}
                        className="flex items-center gap-2 text-sm font-medium"
                    >
                        {form.isActive
                            ? <ToggleRight size={24} className="text-primary" />
                            : <ToggleLeft size={24} className="text-muted-foreground" />
                        }
                        {form.isActive ? 'مفعّل' : 'معطّل'}
                    </button>
                </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">تاريخ البداية (اختياري)</label>
                    <input
                        type="datetime-local"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={form.startsAt}
                        onChange={e => set('startsAt', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">تاريخ الانتهاء (اختياري)</label>
                    <input
                        type="datetime-local"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={form.endsAt}
                        onChange={e => set('endsAt', e.target.value)}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
                <button
                    type="button"
                    disabled={isPending || !form.text.trim()}
                    onClick={() => onSave(form)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:brightness-110 transition-all"
                >
                    <Save size={14} />
                    {isPending ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-all"
                >
                    <X size={14} />
                    إلغاء
                </button>
            </div>
        </div>
    );
}

// ─── Main Manager Component ───────────────────────────────────────────────────

export function CityPulseManager({ initialItems }: { initialItems: CityPulseItem[] }) {
    const [items, setItems] = useState<CityPulseItem[]>(initialItems);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const ICON_NODE: Record<CityPulseItem['iconType'], React.ReactNode> = {
        sparkles: <Sparkles size={14} className="text-yellow-500" />,
        trending: <TrendingUp size={14} className="text-green-500" />,
        mappin: <MapPin size={14} className="text-primary" />,
        zap: <Zap size={14} className="text-orange-500" />,
        info: <Info size={14} className="text-blue-400" />,
        calendar: <Calendar size={14} className="text-purple-400" />,
    };

    // ── CRUD handlers ──────────────────────────────────────────────────────────

    const handleCreate = (form: FormState) => {
        startTransition(async () => {
            try {
                setError(null);
                const input: CreateCityPulseInput = {
                    text: form.text,
                    iconType: form.iconType,
                    isActive: form.isActive,
                    startsAt: form.startsAt || null,
                    endsAt: form.endsAt || null,
                    priority: form.priority,
                };
                await createCityPulseItemAction(input);
                // Optimistic: refetch by reloading silently
                window.location.reload();
            } catch (e: any) {
                setError(e.message ?? 'حدث خطأ غير متوقع');
            }
        });
    };

    const handleUpdate = (id: string, form: FormState) => {
        startTransition(async () => {
            try {
                setError(null);
                await updateCityPulseItemAction(id, {
                    text: form.text,
                    iconType: form.iconType,
                    isActive: form.isActive,
                    startsAt: form.startsAt || null,
                    endsAt: form.endsAt || null,
                    priority: form.priority,
                });
                window.location.reload();
            } catch (e: any) {
                setError(e.message ?? 'حدث خطأ غير متوقع');
            }
        });
    };

    const handleToggleActive = (item: CityPulseItem) => {
        startTransition(async () => {
            try {
                setError(null);
                await updateCityPulseItemAction(item.id, { isActive: !item.isActive });
                setItems(prev =>
                    prev.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i)
                );
            } catch (e: any) {
                setError(e.message ?? 'حدث خطأ غير متوقع');
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
        startTransition(async () => {
            try {
                setError(null);
                await deleteCityPulseItemAction(id);
                setItems(prev => prev.filter(i => i.id !== id));
            } catch (e: any) {
                setError(e.message ?? 'حدث خطأ غير متوقع');
            }
        });
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6" dir="rtl">
            {/* Error banner */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-4 py-3 rounded-lg">
                    ⚠️ {error}
                </div>
            )}

            {/* Add new */}
            {showAddForm ? (
                <PulseItemForm
                    onSave={handleCreate}
                    onCancel={() => setShowAddForm(false)}
                    isPending={isPending}
                />
            ) : (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:brightness-110 transition-all shadow-md"
                >
                    <Plus size={16} />
                    إضافة رسالة جديدة
                </button>
            )}

            {/* Items list */}
            {items.length === 0 && !showAddForm && (
                <div className="text-center py-16 text-muted-foreground">
                    <Sparkles size={40} className="mx-auto mb-3 opacity-30" />
                    <p>لا توجد رسائل بعد. أضف أول رسالة لنبض السويس!</p>
                </div>
            )}

            <div className="space-y-3">
                {items.map(item => (
                    <div key={item.id}>
                        {editingId === item.id ? (
                            <PulseItemForm
                                initial={{
                                    text: item.text,
                                    iconType: item.iconType,
                                    isActive: item.isActive,
                                    startsAt: item.startsAt ? new Date(item.startsAt).toISOString().slice(0, 16) : '',
                                    endsAt: item.endsAt ? new Date(item.endsAt).toISOString().slice(0, 16) : '',
                                    priority: item.priority,
                                }}
                                onSave={(form) => handleUpdate(item.id, form)}
                                onCancel={() => setEditingId(null)}
                                isPending={isPending}
                            />
                        ) : (
                            <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${item.isActive ? 'bg-card border-border' : 'bg-muted/30 border-border/50 opacity-60'}`}>
                                {/* Icon */}
                                <div className="shrink-0">{ICON_NODE[item.iconType]}</div>

                                {/* Text + meta */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.text}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-muted-foreground">أولوية: {item.priority}</span>
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{SOURCE_LABELS[item.source]}</span>
                                        {item.endsAt && (
                                            <span className="text-xs text-orange-500">
                                                ينتهي: {new Date(item.endsAt).toLocaleDateString('ar-EG')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0">
                                    {/* Toggle active */}
                                    <button
                                        title={item.isActive ? 'تعطيل' : 'تفعيل'}
                                        onClick={() => handleToggleActive(item)}
                                        disabled={isPending}
                                        className="p-2 rounded-lg hover:bg-muted transition-all disabled:opacity-50"
                                    >
                                        {item.isActive
                                            ? <ToggleRight size={18} className="text-primary" />
                                            : <ToggleLeft size={18} className="text-muted-foreground" />
                                        }
                                    </button>

                                    {/* Edit */}
                                    <button
                                        title="تعديل"
                                        onClick={() => setEditingId(item.id)}
                                        disabled={isPending}
                                        className="p-2 rounded-lg hover:bg-muted transition-all disabled:opacity-50"
                                    >
                                        <Pencil size={15} className="text-blue-400" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                        title="حذف"
                                        onClick={() => handleDelete(item.id)}
                                        disabled={isPending}
                                        className="p-2 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50"
                                    >
                                        <Trash2 size={15} className="text-red-400" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
