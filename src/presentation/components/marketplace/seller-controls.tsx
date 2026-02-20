'use client';

import { Pencil, Trash2, Loader2, CheckCircle, RotateCcw, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { deleteItemAction, markItemAsSoldAction, markItemAsActiveAction, relistItemAction } from '@/actions/marketplace.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SellerControlsProps {
    itemId: string;
    item?: {
        status: string;
        expires_at?: string | null;
    };
}

export function SellerControls({ itemId, item }: SellerControlsProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذه الخطوة.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteItemAction(itemId);
            toast.success('تم حذف الإعلان بنجاح');
            router.push('/marketplace');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('حدث خطأ أثناء حذف الإعلان');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3">
            {item && (
                <div className="flex gap-2">
                    {(item.expires_at && new Date(item.expires_at) < new Date()) ? (
                        <form action={relistItemAction.bind(null, itemId)} className="flex-1">
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-orange-50 text-orange-600 py-3 rounded-xl font-bold hover:bg-orange-100 transition-colors"
                            >
                                <RotateCw className="w-4 h-4" />
                                تجديد النشر
                            </button>
                        </form>
                    ) : item.status === 'sold' ? (
                        <form action={markItemAsActiveAction.bind(null, itemId)} className="flex-1">
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 py-3 rounded-xl font-bold hover:bg-green-100 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                إلغاء البيع
                            </button>
                        </form>
                    ) : (
                        <form action={markItemAsSoldAction.bind(null, itemId)} className="flex-1">
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" />
                                تم البيع
                            </button>
                        </form>
                    )}
                </div>
            )}

            <div className="flex gap-2">
                <Link
                    href={`/marketplace/edit/${itemId}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-3 rounded-xl font-bold hover:bg-muted/80 transition-colors"
                >
                    <Pencil className="w-4 h-4" />
                    تعديل
                </Link>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-600 py-3 rounded-xl font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                    حذف
                </button>
            </div>
        </div>
    );
}
