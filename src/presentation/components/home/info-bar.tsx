'use client'

import { Sun, Cloud, CloudRain, Wind, Droplets, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface WeatherData {
    temp: number
    feels_like: number
    humidity: number
    description: string
    icon: string
    city: string
}

interface InfoBarProps {
    weather: WeatherData | null
}

export function InfoBar({ weather: initialWeather }: InfoBarProps) {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [weather] = useState(initialWeather)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const getWeatherIcon = (icon: string) => {
        if (icon.startsWith('01')) return <Sun size={16} className="text-yellow-300" />
        if (icon.startsWith('02') || icon.startsWith('03') || icon.startsWith('04'))
            return <Cloud size={16} className="text-slate-300" />
        if (icon.startsWith('09') || icon.startsWith('10') || icon.startsWith('11'))
            return <CloudRain size={16} className="text-blue-300" />
        return <Sun size={16} className="text-yellow-300" />
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (!weather) return null

    return (
        <div className="absolute top-4 left-0 right-0 z-20">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-center gap-3 md:gap-6 bg-black/30 backdrop-blur-md px-3 md:px-6 py-2 md:py-3 rounded-full text-white text-xs md:text-sm border border-white/10">
                    {/* Weather */}
                    <div className="flex items-center gap-2">
                        {getWeatherIcon(weather.icon)}
                        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                            <span className="font-bold text-sm md:text-base">{weather.temp}°</span>
                            <span className="hidden md:inline text-white/80">{weather.city}</span>
                        </div>
                    </div>

                    {/* Divider - Hidden on mobile */}
                    <div className="hidden md:block w-px h-4 bg-white/30" />

                    {/* Weather Details - Desktop only */}
                    <div className="hidden lg:flex items-center gap-3 text-white/70">
                        <div className="flex items-center gap-1">
                            <Droplets size={14} />
                            <span>{weather.humidity}%</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-4 bg-white/30" />

                    {/* Time */}
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-300" />
                        <div className="flex flex-col">
                            {mounted ? (
                                <>
                                    <span className="font-bold">{formatTime(currentTime)}</span>
                                    <span className="hidden md:block text-xs text-white/70">{formatDate(currentTime)}</span>
                                </>
                            ) : (
                                <div className="h-10 w-24 bg-white/5 animate-pulse rounded" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
