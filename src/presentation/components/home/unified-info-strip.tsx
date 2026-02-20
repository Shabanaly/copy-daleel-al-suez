'use client'

import { Cloud, CloudRain, Sun, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface WeatherData {
    temp: number
    city: string
    description: string
    icon: string
}

interface PrayerTimes {
    nextPrayer: {
        name: string
        time: string
        remainingMinutes: number
    }
}

interface UnifiedInfoStripProps {
    weather: WeatherData | null
    prayerTimes: PrayerTimes | null
}

export function UnifiedInfoStrip({ weather, prayerTimes }: UnifiedInfoStripProps) {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const getWeatherIcon = () => {
        if (!weather) return Sun
        const iconCode = weather.icon
        if (iconCode.startsWith('01')) return Sun
        if (iconCode.startsWith('02') || iconCode.startsWith('03') || iconCode.startsWith('04'))
            return Cloud
        if (iconCode.startsWith('09') || iconCode.startsWith('10') || iconCode.startsWith('11'))
            return CloudRain
        return Sun
    }

    const WeatherIcon = getWeatherIcon()

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const convertTo12Hour = (time24: string) => {
        const [hours, minutes] = time24.split(':').map(Number)
        const period = hours >= 12 ? 'م' : 'ص'
        const h12 = hours % 12 || 12
        return `${h12}:${String(minutes).padStart(2, '0')} ${period}`
    }

    const getRemainingTime = () => {
        if (!prayerTimes?.nextPrayer) return ''

        const [tHours, tMinutes] = prayerTimes.nextPrayer.time.split(':').map(Number)
        const targetDate = new Date(currentTime)
        targetDate.setHours(tHours, tMinutes, 0, 0)

        // If target is earlier than current, it's for tomorrow
        if (targetDate < currentTime) {
            targetDate.setDate(targetDate.getDate() + 1)
        }

        const diffMs = targetDate.getTime() - currentTime.getTime()
        const totalSeconds = Math.floor(diffMs / 1000)

        if (totalSeconds <= 0) return 'الآن'

        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        const pad = (n: number) => String(n).padStart(2, '0')

        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }

    return (
        <div className="w-full bg-card backdrop-blur-md px-3 md:px-6 py-4 rounded-xl shadow-md border border-border">
            <div className="flex items-center justify-center gap-3 md:gap-8">
                {/* Weather */}
                {weather && (
                    <>
                        <div className="flex items-center gap-2">
                            <WeatherIcon size={20} className="text-blue-500 dark:text-blue-400" />
                            <div className="flex items-center gap-1 md:gap-2">
                                <span className="font-bold text-base md:text-lg text-foreground">{weather.temp}°</span>
                                <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">{weather.city}</span>
                            </div>
                        </div>
                        <div className="w-px h-6 bg-border"></div>
                    </>
                )}

                {/* Time */}
                <div className="flex items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    {mounted ? (
                        <span className="font-bold text-base md:text-lg text-foreground whitespace-nowrap">{formatTime(currentTime)}</span>
                    ) : (
                        <div className="h-6 w-16 md:w-20 bg-muted animate-pulse rounded"></div>
                    )}
                </div>

                {/* Prayer Times */}
                {prayerTimes?.nextPrayer && (
                    <>
                        <div className="w-px h-6 bg-border"></div>
                        <Link
                            href="/prayer-times"
                            className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity"
                        >
                            <span className="text-base md:text-lg shrink-0">🕌</span>
                            <div className="flex flex-col md:flex-row md:items-center md:gap-2 overflow-hidden">
                                <span className="font-bold text-sm md:text-base text-foreground truncate">{prayerTimes.nextPrayer.name} ({convertTo12Hour(prayerTimes.nextPrayer.time)})</span>
                                {mounted ? (
                                    <span className="text-[10px] md:text-sm text-muted-foreground whitespace-nowrap">{getRemainingTime()}</span>
                                ) : (
                                    <div className="h-4 w-12 bg-muted animate-pulse rounded"></div>
                                )}
                            </div>
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}
