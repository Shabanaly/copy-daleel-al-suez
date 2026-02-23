import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SupabaseFavoritesRepository } from '@/data/repositories/supabase-favorites.repository'
import { PlaceCard } from '@/presentation/features/places/components/place-card'
import { MarketplaceItemCard } from '@/app/(public)/marketplace/components/marketplace-item-card'
import { Heart, Store, MapPin } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/ui/tabs"
import { MarketplaceEmptyState } from '@/presentation/components/marketplace/marketplace-empty-state'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const favoritesRepo = new SupabaseFavoritesRepository(supabase)
    const [placeFavorites, adFavorites] = await Promise.all([
        favoritesRepo.getUserFavorites(user.id),
        favoritesRepo.getUserFavoriteAds(user.id)
    ])

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                        <Heart size={32} className="fill-current" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">مفضلاتي</h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base">
                            قائمة بجميع العناصر التي قمت بحفظها للعودة إليها لاحقاً
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="places" className="w-full" dir="rtl">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8 bg-muted/50 p-1">
                    <TabsTrigger value="places" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <MapPin size={16} />
                        الأماكن ({placeFavorites.length})
                    </TabsTrigger>
                    <TabsTrigger value="ads" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Store size={16} />
                        الإعلانات ({adFavorites.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="places" className="mt-0">
                    {placeFavorites.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {placeFavorites.map((fav) => (
                                <div key={fav.id} className="h-full">
                                    {fav.place ? (
                                        <PlaceCard place={fav.place} />
                                    ) : (
                                        <UnavailableCard
                                            type="place"
                                            id={fav.placeId}
                                            favoriteId={fav.id}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="pt-4">
                            <MarketplaceEmptyState
                                title="لا توجد أماكن محفوظة"
                                description="تصفح دليل الأماكن وأضفها للمفضلة للوصول إليها بسرعة"
                                icon={MapPin}
                                action={{
                                    label: "تصفح الأماكن",
                                    href: "/places",
                                    icon: MapPin
                                }}
                                className="bg-muted/10 border-dashed max-w-2xl mx-auto"
                            />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="ads" className="mt-0">
                    {adFavorites.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {adFavorites.map((fav) => (
                                <div key={fav.id} className="h-full">
                                    {fav.item ? (
                                        <MarketplaceItemCard item={fav.item} />
                                    ) : (
                                        <UnavailableCard
                                            type="ad"
                                            id={fav.itemId}
                                            favoriteId={fav.id}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="pt-4">
                            <MarketplaceEmptyState
                                title="لا توجد إعلانات محفوظة"
                                description="تصفح سوق السويس وأضف الإعلانات للمفضلة لمتابعة الأسعار"
                                icon={Store}
                                action={{
                                    label: "تصفح السوق",
                                    href: "/marketplace",
                                    icon: Store
                                }}
                                className="bg-muted/10 border-dashed max-w-2xl mx-auto"
                            />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function UnavailableCard({ type, id, favoriteId }: { type: 'place' | 'ad', id: string, favoriteId: string }) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 border border-border border-dashed rounded-2xl bg-muted/5 gap-4 grayscale opacity-70 transition-all hover:grayscale-0 hover:opacity-100">
            <div className="p-3 bg-muted rounded-full">
                {type === 'place' ? <MapPin size={24} className="text-muted-foreground" /> : <Store size={24} className="text-muted-foreground" />}
            </div>
            <div className="text-center">
                <h3 className="font-bold text-foreground">هذا {type === 'place' ? 'المكان' : 'الإعلان'} لم يعد متاحاً</h3>
                <p className="text-sm text-muted-foreground mt-1">تم حذفه أو لم يعد نشطاً</p>
            </div>
            {/* Note: In a real app we'd add a Client Component button here to remove the favorite */}
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">ID: {id.substring(0, 8)}</p>
        </div>
    )
}
