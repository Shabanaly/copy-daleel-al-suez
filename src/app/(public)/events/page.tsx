import { getActiveEventsUseCase } from '@/di/modules'
import { EventCard } from '@/presentation/features/events/event-card'
import { FeaturedEventsCarousel } from '@/presentation/features/events/featured-events-carousel'
import { Calendar } from 'lucide-react'
import { isPast, isFuture } from 'date-fns'

export const revalidate = 900; // 15 mins

import { createClient } from '@/lib/supabase/server'

export default async function EventsPage() {
    const supabase = await createClient()
    const events = await getActiveEventsUseCase.execute(undefined, supabase)

    // Filter live events (started but not ended) for carousel
    const liveEvents = events.filter(event =>
        isPast(new Date(event.startDate)) && isFuture(new Date(event.endDate))
    )

    // Filter upcoming events (not started yet) for grid
    const upcomingEvents = events.filter(event =>
        isFuture(new Date(event.startDate))
    )

    return (
        <main className="min-h-screen bg-background pb-20 pt-24 px-4">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                        <Calendar size={16} />
                        <span>فعاليات السويس</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">استكشف أحداث المدينة</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        كن على اطلاع دائم بأحدث المهرجانات، العروض الفنية، والأنشطة الترفيهية في قلب السويس.
                    </p>
                </div>

                {/* Live Events Carousel */}
                {liveEvents.length > 0 && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                جاري الآن
                            </h2>
                            <p className="text-muted-foreground">الفعاليات المستمرة حالياً</p>
                        </div>
                        <FeaturedEventsCarousel events={liveEvents} />
                    </div>
                )}

                {/* Upcoming Events Grid */}
                {upcomingEvents.length > 0 ? (
                    <>
                        <div className="text-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">الفعاليات القادمة</h2>
                            <p className="text-muted-foreground">اكتشف الأحداث المقبلة</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {upcomingEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </>
                ) : liveEvents.length > 0 ? (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">لا توجد فعاليات قادمة متاحة حالياً</p>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border">
                        <div className="text-muted-foreground text-lg">لا توجد فعاليات متاحة حالياً. ترقبوا المزيد قريباً!</div>
                    </div>
                )}
            </div>
        </main>
    )
}
