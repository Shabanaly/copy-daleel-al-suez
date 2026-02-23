'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DataPoint {
    day: string
    value: number
}

interface Props {
    data: DataPoint[]
    title: string
    color?: string
}

export function GrowthChart({ data, title, color = "stroke-primary" }: Props) {
    if (!data || data.length === 0) return null

    const max = Math.max(...data.map(d => d.value))
    const min = Math.min(...data.map(d => d.value))
    const range = max - min || 1

    // SVG Dimensions
    const width = 400
    const height = 150
    const padding = 20

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding
        const y = height - ((d.value - min) / range * (height - padding * 2) + padding)
        return `${x},${y}`
    }).join(' ')

    const lastValue = data[data.length - 1].value
    const prevValue = data[data.length - 2]?.value || lastValue
    const percentage = prevValue === 0 ? 100 : Math.round(((lastValue - prevValue) / prevValue) * 100)

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-black text-foreground">{title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        {percentage > 0 ? (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <TrendingUp size={10} /> +{percentage}%
                            </span>
                        ) : percentage < 0 ? (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                <TrendingDown size={10} /> {percentage}%
                            </span>
                        ) : (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                <Minus size={10} /> 0%
                            </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-medium">مقارنة بالأسبوع الماضي</span>
                    </div>
                </div>
                <div className="text-3xl font-black text-primary">{lastValue}</div>
            </div>

            <div className="relative h-[150px] w-full">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Gradient */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area */}
                    <path
                        d={`M ${padding},${height} ${points} L ${width - padding},${height} Z`}
                        fill="url(#chartGradient)"
                        className="transition-all duration-500 delay-200"
                    />

                    {/* Line */}
                    <polyline
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        points={points}
                        className={cn(color, "transition-all duration-700")}
                    />

                    {/* Dots */}
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * (width - padding * 2) + padding
                        const y = height - ((d.value - min) / range * (height - padding * 2) + padding)
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="4"
                                className={cn("fill-background stroke-2", color)}
                            />
                        )
                    })}
                </svg>
            </div>

            <div className="flex justify-between mt-4">
                {data.map((d, i) => (
                    <span key={i} className="text-[10px] font-bold text-muted-foreground uppercase">{d.day}</span>
                ))}
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
