import { getSellerProfileAction, getSellerItemsAction } from '@/actions/marketplace.actions'
import { createClient } from '@/lib/supabase/server'
import { SellerHeader } from '@/presentation/components/marketplace/seller/seller-header'
import { Store, ShoppingBag } from 'lucide-react'
import { notFound } from 'next/navigation'
import { MarketplaceItemCard } from '../../components/marketplace-item-card'

// ...

import { Pagination } from '@/presentation/components/shared/pagination'

const ITEMS_PER_PAGE = 20

export default async function SellerProfilePage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ page?: string }> | { page?: string }
}) {
    const { id } = await params
    const sParams = searchParams instanceof Promise ? await searchParams : searchParams
    const currentPage = Math.max(1, parseInt(sParams.page || '1', 10))
    const offset = (currentPage - 1) * ITEMS_PER_PAGE

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = user?.id === id

    // Parallel fetching
    const [profile, { items, count: total }] = await Promise.all([
        getSellerProfileAction(id),
        getSellerItemsAction(id, ITEMS_PER_PAGE, offset)
    ])

    const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

    if (!profile) {
        return notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <SellerHeader profile={profile} stats={{ totalItems: total }} isOwner={isOwner} />

            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Store className="text-primary" />
                        <span>معروضات البائع</span>
                        <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{total}</span>
                    </h2>
                </div>

                {items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <MarketplaceItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground/50">
                            <ShoppingBag size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">لا توجد إعلانات نشطة</h3>
                            <p className="text-muted-foreground">هذا المستخدم ليس لديه أي إعلانات معروضة للبيع حالياً.</p>
                        </div>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-8 border-t border-border pt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            baseUrl={`/marketplace/seller/${id}`}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
