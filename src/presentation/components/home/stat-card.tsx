import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    icon: LucideIcon
    label: string
    value: string | number
    subtitle?: string
    gradient: 'red' | 'purple' | 'green' | 'blue' | 'yellow'
    onClick?: () => void
}

const gradientMap = {
    red: 'from-red-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    yellow: 'from-yellow-500 to-orange-500'
}

const iconColorMap = {
    red: 'text-red-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    yellow: 'text-yellow-500'
}

export function StatCard({ icon: Icon, label, value, subtitle, gradient, onClick }: StatCardProps) {
    return (
        <div
            onClick={onClick}
            className={`
        relative overflow-hidden
        bg-card p-4 md:p-6 rounded-2xl border border-border
        hover:border-primary/50 hover:shadow-lg
        transition-all duration-300 cursor-pointer group
      `}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientMap[gradient]} opacity-0 group-hover:opacity-5 transition-opacity`} />

            {/* Content */}
            <div className="relative z-10">
                {/* Icon */}
                <div className={`mb-3 ${iconColorMap[gradient]}`}>
                    <Icon size={28} className="md:w-8 md:h-8" />
                </div>

                {/* Value */}
                <div className="text-2xl md:text-3xl font-bold mb-1 text-foreground">
                    {value}
                </div>

                {/* Label */}
                <div className="text-sm text-muted-foreground">
                    {label}
                </div>

                {/* Subtitle */}
                {subtitle && (
                    <div className="text-xs text-muted-foreground/70 mt-1">
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    )
}
