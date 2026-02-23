// Server action to get prayer times
'use server'

interface PrayerTimes {
    fajr: string
    sunrise: string
    dhuhr: string
    asr: string
    maghrib: string
    isha: string
    isFallback?: boolean
    nextPrayer: {
        name: string
        time: string
        remainingMinutes: number
    }
}

export async function getPrayerTimes(): Promise<PrayerTimes | null> {
    const getFallback = (): PrayerTimes => {
        return {
            fajr: '04:30',
            sunrise: '06:00',
            dhuhr: '12:15',
            asr: '15:30',
            maghrib: '18:00',
            isha: '19:30',
            isFallback: true,
            nextPrayer: {
                name: 'الفجر',
                time: '04:30',
                remainingMinutes: 60
            }
        }
    }

    try {
        const today = new Date()
        const day = today.getDate()
        const month = today.getMonth() + 1
        const year = today.getFullYear()

        const response = await fetch(
            `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=Suez&country=Egypt&method=5`,
            { next: { revalidate: 3600 } }
        )

        if (!response.ok) {
            throw new Error('Failed to fetch prayer times')
        }

        const data = await response.json()
        const timings = data.data.timings

        // Calculate next prayer
        const now = new Date()
        const currentMinutes = now.getHours() * 60 + now.getMinutes()

        const prayers = [
            { name: 'الفجر', time: timings.Fajr },
            { name: 'الشروق', time: timings.Sunrise },
            { name: 'الظهر', time: timings.Dhuhr },
            { name: 'العصر', time: timings.Asr },
            { name: 'المغرب', time: timings.Maghrib },
            { name: 'العشاء', time: timings.Isha }
        ]

        let nextPrayer: { name: string; time: string; remainingMinutes?: number } = prayers[0]
        let minDiff = Infinity

        for (const prayer of prayers) {
            const [hours, minutes] = prayer.time.split(':').map(Number)
            const prayerMinutes = hours * 60 + minutes
            const diff = prayerMinutes - currentMinutes

            if (diff > 0 && diff < minDiff) {
                minDiff = diff
                nextPrayer = { ...prayer, remainingMinutes: diff }
            }
        }

        if (minDiff === Infinity) {
            const [hours, minutes] = prayers[0].time.split(':').map(Number)
            const prayerMinutes = hours * 60 + minutes
            minDiff = (24 * 60 - currentMinutes) + prayerMinutes
            nextPrayer = { ...prayers[0], remainingMinutes: minDiff }
        }

        return {
            fajr: timings.Fajr,
            sunrise: timings.Sunrise,
            dhuhr: timings.Dhuhr,
            asr: timings.Asr,
            maghrib: timings.Maghrib,
            isha: timings.Isha,
            isFallback: false,
            nextPrayer: {
                name: nextPrayer.name,
                time: nextPrayer.time,
                remainingMinutes: nextPrayer.remainingMinutes || minDiff || 0
            }
        }
    } catch (error) {
        console.error('Prayer API Error:', error instanceof Error ? error.message : String(error))
        return getFallback()
    }
}
