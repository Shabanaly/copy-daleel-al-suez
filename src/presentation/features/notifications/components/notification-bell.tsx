'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUnreadNotificationsCountAction } from '@/actions/notifications.actions'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from '@/presentation/components/ui/dropdown-menu'
import { NotificationsList } from './notifications-list'
import { Bell } from 'lucide-react'
import { Badge } from '@/presentation/components/ui/Badge'
import { Button } from '@/presentation/components/ui/Button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const supabase = createClient()

    useEffect(() => {
        // Initial fetch
        const fetchCount = async () => {
            const result = await getUnreadNotificationsCountAction()
            if (result.success && typeof result.count === 'number') {
                console.log('🔔 Unread count fetched:', result.count)
                setUnreadCount(result.count)
            }
        }
        fetchCount()

        // Realtime Subscription
        const channel = supabase
            .channel('notifications_bell')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for ALL events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'notifications',
                },
                async (payload: any) => {
                    console.log('🔔 Notification realtime event:', payload.eventType)

                    if (payload.eventType === 'INSERT') {
                        // Increment count for new notification
                        setUnreadCount(c => c + 1)

                        // Show toast
                        toast.info(payload.new.title || 'إشعار جديد', {
                            description: payload.new.message,
                            position: 'top-center',
                            icon: <Bell size={16} />,
                            duration: 4000
                        })
                    } else {
                        // For UPDATE or DELETE, it's safer to refetch the exact count
                        // (e.g. if marked as read in another tab)
                        const result = await getUnreadNotificationsCountAction()
                        if (result.success && typeof result.count === 'number') {
                            setUnreadCount(result.count)
                        }
                    }

                    // Refresh data if needed (e.g. if we want to update the list background)
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router])

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative w-10 h-10 rounded-full p-0 hover:bg-muted transition-colors overflow-visible">
                    <Bell size={22} className={cn("text-muted-foreground transition-colors", unreadCount > 0 && "text-foreground")} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 z-50 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in duration-200">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[340px] p-0 rounded-xl overflow-hidden shadow-lg border-border/60" sideOffset={8}>
                <NotificationsList onClose={() => setIsOpen(false)} onUnreadCountChange={setUnreadCount} />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
