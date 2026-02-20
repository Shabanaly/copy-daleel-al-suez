import { SuezEvent } from '@/domain/entities/suez-event'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ArrowLeft, Hourglass, Eye } from 'lucide-react'
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface EventCardProps {
    event: SuezEvent
    isCompact?: boolean
}

export function EventCard({ event, isCompact = false }: EventCardProps) {
    const isPlaceHosted = event.type === 'place_hosted' && event.placeId
    const isLive = isPast(new Date(event.startDate)) && isFuture(new Date(event.endDate))
    const isUpcoming = isFuture(new Date(event.startDate))

    return (
        <div className={cn(
            "group bg-card rounded-2xl md:rounded-3xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col h-full relative",
            isCompact ? "rounded-2xl" : "rounded-3xl shadow-xl"
        )} dir="rtl">
            {/* Image Section */}
            <div className={cn(
                "relative overflow-hidden",
                isCompact ? "aspect-[4/3]" : "aspect-[16/10]"
            )}>
                {event.imageUrl ? (
                    <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                        <Calendar size={isCompact ? 24 : 48} />
                    </div>
                )}

                {/* Status Badges Overlay */}
                <div className={cn(
                    "absolute flex flex-col gap-2 items-end",
                    isCompact ? "top-2 right-2" : "top-4 right-4"
                )}>
                    <div className={cn(
                        "font-bold rounded-full shadow-lg backdrop-blur-md border border-white/10",
                        isCompact ? "px-2 py-0.5 text-[8px]" : "px-3 py-1 text-xs",
                        event.type === 'place_hosted' ? 'bg-purple-500/90 text-white' : 'bg-blue-500/90 text-white'
                    )}>
                        {event.type === 'place_hosted' ? 'عرض خاص' : 'فعالية'}
                    </div>

                    {isLive && (
                        <div className={cn(
                            "font-bold rounded-full shadow-lg bg-red-500/90 text-white animate-pulse flex items-center backdrop-blur-md border border-white/10",
                            isCompact ? "px-2 py-0.5 text-[8px] gap-1" : "px-3 py-1 text-xs gap-1.5"
                        )}>
                            <span className={cn("rounded-full bg-white animate-ping", isCompact ? "w-1 h-1" : "w-1.5 h-1.5")} />
                            جاري
                        </div>
                    )}
                </div>

                {/* View Count Badge - Always Visible */}
                <div className={cn(
                    "absolute z-10 bg-black/40 backdrop-blur-sm rounded-lg flex items-center gap-1 text-white border border-white/10",
                    isCompact ? "top-2 left-2 px-1.5 py-0.5" : "top-4 left-4 px-2 py-1"
                )}>
                    <Eye size={isCompact ? 10 : 12} className="text-white/80" />
                    <span className={isCompact ? "text-[10px]" : "text-xs font-bold"}>{event.viewCount || 0}</span>
                </div>

                {/* Countdown Overlay (Bottom) */}
                {isUpcoming && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1.5 text-center border-t border-white/10">
                        <p className={cn(
                            "text-white/90 font-medium flex items-center justify-center gap-1",
                            isCompact ? "text-[8px]" : "text-xs"
                        )}>
                            <Hourglass size={isCompact ? 10 : 12} className="text-yellow-400" />
                            {isCompact ? 'يبدأ قريباً' : `يبدأ خلال ${formatDistanceToNow(new Date(event.startDate), { locale: ar })}`}
                        </p>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className={cn(
                "space-y-2 flex-1 flex flex-col text-right",
                isCompact ? "p-3" : "p-6 space-y-4"
            )}>
                <div className="space-y-1">
                    <h3 className={cn(
                        "font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2",
                        isCompact ? "text-sm" : "text-xl"
                    )}>
                        {event.title}
                    </h3>
                    {!isCompact && (
                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                            {event.description}
                        </p>
                    )}
                </div>

                <div className={cn(
                    "pt-1",
                    isCompact ? "space-y-1" : "space-y-3 pt-2"
                )}>
                    <div className={cn("flex items-center gap-1.5 text-muted-foreground", isCompact ? "text-[10px]" : "text-sm")}>
                        <Calendar size={isCompact ? 12 : 16} className="text-primary shrink-0" />
                        <span>{format(new Date(event.startDate), isCompact ? 'dd/MM' : 'dd MMMM yyyy', { locale: ar })}</span>
                    </div>

                    {!isCompact && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Clock size={16} className="text-primary shrink-0" />
                            <span>من {format(new Date(event.startDate), 'hh:mm a')} إلى {format(new Date(event.endDate), 'hh:mm a')}</span>
                        </div>
                    )}

                    <div className={cn("flex items-center gap-1.5 text-muted-foreground", isCompact ? "text-[10px]" : "text-sm")}>
                        <MapPin size={isCompact ? 12 : 16} className="text-primary shrink-0" />
                        <span className="truncate">{event.location || 'السويس'}</span>
                    </div>
                </div>

                {!isCompact && (
                    <div className="pt-4 mt-auto flex gap-3">
                        <Link
                            href={`/events/${event.id}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl transition-all shadow-lg shadow-primary/20 font-bold group/btn"
                        >
                            <span>التفاصيل</span>
                            <ArrowLeft size={18} className="group-hover/btn:-translate-x-1 transition-transform" />
                        </Link>

                        {isPlaceHosted && (
                            <Link
                                href={`/places/${event.placeId}`}
                                className="aspect-square flex items-center justify-center w-12 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-2xl transition-all border border-border"
                                title={`عرض المكان: ${event.placeName}`}
                            >
                                <MapPin size={20} />
                            </Link>
                        )}
                    </div>
                )}

                {isCompact && (
                    <div className="mt-auto pt-2 border-t border-border/50">
                        <Link
                            href={`/events/${event.id}`}
                            className="text-primary text-[10px] font-black flex items-center justify-end gap-1 group/btn"
                        >
                            <span>عرض التفاصيل</span>
                            <ArrowLeft size={10} className="group-hover/btn:-translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
