'use client';

import { useState, useEffect } from 'react';
import { Info, TrendingUp, Sparkles, MapPin, Zap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CityPulseItem } from '@/domain/entities/city-pulse-item';

// ─── Icon resolver ─────────────────────────────────────────────────────────────

const ICON_MAP: Record<CityPulseItem['iconType'], React.ReactNode> = {
    sparkles: <Sparkles size={14} className="text-yellow-500" />,
    trending: <TrendingUp size={14} className="text-green-500" />,
    mappin: <MapPin size={14} className="text-primary" />,
    zap: <Zap size={14} className="text-orange-500" />,
    info: <Info size={14} className="text-blue-400" />,
    calendar: <Calendar size={14} className="text-purple-400" />,
};

// ─── Fallback items shown only when DB returns nothing ─────────────────────────

const FALLBACK_ITEMS: Pick<CityPulseItem, 'iconType' | 'text'>[] = [
    { iconType: 'sparkles', text: 'مرحباً بك في دليل السويس — دليلك لكل حاجة في المدينة' },
    { iconType: 'mappin', text: 'اكتشف أفضل أماكن السويس من مطاعم وكافيهات وخدمات' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

interface CityPulseTickerProps {
    /** Passed from Server Component (home page). Empty array = use fallback. */
    items?: CityPulseItem[];
}

export function CityPulseTicker({ items = [] }: CityPulseTickerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const highlights = items.length > 0 ? items : FALLBACK_ITEMS;

    useEffect(() => {
        if (highlights.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % highlights.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [highlights.length]);

    return (
        <div className="w-full bg-slate-900 text-white/90 py-2 overflow-hidden border-b border-white/5">
            <div className="container mx-auto px-4 flex items-center justify-center md:justify-start gap-4">
                {/* Label */}
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/30 shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">نبض المدينة</span>
                </div>

                {/* Ticker text */}
                <div className="relative flex-1 h-5 overflow-hidden">
                    {highlights.map((item, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center gap-2 text-xs md:text-sm font-medium transition-all duration-700 absolute inset-0 whitespace-nowrap",
                                index === currentIndex
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-4"
                            )}
                        >
                            {ICON_MAP[(item as CityPulseItem).iconType ?? 'sparkles']}
                            <span className="truncate">{item.text}</span>
                        </div>
                    ))}
                </div>

                {/* Dot indicators */}
                {highlights.length > 1 && (
                    <div className="hidden md:flex items-center gap-1 shrink-0">
                        {highlights.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                    i === currentIndex ? "bg-primary w-3" : "bg-white/30"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
