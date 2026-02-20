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
    const [places, ads] = await Promise.all([
        favoritesRepo.getUserFavorites(user.id),
        favoritesRepo.getUserFavoriteAds(user.id)
    ])

    const hasAnyFavorites = places.length > 0 || ads.length > 0

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

            {!hasAnyFavorites ? (
                <MarketplaceEmptyState
                    title="قائمة المفضلات فارغة"
                    description="لم تقم بإضافة أي أماكن أو إعلانات للمفضلة بعد."
                    icon={Heart}
                    action={{
                        label: "تصفح السوق",
                        href: "/marketplace",
                        icon: Store
                    }}
                />
            ) : (
                <Tabs defaultValue="places" className="w-full" dir="rtl">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8 bg-muted/50 p-1">
                        <TabsTrigger value="places" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <MapPin size={16} />
                            الأماكن ({places.length})
                        </TabsTrigger>
                        <TabsTrigger value="ads" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Store size={16} />
                            الإعلانات ({ads.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="places" className="mt-0">
                        {places.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {places.map((place) => (
                                    <div key={place.id} className="h-full">
                                        <PlaceCard place={place} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <MarketplaceEmptyState
                                title="لا توجد أماكن محفوظة"
                                description="تصفح الأماكن وأضفها للمفضلة للوصول إليها بسرعة"
                                icon={MapPin}
                                action={{
                                    label: "تصفح الأماكن",
                                    href: "/places",
                                    icon: MapPin
                                }}
                                className="bg-muted/10 border-dashed"
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="ads" className="mt-0">
                        {ads.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {ads.map((ad) => (
                                    <div key={ad.id} className="h-full">
                                        <MarketplaceItemCard item={ad} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <MarketplaceEmptyState
                                title="لا توجد إعلانات محفوظة"
                                description="تصفح السوق وأضف الإعلانات للمفضلة لمتابعة الأسعار"
                                icon={Store}
                                action={{
                                    label: "تصفح السوق",
                                    href: "/marketplace",
                                    icon: Store
                                }}
                                className="bg-muted/10 border-dashed"
                            />
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
