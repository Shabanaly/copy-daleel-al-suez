'use client'

import { CommunityCategory } from "@/domain/entities/community-qa"
import { motion } from "framer-motion"
import { LayoutGrid, MapPin, Calendar, Info, Star, Compass } from "lucide-react"

interface CategoryFiltersProps {
    activeCategory: CommunityCategory | 'all';
    onCategoryChange: (category: CommunityCategory | 'all') => void;
}

const categories: { id: CommunityCategory | 'all', label: string, icon: any }[] = [
    { id: 'all', label: 'الكل', icon: LayoutGrid },
    { id: 'places', label: 'أماكن', icon: MapPin },
    { id: 'recommendations', label: 'ترشيحات', icon: Compass },
    { id: 'advice', label: 'نصائح', icon: Star },
    { id: 'events', label: 'فعاليات', icon: Calendar },
    { id: 'general', label: 'عام', icon: Info },
]

export function CategoryFilters({ activeCategory, onCategoryChange }: CategoryFiltersProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat) => {
                const Icon = cat.icon
                const isActive = activeCategory === cat.id

                return (
                    <button
                        key={cat.id}
                        onClick={() => onCategoryChange(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${isActive
                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                                : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                            }`}
                    >
                        <Icon size={16} className={isActive ? 'animate-pulse' : ''} />
                        {cat.label}
                    </button>
                )
            })}
        </div>
    )
}
