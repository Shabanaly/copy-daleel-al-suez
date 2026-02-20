'use client'

import { Notification } from '@/actions/notifications.actions'
import { cn } from '@/lib/utils'
import { Bell, CheckCircle, AlertTriangle, MessageSquare, Heart, Info, XCircle, ShoppingBag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { arEG } from 'date-fns/locale'

interface NotificationItemProps {
    notification: Notification
    onClick?: () => void
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
    // Icon mapping based on notification type
    const getIcon = () => {
        switch (notification.type) {
            case 'marketplace_approve':
                return <CheckCircle size={16} className="text-green-500" />
            case 'marketplace_reject':
                return <XCircle size={16} className="text-red-500" />
            case 'marketplace_sold':
                return <ShoppingBag size={16} className="text-blue-500" />
            case 'system_alert':
                return <AlertTriangle size={16} className="text-amber-500" />
            case 'community_comment':
                return <MessageSquare size={16} className="text-purple-500" />
            case 'community_like':
                return <Heart size={16} className="text-pink-500" />
            default:
                return <Bell size={16} className="text-primary" />
        }
    }

    // Helper to format date safely
    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: arEG })
        } catch (e) {
            return 'الآن'
        }
    }

    return (
        <div
            onClick={onClick}
            className={cn(
                "flex gap-3 p-3 rounded-lg transition-colors cursor-pointer relative group",
                notification.is_read ? "bg-background hover:bg-muted/50" : "bg-primary/5 hover:bg-primary/10"
            )}
        >
            <div className="shrink-0 mt-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                {getIcon()}
            </div>

            <div className="flex-1 space-y-1 overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium leading-none truncate", !notification.is_read && "font-bold")}>
                        {notification.title}
                    </p>
                    {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notification.message}
                </p>

                <p className="text-[10px] text-muted-foreground/80 pt-1">
                    {formatDate(notification.created_at)}
                </p>
            </div>
        </div>
    )
}
