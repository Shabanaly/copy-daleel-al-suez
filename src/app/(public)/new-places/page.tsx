import { createClient } from "@/lib/supabase/server";
import { PlaceCard } from "@/presentation/features/places/components/place-card";
import { Plus, Sparkles, Calendar } from "lucide-react";
import { Metadata } from "next";
import { Place } from "@/domain/entities/place";

export const metadata: Metadata = {
    title: "الأماكن الجديدة - دليل السويس",
    description: "اكتشف أحدث الأماكن المضافة في السويس - مطاعم وكافيهات وخدمات جديدة",
};

export const revalidate = 3600; // Revalidate every hour

export default async function NewPlacesPage() {
    const supabase = await createClient();

    // Get places created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: newPlaces, error } = await supabase
        .from('places')
        .select(`
      *,
      category:categories(*)
    `)
        .eq('status', 'active')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

    const places: Place[] = newPlaces?.map((place: any) => ({
        id: place.id,
        name: place.name,
        slug: place.slug || '',
        description: place.description || '',
        address: place.address || '',
        googleMapsUrl: place.google_maps_url || '',
        phone: place.phone || '',
        imageUrl: place.image_url,
        images: place.images || [],
        categoryId: place.category_id,
        category: place.category ? {
            id: place.category.id,
            name: place.category.name,
            nameEn: place.category.name_en,
            description: place.category.description,
            icon: place.category.icon,
            color: place.category.color,
            isFeatured: place.category.is_featured
        } : undefined,
        rating: place.rating || 0,
        reviewCount: place.review_count || 0,
        isFeatured: place.is_featured || false,
        status: ((place.status === 'rejected' ? 'inactive' : place.status) as 'active' | 'pending' | 'inactive') || 'active',
        type: (place.type || 'business') as 'business' | 'professional',
        createdAt: place.created_at,
        updatedAt: place.updated_at,
        hasDelivery: place.has_delivery || false,
        isVerified: place.is_verified || false,
        isClaimed: place.is_claimed || false,
    })) || [];

    const daysAgo = (dateString: string) => {
        const date = new Date(dateString);
        const diff = new Date().getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'اليوم';
        if (days === 1) return 'أمس';
        if (days < 7) return `منذ ${days} أيام`;
        if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
        return `منذ ${Math.floor(days / 30)} شهر`;
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative bg-slate-900 text-white py-16 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-50"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/60 to-emerald-600/60"></div>

                {/* Animated sparkles */}
                <div className="absolute top-10 left-10 text-4xl animate-bounce">✨</div>
                <div className="absolute top-20 right-20 text-3xl animate-bounce delay-300">⭐</div>
                <div className="absolute bottom-10 left-20 text-4xl animate-bounce delay-500">🎉</div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4">
                            <Plus size={16} />
                            <span className="text-sm">جديد</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            الأماكن الجديدة ✨
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                            اكتشف أحدث الأماكن المضافة في السويس خلال آخر 30 يوم
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-6 mt-8">
                            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                                <p className="text-2xl font-bold">{places.length}</p>
                                <p className="text-xs text-white/70">مكان جديد</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                                <p className="text-2xl font-bold">30</p>
                                <p className="text-xs text-white/70">يوم</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* New Places Grid */}
            <section className="container mx-auto px-4 py-12">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-primary" size={24} />
                        <h2 className="text-2xl md:text-3xl font-bold">مضاف حديثاً</h2>
                    </div>
                    <p className="text-muted-foreground">مرتبة من الأحدث للأقدم</p>
                </div>

                {places.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {places.map((place) => (
                            <div key={place.id} className="relative">
                                {/* "New" Badge */}
                                <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-br from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                    <Sparkles size={12} />
                                    جديد
                                </div>

                                {/* Days Badge */}
                                <div className="absolute top-10 -right-2 z-20 bg-card border border-border px-2 py-1 rounded-full text-xs">
                                    {place.createdAt ? daysAgo(place.createdAt) : 'جديد'}
                                </div>

                                <PlaceCard place={place} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Plus size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">لا توجد أماكن جديدة خلال آخر 30 يوم</p>
                    </div>
                )}

                {/* Timeline */}
                {places.length > 0 && (
                    <div className="mt-12 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl border border-green-200/50 dark:border-green-800/50">
                        <div className="flex items-start gap-3">
                            <Calendar className="text-green-600 dark:text-green-400 mt-1" size={20} />
                            <div>
                                <h3 className="font-bold mb-2 text-green-900 dark:text-green-100">إحصائيات الإضافة</h3>
                                <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                                    <p>• تم إضافة <strong>{places.length}</strong> مكان جديد خلال آخر 30 يوم</p>
                                    <p>• آخر إضافة: <strong>{places[0]?.createdAt ? daysAgo(places[0].createdAt) : 'غير متوفر'}</strong></p>
                                    <p>• يتم تحديث القائمة تلقائياً كل ساعة</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
