'use client'

import Link from 'next/link'
import { Category } from '@/domain/entities/category'
import { CategoryIcon } from '@/presentation/features/categories/components/category-icon'
import { cn } from '@/lib/utils'
import { getCategoryColor } from '@/presentation/features/categories/utils/category-colors'

interface CategoriesBarProps {
    categories: Category[]
}

export function CategoriesBar({ categories }: CategoriesBarProps) {
    return (
        <div className="w-full bg-background/95 backdrop-blur-md border-b border-border sticky top-16 z-40 transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5 md:py-2 scroll-smooth">
                    {categories.map((category) => {
                        const colors = getCategoryColor(category.id)
                        return (
                            <Link
                                key={category.id}
                                href={`/categories/${category.slug || '#'}`}
                                className="group flex flex-col items-center gap-1 px-3 md:px-5 py-0.5 min-w-fit transition-all duration-200"
                            >
                                <div className={cn(
                                    "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm border",
                                    colors.bg,
                                    colors.border,
                                    "group-hover:shadow-md"
                                )}>
                                    <CategoryIcon
                                        name={category.icon}
                                        size={16}
                                        className={cn(colors.text, "md:w-5 md:h-5")}
                                    />
                                </div>
                                <span className="text-[9px] md:text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors truncate max-w-[70px] md:max-w-[90px]">
                                    {category.name}
                                </span>

                                {/* Bottom Accent Line */}
                                <div className="absolute -bottom-1 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300 rounded-full"></div>
                            </Link>
                        )
                    })}

                    {/* View All Button */}
                    <Link
                        href="/categories"
                        className="group flex flex-col items-center gap-1 px-3 md:px-5 py-0.5 min-w-fit transition-all duration-200"
                    >
                        <div className={cn(
                            "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm border bg-muted border-dashed border-muted-foreground/50 group-hover:bg-primary group-hover:border-primary group-hover:shadow-md"
                        )}>
                            <CategoryIcon
                                name="Grid"
                                size={16}
                                className={cn("text-muted-foreground group-hover:text-primary-foreground md:w-5 md:h-5")}
                            />
                        </div>
                        <span className="text-[9px] md:text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors truncate max-w-[70px] md:max-w-[90px]">
                            عرض الكل
                        </span>

                        {/* Bottom Accent Line */}
                        <div className="absolute -bottom-1 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300 rounded-full"></div>
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}
