'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
    rating: number
    maxRating?: number
    size?: 'sm' | 'md' | 'lg'
    interactive?: boolean
    onChange?: (rating: number) => void
}

const sizeMap = {
    sm: 16,
    md: 20,
    lg: 24,
}

export function StarRating({
    rating,
    maxRating = 5,
    size = 'md',
    interactive = false,
    onChange,
}: StarRatingProps) {
    const starSize = sizeMap[size]

    const handleClick = (value: number) => {
        if (interactive && onChange) {
            onChange(value)
        }
    }

    return (
        <div className="flex items-center gap-1">
            {[...Array(maxRating)].map((_, index) => {
                const starValue = index + 1
                const isFilled = starValue <= rating
                const isPartial = !isFilled && starValue - 1 < rating && rating < starValue

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleClick(starValue)}
                        disabled={!interactive}
                        className={cn(
                            interactive && 'cursor-pointer hover:scale-110 transition-transform',
                            !interactive && 'cursor-default'
                        )}
                    >
                        <Star
                            size={starSize}
                            className={cn(
                                isFilled && 'fill-yellow-400 text-yellow-400',
                                isPartial && 'fill-yellow-200 text-yellow-400',
                                !isFilled && !isPartial && 'text-gray-300 dark:text-gray-600'
                            )}
                        />
                    </button>
                )
            })}
        </div>
    )
}
