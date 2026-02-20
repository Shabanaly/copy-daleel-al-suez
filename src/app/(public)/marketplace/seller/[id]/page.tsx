import { getSellerProfileAction, getSellerItemsAction } from '@/actions/marketplace.actions'
import { createClient } from '@/lib/supabase/server'
import { SellerHeader } from '@/presentation/components/marketplace/seller/seller-header'
import { Store, ShoppingBag } from 'lucide-react'
import { notFound } from 'next/navigation'
import { MarketplaceItemCard } from '../../components/marketplace-item-card'

// ...

export default async function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = user?.id === id

    // Parallel fetching
    const [profile, items] = await Promise.all([
        getSellerProfileAction(id),
        getSellerItemsAction(id)
    ])

    if (!profile) {
        return notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <SellerHeader profile={profile} stats={{ totalItems: items.length }} isOwner={isOwner} />

            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Store className="text-primary" />
                        <span>معروضات البائع</span>
                        <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{items.length}</span>
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
            </div>
        </div>
    )
}
