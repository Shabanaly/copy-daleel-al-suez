import { SupabaseMarketplaceRepository } from '@/data/repositories/supabase-marketplace.repository'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Trash2, CheckCircle, Clock, XCircle, RotateCcw, RotateCw, Pencil } from 'lucide-react'
import { markItemAsSoldAction, deleteItemAction, markItemAsActiveAction, relistItemAction } from '@/actions/marketplace.actions'
import { SellerHeader } from '@/presentation/components/marketplace/seller/seller-header'
import { MarketplaceEmptyState } from '@/presentation/components/marketplace/marketplace-empty-state'
import { MarketplaceItemCard } from '@/app/(public)/marketplace/components/marketplace-item-card'

import { Pagination } from '@/presentation/components/shared/pagination'

const ITEMS_PER_PAGE = 20

export default async function MyItemsPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }> | { page?: string }
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/marketplace/my-items')
    }

    const params = searchParams instanceof Promise ? await searchParams : searchParams
    const currentPage = Math.max(1, parseInt(params.page || '1', 10))
    const offset = (currentPage - 1) * ITEMS_PER_PAGE

    const repository = new SupabaseMarketplaceRepository(supabase)
    const [{ items, count: total }, profile] = await Promise.all([
        repository.getMyItems(user.id, ITEMS_PER_PAGE, offset),
        repository.getSellerProfile(user.id) // Reuse existing method
    ])

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

    const getStatusBadge = (status: string, reason?: string) => {
        switch (status) {
            case 'active':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} /> منشور</span>
            case 'pending':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} /> قيد المراجعة</span>
            case 'sold':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle size={12} /> تم البيع</span>
            case 'rejected':
                return (
                    <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} /> مرفوض</span>
                        {reason && <span className="text-[10px] text-red-600 max-w-[150px]">{reason}</span>}
                    </div>
                )
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
            <SellerHeader
                profile={profile ? { ...profile, id: user.id } : { id: user.id, full_name: user.user_metadata?.full_name || 'User', avatar_url: user.user_metadata?.avatar_url || '', created_at: user.created_at }}
                stats={{ totalItems: total }}
                isOwner={true}
                isDashboard={true}
            />

            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold">كل الإعلانات</h2>
                    <p className="text-xs text-muted-foreground mt-1">عرض {(offset + 1)}-{Math.min(offset + items.length, total)} من {total}</p>
                </div>
                <Link href="/marketplace/new" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-medium">
                    <PlusCircle size={18} />
                    <span>إضافة إعلان</span>
                </Link>
            </div>

            {items.length === 0 ? (
                <MarketplaceEmptyState
                    title="ليس لديك إعلانات بعد"
                    description="ابدأ ببيع أغراضك المستعملة أو الجديدة الآن في سوق السويس"
                    icon={PlusCircle}
                    action={{
                        label: "أضف أول إعلان",
                        href: "/marketplace/new",
                        icon: PlusCircle
                    }}
                />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col h-full space-y-3">
                            {/* Standard Card with Integrated Actions */}
                            <MarketplaceItemCard
                                item={item}
                                isCompact={true}
                                showDetails={true}
                                footerActions={
                                    <div className="flex items-center justify-between gap-2">
                                        <Link
                                            href={`/marketplace/edit/${item.id}`}
                                            className="flex-1 text-center py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Pencil size={14} />
                                            تعديل
                                        </Link>

                                        {(item.expires_at && new Date(item.expires_at) < new Date()) ? (
                                            <form action={relistItemAction.bind(null, item.id)} className="flex-1">
                                                <button
                                                    type="submit"
                                                    className="w-full py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <RotateCw size={14} />
                                                    <span>تجديد</span>
                                                </button>
                                            </form>
                                        ) : item.status === 'sold' ? (
                                            <form action={markItemAsActiveAction.bind(null, item.id)} className="flex-1">
                                                <button
                                                    type="submit"
                                                    className="w-full py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <RotateCcw size={14} />
                                                    <span>راجع</span>
                                                </button>
                                            </form>
                                        ) : (
                                            <form action={markItemAsSoldAction.bind(null, item.id)} className="flex-1">
                                                <button
                                                    type="submit"
                                                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <CheckCircle size={14} />
                                                    <span>تم البيع</span>
                                                </button>
                                            </form>
                                        )}

                                        <form action={deleteItemAction.bind(null, item.id)} className="">
                                            <button
                                                type="submit"
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="حذف الإعلان"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </form>
                                    </div>
                                }
                            />
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-8 border-t border-border pt-8">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl="/marketplace/my-items"
                    />
                </div>
            )}
        </div>
    )
}
