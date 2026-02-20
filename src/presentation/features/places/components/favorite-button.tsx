'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleFavoriteAction, checkIsFavoriteAction } from '@/actions/favorites.actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner' // Added toast import

interface FavoriteButtonProps {
    id: string
    type?: 'place' | 'ad'
    initialIsFavorite?: boolean
    className?: string
    size?: number
}

export function FavoriteButton({ id, type = 'place', initialIsFavorite = false, className, size = 20 }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Always check the actual favorite status from the database
        const checkFavoriteStatus = async () => {
            const status = await checkIsFavoriteAction(id, type)
            setIsFavorite(status)
        }
        checkFavoriteStatus()
    }, [id, type])

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (loading) return

        // Optimistic update
        const newState = !isFavorite
        setIsFavorite(newState)
        setLoading(true)

        try {
            toast.loading(newState ? 'جاري الإضافة...' : 'جاري الحذف...', { id: 'fav-action' })
            await toggleFavoriteAction(id, newState, type)
            toast.success(newState ? 'تمت الإضافة للمفضلة ✅' : 'تم الحذف من المفضلة ✅', { id: 'fav-action' })
        } catch (error: unknown) {
            // Revert
            setIsFavorite(!newState)
            toast.dismiss('fav-action')
            if (error instanceof Error && error.message.includes('تسجيل الدخول')) {
                router.push('/login')
            } else {
                toast.error(error instanceof Error ? error.message : 'فشل تحديث المفضلة')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "transition-all duration-200 backdrop-blur-sm flex items-center justify-center rounded-full",
                !className && "p-2",
                !className && (isFavorite
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-white/80 text-gray-500 hover:bg-white hover:text-red-500"),
                className,
                isFavorite && className && (type === 'ad' ? "text-red-500" : "text-red-500 bg-red-50 border-red-200")
            )}
            disabled={loading}
        >
            <Heart size={size} className={cn("transition-all", isFavorite && "fill-current")} />
        </button>
    )
}
