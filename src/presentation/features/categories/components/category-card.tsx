// ... imports
import Link from 'next/link'
import { Category } from '@/domain/entities/category'
import { CategoryIcon } from './category-icon'
import { ArrowLeft } from 'lucide-react'
import { getCategoryColor } from '../utils/category-colors'
import { cn } from '@/lib/utils'

interface CategoryCardProps {
    category: Category
    placesCount?: number
}

export function CategoryCard({ category, placesCount = 0 }: CategoryCardProps) {
    const colors = getCategoryColor(category.id);

    return (
        <Link
            href={`/categories/${category.slug}`}
            className="group relative bg-card hover:bg-white dark:hover:bg-slate-900 border border-border/50 rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 overflow-hidden flex flex-col items-center border-b-4 hover:border-b-primary"
        >
            {/* Background Pattern - Suez Themed Pattern */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                colors.bg
            )}></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-6 w-full">
                {/* Icon Container - Large & Vibrant */}
                <div className={cn(
                    "w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-700 group-hover:rotate-6 shadow-xl group-hover:shadow-2xl",
                    colors.bg,
                    "ring-4 ring-white dark:ring-slate-800"
                )}>
                    <CategoryIcon
                        name={category.icon}
                        size={48}
                        className={cn(colors.text, "drop-shadow-sm")}
                    />
                </div>

                {/* Info */}
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            colors.bg,
                            colors.text
                        )}>
                            {placesCount} مكان متاح
                        </span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-10">
                    {category.description || `استكشف أفضل ${category.name} في مدينة السويس`}
                </p>

                {/* Action Indicator */}
                <div className="pt-2">
                    <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all duration-300">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    )
}
