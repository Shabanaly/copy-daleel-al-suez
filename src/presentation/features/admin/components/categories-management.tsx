'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus, Edit, Trash2, GripVertical,
    Save, X, Info, Settings, LayoutGrid,
    CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
    createCategoryAction,
    updateCategoryAction,
    deleteCategoryAction
} from '@/actions/admin-categories.actions';
import { Category } from '@/domain/entities/category';
import { cn } from '@/lib/utils';

interface CategoriesManagementProps {
    categories: Category[];
}

export function CategoriesManagement({ categories: initialCategories }: CategoriesManagementProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '',
        color: '',
        sortOrder: 0,
        isActive: true
    });

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            icon: '',
            color: '',
            sortOrder: 0,
            isActive: true
        });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (cat: Category) => {
        setFormData({
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon || '',
            color: cat.color || '',
            sortOrder: cat.sortOrder,
            isActive: cat.isActive
        });
        setEditingId(cat.id);
        setIsAdding(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            let result;
            if (editingId) {
                result = await updateCategoryAction(editingId, formData);
            } else {
                result = await createCategoryAction(formData);
            }

            if (result.success) {
                toast.success(result.message);
                resetForm();
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`هل أنت متأكد من حذف تصنيف "${name}"؟`)) return;

        startTransition(async () => {
            const result = await deleteCategoryAction(id);
            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <LayoutGrid size={20} className="text-primary" />
                    قائمة التصنيفات ({initialCategories.length})
                </h2>
                {!isAdding && !editingId && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                    >
                        <Plus size={18} />
                        <span>إضافة تصنيف جديد</span>
                    </button>
                )}
            </div>

            {/* Form (Add or Edit) */}
            {(isAdding || editingId) && (
                <div className="bg-card border border-primary/20 p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-foreground">
                            {editingId ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                        </h3>
                        <button onClick={resetForm} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">اسم التصنيف (بالعربية)</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="مثال: مطاعم، صيدليات..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">الرابط الفريد (Slug - English)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                required
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="example: restaurants"
                                dir="ltr"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">الأيقونة (Lucide Icon Name)</label>
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="مثال: Utensils, Pill..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">لون التصنيف (Hex Code)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="#FF0000"
                                    dir="ltr"
                                />
                                <div
                                    className="w-10 h-10 rounded-xl border border-border"
                                    style={{ backgroundColor: formData.color || 'transparent' }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">الترتيب</label>
                            <input
                                type="number"
                                value={formData.sortOrder}
                                onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-muted rounded-xl transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-border text-primary"
                                />
                                <span className="text-sm font-bold text-foreground">نشط (يظهر في الموقع)</span>
                            </label>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                                <span>{editingId ? 'حفظ التغييرات' : 'إضافة الآن'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories List */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider w-12 text-center">#</th>
                            <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">التصنيف</th>
                            <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">الرابط (Slug)</th>
                            <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider text-center">الحالة</th>
                            <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider text-left">التعديلات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {initialCategories.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Info size={40} className="text-muted-foreground/30" />
                                        <p className="font-medium text-lg">لا توجد تصنيفات حالياً</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            initialCategories.map((cat, index) => (
                                <tr key={cat.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs font-bold text-muted-foreground">{cat.sortOrder}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                                                style={{ backgroundColor: cat.color || '#94a3b8' }}
                                            >
                                                <LayoutGrid size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{cat.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{cat.icon || 'No Icon'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground" dir="ltr">
                                            {cat.slug}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {cat.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase">
                                                <CheckCircle2 size={10} />
                                                نشط
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-muted text-muted-foreground uppercase">
                                                <AlertCircle size={10} />
                                                معطل
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-muted-foreground"
                                                title="تعديل"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id, cat.name)}
                                                className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors text-muted-foreground"
                                                title="حذف"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <Info size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                    <p className="font-bold mb-1">تنبيه:</p>
                    <p className="leading-relaxed">
                        تعديل أسماء التصنيفات أو روابطها (Slug) قد يؤثر على نتائج محركات البحث (SEO) والروابط الداخلية للموقع.
                        يرجى الحذر عند تعديل الروابط للمزيد من الاستقرار.
                    </p>
                </div>
            </div>
        </div>
    );
}

function Loader2({ className, ...props }: any) {
    return <Settings className={cn("animate-spin", className)} {...props} />;
}
