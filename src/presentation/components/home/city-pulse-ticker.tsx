'use client';

import { useState, useEffect } from 'react';
import { Info, TrendingUp, Sparkles, MapPin, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CityPulseTicker() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Mock data for ticker - In a real app, this could be fetched from server
    const highlights = [
        { icon: <Sparkles size={14} className="text-yellow-500" />, text: "تم إضافة 12 مكاناً جزيلاً هذا الأسبوع في السويس" },
        { icon: <TrendingUp size={14} className="text-green-500" />, text: "أكثر من 5000 مستخدم زارو الدليل في آخر 24 ساعة" },
        { icon: <MapPin size={14} className="text-primary" />, text: "افتتاح فرع جديد لمطعم شوبك في حي السويس" },
        { icon: <Zap size={14} className="text-orange-500" />, text: "فعالية 'مهرجان الربيع' تبدأ غداً في ممشى السويس" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % highlights.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [highlights.length]);

    return (
        <div className="w-full bg-slate-900 text-white/90 py-2 overflow-hidden border-b border-white/5">
            <div className="container mx-auto px-4 flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/30 shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">نبض المدينة</span>
                </div>

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
                            {item.icon}
                            <span className="truncate">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
