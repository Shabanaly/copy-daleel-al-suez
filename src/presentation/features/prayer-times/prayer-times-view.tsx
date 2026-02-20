'use client'

import { useState, useEffect, useMemo } from 'react'
import { Clock, Sunrise, Sun, Sunset, Moon, MapPin, Calendar, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Prayer {
    name: string
    time: string
    icon: any
    color: string
    bg: string
}

interface PrayerTimesViewProps {
    initialPrayerTimes: {
        fajr: string
        sunrise: string
        dhuhr: string
        asr: string
        maghrib: string
        isha: string
        nextPrayer: {
            name: string
            time: string
        }
    }
}

export function PrayerTimesView({ initialPrayerTimes }: PrayerTimesViewProps) {
    const [now, setNow] = useState(new Date())
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const convertTo12Hour = (time24: string) => {
        const [hours, minutes] = time24.split(':').map(Number)
        const period = hours >= 12 ? 'م' : 'ص'
        const h12 = hours % 12 || 12
        return `${h12}:${String(minutes).padStart(2, '0')} ${period}`
    }

    const prayers = useMemo(() => [
        { name: 'الفجر', time: initialPrayerTimes.fajr, icon: Moon, color: 'text-blue-400', bg: 'from-blue-600/20 to-indigo-600/20' },
        { name: 'الشروق', time: initialPrayerTimes.sunrise, icon: Sunrise, color: 'text-orange-400', bg: 'from-orange-500/20 to-yellow-500/20' },
        { name: 'الظهر', time: initialPrayerTimes.dhuhr, icon: Sun, color: 'text-yellow-400', bg: 'from-yellow-400/20 to-orange-400/20' },
        { name: 'العصر', time: initialPrayerTimes.asr, icon: Sun, color: 'text-amber-400', bg: 'from-amber-500/20 to-orange-500/20' },
        { name: 'المغرب', time: initialPrayerTimes.maghrib, icon: Sunset, color: 'text-red-400', bg: 'from-red-500/20 to-pink-500/20' },
        { name: 'العشاء', time: initialPrayerTimes.isha, icon: Moon, color: 'text-indigo-400', bg: 'from-indigo-600/20 to-purple-600/20' },
    ], [initialPrayerTimes])

    const nextPrayerInfo = useMemo(() => {
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        let next = prayers[0]
        let isTomorrow = false
        let minDiff = Infinity

        for (const prayer of prayers) {
            const [hours, minutes] = prayer.time.split(':').map(Number)
            const prayerMinutes = hours * 60 + minutes
            const diff = prayerMinutes - currentMinutes

            if (diff > 0 && diff < minDiff) {
                minDiff = diff
                next = prayer
            }
        }

        if (minDiff === Infinity) {
            const [hours, minutes] = prayers[0].time.split(':').map(Number)
            minDiff = (24 * 60 - currentMinutes) + hours * 60 + minutes
            next = prayers[0]
            isTomorrow = true
        }

        // Calculate seconds accurately
        const [targetH, targetM] = next.time.split(':').map(Number)
        const targetDate = new Date(now)
        targetDate.setHours(targetH, targetM, 0, 0)
        if (isTomorrow || targetDate < now) {
            targetDate.setDate(targetDate.getDate() + 1)
        }

        const diffMs = targetDate.getTime() - now.getTime()
        const totalSecs = Math.max(0, Math.floor(diffMs / 1000))
        const h = Math.floor(totalSecs / 3600)
        const m = Math.floor((totalSecs % 3600) / 60)
        const s = totalSecs % 60

        return {
            ...next,
            countdown: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
            totalSeconds: totalSecs
        }
    }, [now, prayers])

    // Background Gradient based on time of day
    const getPageBackground = () => {
        const hour = now.getHours()
        if (hour >= 5 && hour < 7) return 'from-orange-900 via-indigo-900 to-slate-950' // Dawn
        if (hour >= 7 && hour < 17) return 'from-blue-600 via-blue-500 to-indigo-600' // Day
        if (hour >= 17 && hour < 19) return 'from-orange-600 via-red-600 to-purple-900' // Sunset
        return 'from-slate-950 via-indigo-950 to-slate-900' // Night
    }

    if (!mounted) return null

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-1000 bg-gradient-to-br text-white pb-20",
            getPageBackground()
        )}>
            {/* Header */}
            <header className="container mx-auto px-4 py-8 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <MapPin size={20} className="text-white/70" />
                    <span className="font-medium">السويس، مصر</span>
                </div>
                <div className="text-right">
                    <p className="text-white/70 text-sm flex items-center justify-end gap-2">
                        <span>{now.toLocaleDateString('ar-EG', { weekday: 'long' })}</span>
                        <span className="w-1 h-1 bg-white/30 rounded-full" />
                        <span>
                            {(() => {
                                const hijriDate = new Date(now);
                                hijriDate.setDate(hijriDate.getDate() - 1);
                                return hijriDate.toLocaleDateString('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' });
                            })()}
                        </span>
                    </p>
                    <p className="font-bold">
                        {now.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </header>

            {/* Main Countdown Card */}
            <main className="container mx-auto px-4 mt-4">
                <div className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 shadow-2xl text-center mb-12 group transition-all duration-500 hover:bg-white/15">
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity">
                            <nextPrayerInfo.icon size={120} />
                        </div>

                        <div className="relative z-10">
                            <p className="text-lg md:text-xl text-white/80 mb-2 font-medium">الصلاة القادمة</p>
                            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                                {nextPrayerInfo.name}
                            </h1>

                            <div className="inline-flex items-center justify-center bg-black/20 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/10 mb-8">
                                <span className="text-4xl md:text-6xl font-mono font-bold tracking-widest tabular-nums">
                                    {nextPrayerInfo.countdown}
                                </span>
                            </div>

                            <p className="text-xl md:text-2xl text-white/90">
                                في تمام الساعة <span className="font-bold">{convertTo12Hour(nextPrayerInfo.time)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Prayer Grid */}
                    <h2 className="sr-only">جدول مواقيت الصلاة اليومي</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {prayers.map((prayer) => {
                            const isNext = prayer.name === nextPrayerInfo.name
                            const Icon = prayer.icon

                            return (
                                <div
                                    key={prayer.name}
                                    className={cn(
                                        "relative overflow-hidden rounded-3xl p-6 border transition-all duration-500 group",
                                        isNext
                                            ? "bg-white/20 border-white/40 shadow-xl scale-105 z-10"
                                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                    )}
                                >
                                    {isNext && (
                                        <div className="absolute top-3 left-3">
                                            <div className="flex items-center gap-1.5 bg-primary/80 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                                قادمة
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-center space-y-3">
                                        <div className={cn(
                                            "w-12 h-12 mx-auto rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                                            isNext ? "bg-white/20" : "bg-white/10"
                                        )}>
                                            <Icon className={cn("size-6", isNext ? "text-white" : prayer.color)} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm text-white/70 font-medium mb-1">{prayer.name}</h3>
                                            <p className="text-2xl md:text-3xl font-black tabular-nums">{convertTo12Hour(prayer.time)}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Info Section */}
                    <div className="mt-12 p-8 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-3 rounded-2xl">
                                <Info className="text-white/80" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-3">تنبيهات ومعلومات</h2>
                                <ul className="grid md:grid-cols-2 gap-3 text-white/70 text-sm md:text-base">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        الأوقات حسب توقيت مدينة السويس المحلي.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        طريقة الحساب: الهيئة المصرية العامة للمساحة.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        يتم تحديث الأوقات والعداد تلقائياً كل ثانية.
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        نذكركم بأن وقت الشروق هو لانتهاء وقت الفجر.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
