/**
 * PeakHoursIndicator Component
 * 
 * Shows typical busy times for the place
 */

'use client';

import { TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/presentation/components/ui/Badge';

interface PeakHour {
    time: string;
    level: 'low' | 'medium' | 'high';
    label: string;
}

interface PeakHoursIndicatorProps {
    peakHours?: PeakHour[];
}

const defaultPeakHours: PeakHour[] = [
    { time: '9-11 ص', level: 'low', label: 'هادئ' },
    { time: '12-2 م', level: 'medium', label: 'متوسط' },
    { time: '3-5 م', level: 'medium', label: 'متوسط' },
    { time: '6-9 م', level: 'high', label: 'مزدحم' },
];

export function PeakHoursIndicator({ peakHours = defaultPeakHours }: PeakHoursIndicatorProps) {
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'low':
                return {
                    bg: 'bg-green-500/20 dark:bg-green-500/10',
                    bar: 'bg-green-500',
                    text: 'text-green-700 dark:text-green-400',
                    height: '35%'
                };
            case 'medium':
                return {
                    bg: 'bg-amber-500/20 dark:bg-amber-500/10',
                    bar: 'bg-amber-500',
                    text: 'text-amber-700 dark:text-amber-400',
                    height: '65%'
                };
            case 'high':
                return {
                    bg: 'bg-rose-500/20 dark:bg-rose-500/10',
                    bar: 'bg-rose-500',
                    text: 'text-rose-700 dark:text-rose-400',
                    height: '95%'
                };
            default:
                return {
                    bg: 'bg-muted',
                    bar: 'bg-muted-foreground/30',
                    text: 'text-muted-foreground',
                    height: '35%'
                };
        }
    };

    const getCurrentHour = () => {
        const hour = new Date().getHours();
        if (hour >= 9 && hour < 12) return 0;
        if (hour >= 12 && hour < 15) return 1;
        if (hour >= 15 && hour < 18) return 2;
        if (hour >= 18 && hour < 21) return 3;
        return -1;
    };

    const currentIndex = getCurrentHour();

    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">
                    أوقات الزحمة المتوقعة
                </h3>
            </div>

            {/* Chart */}
            <div className="flex items-end justify-between gap-2 h-32 mb-4">
                {peakHours.map((hour, index) => {
                    const colors = getLevelColor(hour.level);
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            {/* Bar */}
                            <div className="w-full bg-secondary-200 dark:bg-secondary/30 rounded-t-xl overflow-hidden flex-1 flex items-end shadow-inner">
                                <div
                                    className={`w-full ${colors.bar} transition-all duration-700 rounded-t-xl relative ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-card scale-105 z-10 shadow-lg' : 'opacity-90'
                                        }`}
                                    style={{ height: colors.height }}
                                >
                                    {isCurrent && (
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                                            <Users className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Time Label */}
                            <div className="text-center">
                                <div className="text-[10px] font-black text-foreground dark:text-muted-foreground whitespace-nowrap">
                                    {hour.time}
                                </div>
                                <Badge
                                    variant={
                                        hour.level === 'low'
                                            ? 'success'
                                            : hour.level === 'medium'
                                                ? 'warning'
                                                : 'error'
                                    }
                                    size="sm"
                                    className="mt-1"
                                >
                                    {hour.label}
                                </Badge>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 text-[10px] font-black border-t border-border pt-4 mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-foreground dark:text-muted-foreground">هادئ</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-foreground dark:text-muted-foreground">متوسط</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-foreground dark:text-muted-foreground">مزدحم</span>
                </div>
            </div>

            <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
                بناءً على بيانات الزوار السابقة
            </p>
        </div>
    );
}
