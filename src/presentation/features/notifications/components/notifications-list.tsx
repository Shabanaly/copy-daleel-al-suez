'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
    getNotificationsAction,
    markAllNotificationsAsReadAction,
    markNotificationAsReadAction,
    Notification
} from '@/actions/notifications.actions'
import { NotificationItem } from './notification-item'
import { Button } from '@/presentation/components/ui/Button'
import { BellOff, CheckCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationsListProps {
    onClose?: () => void
    onUnreadCountChange?: (count: number) => void
}

export function NotificationsList({ onClose, onUnreadCountChange }: NotificationsListProps) {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        loadNotifications()
    }, [])

    const loadNotifications = async () => {
        setLoading(true)
        const result = await getNotificationsAction(1, 10)
        if (result.success && result.notifications) {
            setNotifications(result.notifications)
        }
        setLoading(false)
    }

    const handleMarkAllRead = () => {
        startTransition(async () => {
            // Optimistic update
            const oldNotifications = [...notifications]
            setNotifications(curr => curr.map(n => ({ ...n, is_read: true })))
            if (onUnreadCountChange) onUnreadCountChange(0) // Reset count immediately

            const result = await markAllNotificationsAsReadAction()
            if (!result.success) {
                setNotifications(oldNotifications) // Revert on error
                // We might want to revert count here too, but it's tricky without knowing previous count exactly. 
                // Usually refreshing from server is better on error.
                toast.error('حدث خطأ أثناء التحديث')
            } else {
                router.refresh()
            }
        })
    }

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read if not already
        if (!notification.is_read) {
            startTransition(async () => {
                // Optimistic UI update
                setNotifications(curr => curr.map(n => n.id === notification.id ? { ...n, is_read: true } : n))

                // Decrement count optimistically
                if (onUnreadCountChange) {
                    onUnreadCountChange(Math.max(0, notifications.filter(n => !n.is_read && n.id !== notification.id).length))
                }

                await markNotificationAsReadAction(notification.id)
                router.refresh()
            })
        }

        // Navigate based on data or type
        if (onClose) onClose()

        if (notification.data?.url) {
            router.push(notification.data.url)
        }
    }

    return (
        <div className="w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-sm">الإشعارات</h3>
                {notifications.some(n => !n.is_read) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllRead}
                        disabled={isPending}
                        className="text-xs h-7 px-2 text-muted-foreground hover:text-primary"
                    >
                        <CheckCheck size={14} className="ml-1" />
                        قراءة الكل
                    </Button>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {loading ? (
                    <div className="py-8 flex justify-center text-muted-foreground">
                        <Loader2 size={24} className="animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        <BellOff size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">لا توجد إشعارات حالياً</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onClick={() => handleNotificationClick(notification)}
                        />
                    ))
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-8">
                        عرض كل الإشعارات
                    </Button>
                </div>
            )}
        </div>
    )
}
