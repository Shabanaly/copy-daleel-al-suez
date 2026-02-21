'use client'

import { useEffect, useState } from 'react'
import { getSellerItemsAction, deleteItemAction, markItemAsSoldAction, markItemAsActiveAction } from '@/actions/marketplace.actions'
import { MarketplaceItem } from '@/domain/entities/marketplace-item'
import { PlusCircle, Loader2, Store, Edit3, Trash2, CheckCircle, RefreshCcw, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UserMarketplaceSectionProps {
    userId: string
}

export function UserMarketplaceSection({ userId }: UserMarketplaceSectionProps) {
    const [items, setItems] = useState<MarketplaceItem[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const data = await getSellerItemsAction(userId)
                setItems(data)
            } catch (error) {
                console.error('Error fetching user items:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchItems()
    }, [userId])

    const handleDelete = async (itemId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return

        try {
            await deleteItemAction(itemId)
            setItems(prev => prev.filter(i => i.id !== itemId))
            toast.success('تم حذف الإعلان بنجاح')
        } catch (error) {
            toast.error('فشل حذف الإعلان')
        }
    }

    const toggleStatus = async (item: MarketplaceItem) => {
        try {
            if (item.status === 'active') {
                await markItemAsSoldAction(item.id)
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'sold' as any } : i))
                toast.success('تم تحديد الإعلان كمباع')
            } else {
                await markItemAsActiveAction(item.id)
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'active' as any } : i))
                toast.success('تم تنشيط الإعلان')
            }
        } catch (error) {
            toast.error('فشل تغيير حالة الإعلان')
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">جاري تحميل إعلاناتك...</p>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                <Store size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium text-foreground">لم تقم بإضافة أي إعلانات بعد</p>
                <p className="text-sm text-muted-foreground mt-1">ابدأ ببيع منتجاتك الآن من خلال السوق</p>
                <Link href="/marketplace/new" className="inline-flex items-center gap-2 mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md">
                    <PlusCircle size={18} />
                    أضف إعلانك الأول
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Store size={20} className="text-primary" />
                    إدارة إعلاناتي ({items.length})
                </h3>
                <Link href="/marketplace/new" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                    <PlusCircle size={16} />
                    إضافة إعلان
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden relative border border-border shrink-0">
                                {item.images?.[0] ? (
                                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Store size={20} className="absolute inset-0 m-auto text-muted-foreground opacity-50" />
                                )}
                                {item.status !== 'active' && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-[8px] font-bold text-white px-1 py-0.5 bg-indigo-500 rounded">مباع</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h4 className="font-bold text-foreground text-sm truncate">{item.title}</h4>
                                    <span className="text-[11px] font-bold text-primary whitespace-nowrap">{item.price.toLocaleString()} ج.م</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <MapPin size={10} />
                                    {item.area_name || item.district_name || 'السويس'}
                                </p>

                                {/* Status Toggle for Mobile/Tablet */}
                                <div className="mt-2 flex items-center gap-2">
                                    <button
                                        onClick={() => toggleStatus(item)}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold transition-all ${item.status === 'active'
                                            ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                                            : 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20'
                                            }`}
                                    >
                                        {item.status === 'active' ? 'تحديد كمباع' : 'إعادة تنشيط'}
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 self-center">
                                <Link
                                    href={`/marketplace/edit/${item.id}`}
                                    className="p-2 bg-muted hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-primary"
                                    title="تعديل"
                                >
                                    <Edit3 size={16} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-muted hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                                    title="حذف"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <Link
                                    href={`/marketplace/${item.slug || item.id}`}
                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                    title="عرض"
                                >
                                    <ChevronRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
