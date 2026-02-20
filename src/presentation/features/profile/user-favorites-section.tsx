'use client'

import { useEffect, useState } from 'react'
import { getUserFavoritesAction, getUserFavoriteAdsAction } from '@/actions/favorites.actions'
import { Place } from '@/domain/entities/place'
import { MarketplaceItem } from '@/domain/entities/marketplace-item'
import { PlaceCard } from '@/presentation/features/places/components/place-card'
import { MarketplaceItemCard } from '@/app/(public)/marketplace/components/marketplace-item-card'
import { Heart, Loader2, Store, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function UserFavoritesSection() {
    const [places, setPlaces] = useState<Place[]>([])
    const [ads, setAds] = useState<MarketplaceItem[]>([])
    const [loading, setLoading] = useState(true)
    const [subTab, setSubTab] = useState<'places' | 'ads'>('places')

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const [placesData, adsData] = await Promise.all([
                    getUserFavoritesAction(),
                    getUserFavoriteAdsAction()
                ])
                setPlaces(placesData)
                setAds(adsData)
            } catch (error) {
                console.error('Error fetching favorites:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchFavorites()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">جاري تحميل مفضلاتك...</p>
            </div>
        )
    }

    const hasFavorites = places.length > 0 || ads.length > 0

    if (!hasFavorites) {
        return (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                <Heart size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium text-foreground">قائمة المفضلة فارغة</p>
                <p className="text-sm text-muted-foreground mt-1">احفظ الأماكن أو الإعلانات التي تهمك للوصول إليها لاحقاً</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
                <button
                    onClick={() => setSubTab('places')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'places'
                            ? 'bg-background text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <MapPin size={16} />
                    أماكن ({places.length})
                </button>
                <button
                    onClick={() => setSubTab('ads')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === 'ads'
                            ? 'bg-background text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Store size={16} />
                    إعلانات ({ads.length})
                </button>
            </div>

            {/* Grid display */}
            <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {subTab === 'places' ? (
                    places.length > 0 ? (
                        places.map(place => (
                            <div key={place.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <PlaceCard place={place} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground">لا يوجد أماكن مفضلة بعد</div>
                    )
                ) : (
                    ads.length > 0 ? (
                        ads.map(ad => (
                            <div key={ad.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <MarketplaceItemCard item={ad} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground">لا يوجد إعلانات مفضلة بعد</div>
                    )
                )}
            </motion.div>
        </div>
    )
}
