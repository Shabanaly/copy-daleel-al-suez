'use client'

import { useEffect, useState } from 'react'
import { getNotificationsAction, markNotificationAsReadAction, markAllNotificationsAsReadAction, Notification } from '@/actions/notifications.actions'
import { Bell, Loader2, CheckCircle2, MessageCircle, AlertCircle, Info, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function UserNotificationsSection() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [markingAll, setMarkingAll] = useState(false)

    const fetchNotifications = async () => {
        try {
            const res = await getNotificationsAction(1, 20)
            if (res.success && res.notifications) {
                setNotifications(res.notifications)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const handleMarkAsRead = async (id: string) => {
        try {
            const res = await markNotificationAsReadAction(id)
            if (res.success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            }
        } catch (error) {
            toast.error('فشل تحديث التنبيه')
        }
    }

    const handleMarkAllRead = async () => {
        setMarkingAll(true)
        try {
            const res = await markAllNotificationsAsReadAction()
            if (res.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                toast.success('تم تحديد الكل كمقروء')
            }
        } catch (error) {
            toast.error('فشل تحديث التنبيهات')
        } finally {
            setMarkingAll(false)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'claim_approved':
            case 'success':
                return <CheckCircle2 size={18} className="text-green-500" />
            case 'review_reply':
            case 'message':
                return <MessageCircle size={18} className="text-blue-500" />
            case 'error':
                return <AlertCircle size={18} className="text-red-500" />
            default:
                return <Info size={18} className="text-primary" />
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">جاري تحميل التنبيهات...</p>
            </div>
        )
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                <Bell size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium text-foreground">لا توجد تنبيهات حالياً</p>
                <p className="text-sm text-muted-foreground mt-1">سنخطرك بأي تحديثات مهمة هنا</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold flex items-center gap-2">
                    <Bell size={18} className="text-primary" />
                    تنبيهاتك ({unreadCount} غير مقروء)
                </h3>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markingAll}
                        className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
                    >
                        {markingAll ? 'جاري التحديث...' : 'تحديد الكل كمقروء'}
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {notifications.map((notification, index) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${notification.is_read
                            ? 'bg-card border-border opacity-70'
                            : 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/5'
                            }`}
                    >
                        <div className="flex gap-4">
                            <div className="mt-1">{getIcon(notification.type)}</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm font-bold ${notification.is_read ? 'text-foreground' : 'text-primary uppercase tracking-tight'}`}>
                                        {notification.title}
                                    </h4>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        {new Date(notification.created_at).toLocaleDateString('ar-EG', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
                            </div>
                            {!notification.is_read && (
                                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
