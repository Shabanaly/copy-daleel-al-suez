'use client'

import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { MessageSquare, Clock, CheckCircle2, AlertCircle, LucideIcon } from 'lucide-react'
import { Badge } from '@/presentation/ui/badge'
import { Card } from '@/presentation/ui/card'
import { CreateTicketDialog } from './create-ticket-dialog'
import { TicketChat, Ticket } from './ticket-chat' // Will create this next
import { useState, useEffect } from 'react'

const categoryMap: Record<string, string> = {
    bug: 'مشكلة تقنية',
    feature: 'اقتراح ميزة',
    account: 'الحساب',
    other: 'أخرى'
}

const statusMap: Record<string, { label: string, color: string, icon: LucideIcon }> = {
    open: { label: 'مفتوحة', color: 'bg-blue-500', icon: AlertCircle },
    in_progress: { label: 'قيد المعالجة', color: 'bg-yellow-500', icon: Clock },
    resolved: { label: 'تم الحل', color: 'bg-green-500', icon: CheckCircle2 },
    closed: { label: 'مغلقة', color: 'bg-gray-500', icon: CheckCircle2 },
}

interface SupportListProps {
    tickets: Ticket[] // Changed from Record<string, any>[]
    initialTicketId?: string | null
}

export function SupportList({ tickets, initialTicketId }: SupportListProps) {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

    // Auto-select ticket from URL
    useEffect(() => {
        if (initialTicketId && tickets.length > 0 && !selectedTicket) {
            const ticket = tickets.find(t => t.id === initialTicketId)
            if (ticket) {
                // Use a tick to avoid "setState in effect" warning
                const timer = setTimeout(() => {
                    setSelectedTicket(ticket)
                }, 0)
                return () => clearTimeout(timer)
            }
        }
    }, [initialTicketId, tickets, selectedTicket])

    if (selectedTicket) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => setSelectedTicket(null)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        ← العودة للقائمة
                    </button>
                </div>
                <TicketChat ticket={selectedTicket} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">الدعم الفني</h2>
                    <p className="text-muted-foreground mt-1">
                        تواصل معنا لحل مشاكلك أو تقديم اقتراحاتك
                    </p>
                </div>
                <CreateTicketDialog />
            </div>

            {tickets.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/30 border-dashed">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">لا توجد تذاكر</h3>
                    <p className="text-sm">لم تقم بإنشاء أي تذاكر دعم فني بعد</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket) => {
                        const status = statusMap[ticket.status] || statusMap.open
                        const StatusIcon = status.icon

                        return (
                            <Card
                                key={ticket.id}
                                className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                                onClick={() => setSelectedTicket(ticket)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-base md:text-lg break-words">{ticket.subject}</h3>
                                            <Badge variant="outline" className={`${status.color} bg-opacity-10 text-${status.color?.replace('bg-', '') || 'gray-500'} border-0`}>
                                                <StatusIcon size={12} className="mr-1" />
                                                {status.label}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-muted-foreground">
                                            <span>#{ticket.id.substring(0, 8)}</span>
                                            <span>•</span>
                                            <span>{categoryMap[ticket.category] || ticket.category}</span>
                                            <span>•</span>
                                            <span dir="ltr">
                                                {format(new Date(ticket.created_at), 'PPP p', { locale: ar })}
                                            </span>
                                        </div>
                                    </div>
                                    {ticket.messages && ticket.messages[0]?.count > 0 && (
                                        <Badge variant="secondary" className="gap-1">
                                            <MessageSquare size={12} />
                                            {ticket.messages[0].count}
                                        </Badge>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
