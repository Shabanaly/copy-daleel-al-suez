'use client'

import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PrayerTimes {
    fajr: string
    sunrise: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    nextPrayer: {
        name: string
        time: string
        remainingMinutes: number
    }
}

interface PrayerCardProps {
    prayerTimes: PrayerTimes | null
}

export function PrayerCard({ prayerTimes: initialPrayerTimes }: PrayerCardProps) {
    const [prayerTimes] = useState(initialPrayerTimes)
    const [remainingTime, setRemainingTime] = useState('')

    useEffect(() => {
        if (!prayerTimes?.nextPrayer) return

        const updateRemainingTime = () => {
            const mins = prayerTimes.nextPrayer.remainingMinutes
            const hours = Math.floor(mins / 60)
            const minutes = mins % 60

            if (hours > 0) {
                setRemainingTime(`${hours} ساعة و ${minutes} دقيقة`)
            } else {
                setRemainingTime(`${minutes} دقيقة`)
            }
        }

        updateRemainingTime()
        const timer = setInterval(updateRemainingTime, 60000) // Update every minute

        return () => clearInterval(timer)
    }, [prayerTimes])

    if (!prayerTimes) return null

    return (
        <Link href="/prayer-times">
            <div className="relative overflow-hidden bg-card p-4 md:p-6 rounded-2xl border border-border hover:border-green-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity" />

                {/* Content */}
                <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-3 text-green-500">
                        <Clock size={28} className="md:w-8 md:h-8" />
                    </div>

                    {/* Next Prayer */}
                    <div className="text-2xl md:text-3xl font-bold mb-1 text-foreground">
                        {prayerTimes.nextPrayer.name}
                    </div>

                    {/* Time */}
                    <div className="text-sm text-muted-foreground mb-2">
                        {prayerTimes.nextPrayer.time}
                    </div>

                    {/* Remaining Time */}
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        بعد {remainingTime}
                    </div>
                </div>
            </div>
        </Link>
    )
}
