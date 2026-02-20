'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Send, Loader2, User, UserCog, MessageSquare } from 'lucide-react'
import { Button } from '@/presentation/ui/button'
import { Textarea } from '@/presentation/ui/textarea'
import { ScrollArea } from '@/presentation/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/presentation/ui/avatar'
import { getTicketMessages, addTicketMessage } from '@/actions/support.actions'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

const categoryMap: Record<string, string> = {
    bug: 'مشكلة تقنية',
    feature: 'اقتراح ميزة',
    account: 'الحساب',
    other: 'أخرى'
}

export interface Ticket {
    id: string
    subject: string
    category: string
    status: string
    created_at: string
    messages?: { count: number }[]
    [key: string]: unknown
}

export interface Message {
    id: string
    sender_id: string
    message: string
    created_at: string
    [key: string]: unknown
}

interface TicketChatProps {
    ticket: Ticket
}

export function TicketChat({ ticket }: TicketChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const viewportRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        if (viewportRef.current) {
            const scrollContainer = viewportRef.current.parentElement; // The Radix Viewport
            if (scrollContainer) {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior
                });
            }
        }
    }, [])

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)
        }
        getUser()
    }, [])

    const fetchMessages = useCallback(async () => {
        try {
            const data = await getTicketMessages(ticket.id)
            setMessages(data as Message[])
            setLoading(false)
        } catch (error: unknown) {
            console.error('Failed to fetch messages', error)
            setLoading(false)
        }
    }, [ticket.id])

    useEffect(() => {
        fetchMessages()

        const supabase = createClient()
        const channel = supabase
            .channel(`ticket_${ticket.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `ticket_id=eq.${ticket.id}`
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages(prev => {
                        if (prev.find(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [ticket.id, fetchMessages])

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages, loading])

    const handleSend = async () => {
        if (!newMessage.trim()) return

        setSending(true)
        try {
            await addTicketMessage(ticket.id, newMessage)
            setNewMessage('')
            await fetchMessages()
        } catch (error: unknown) {
            console.error('Failed to send message', error)
            alert(error instanceof Error ? error.message : 'فشل إرسال الرسالة')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-lg bg-background shadow-sm">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                <div>
                    <h3 className="font-bold break-words line-clamp-2 text-sm md:text-base">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                        {categoryMap[ticket.category] || ticket.category} • #{ticket.id.substring(0, 8)}
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${ticket.status === 'closed' || ticket.status === 'resolved'
                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                    : 'bg-primary/10 text-primary border-primary/20'
                    }`}>
                    {ticket.status === 'open' ? 'مفتوح' :
                        ticket.status === 'in_progress' ? 'قيد المعالجة' :
                            ticket.status === 'resolved' ? 'تم الحل' : 'مغلق'}
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1">
                <div ref={viewportRef} className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full py-12">
                            <Loader2 className="animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground opacity-50">
                            <MessageSquare className="w-12 h-12 mb-4" />
                            <p>لا توجد رسائل بعد</p>
                            <p className="text-xs mt-2">ابدأ المحادثة مع الدعم الفني</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg) => {
                                const isMe = userId === msg.sender_id

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <Avatar className="w-8 h-8 mt-1 border shadow-sm">
                                            <AvatarFallback className={isMe ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-600'}>
                                                {isMe ? <User size={14} /> : <UserCog size={14} />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                            {!isMe && <span className="text-[10px] text-muted-foreground mb-1 mr-1">الدعم الفني</span>}
                                            <div
                                                className={`p-3 rounded-2xl text-sm shadow-sm ${isMe
                                                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-sm'
                                                    }`}
                                            >
                                                <div className="whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                                            </div>
                                            <div className={`text-[10px] mt-1 px-1 opacity-70 text-muted-foreground`}>
                                                {format(new Date(msg.created_at), 'p', { locale: ar })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </ScrollArea >

            {/* Input Area */}
            < div className="p-4 border-t bg-muted/30" >
                {ticket.status === 'closed' || ticket.status === 'resolved' ? (
                    <div className="text-center py-2 text-sm text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                        هذه التذكرة مغلقة. لا يمكنك إرسال مزيد من الرسائل.
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="اكتب رسالتك هنا..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            className="min-h-[50px] max-h-[120px] resize-none"
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={sending || !newMessage.trim()}
                            size="icon"
                            className="h-auto w-12"
                        >
                            {sending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                        </Button>
                    </div>
                )}
            </div >
        </div >
    )
}
