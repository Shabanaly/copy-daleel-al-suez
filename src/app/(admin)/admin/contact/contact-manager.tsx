'use client';

import { useState, useTransition } from 'react';
import {
    getContactMessagesAction,
    markContactMessageAsReadAction,
    deleteContactMessageAction
} from '@/actions/notifications.actions';
import {
    Mail,
    MailOpen,
    Trash2,
    Clock,
    User,
    AtSign,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Filter,
    MessageSquare,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    ip_address: string | null;
    is_read: boolean;
    created_at: string;
}

interface ContactManagerProps {
    initialMessages: ContactMessage[];
    total: number;
}

export function ContactManager({ initialMessages, total }: ContactManagerProps) {
    const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [isPending, startTransition] = useTransition();

    const filteredMessages = messages.filter(msg => {
        if (filter === 'unread') return !msg.is_read;
        if (filter === 'read') return msg.is_read;
        return true;
    });

    const handleToggleRead = (id: string, currentStatus: boolean) => {
        startTransition(async () => {
            const res = await markContactMessageAsReadAction(id, !currentStatus);
            if (res.success) {
                setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: !currentStatus } : m));
                toast.success(!currentStatus ? 'تم التحديد كمقروء' : 'تم التحديد كغير مقروء');
            } else {
                toast.error('فشل تحديث الحالة');
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

        startTransition(async () => {
            const res = await deleteContactMessageAction(id);
            if (res.success) {
                setMessages(prev => prev.filter(m => m.id !== id));
                toast.success('تم حذف الرسالة بنجاح');
            } else {
                toast.error('فشل حذف الرسالة');
            }
        });
    };

    const toggleExpand = (id: string, isRead: boolean) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            if (!isRead) {
                handleToggleRead(id, false);
            }
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-primary" />
                    <h2 className="text-sm font-bold">تصفية الرسائل</h2>
                </div>
                <div className="flex gap-2">
                    {[
                        { id: 'all', label: 'الكل' },
                        { id: 'unread', label: 'غير مقروء' },
                        { id: 'read', label: 'مقروء' },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setFilter(opt.id as any)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                filter === opt.id
                                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredMessages.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                        <MessageSquare size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-medium">لا توجد رسائل تواصل حالياً</p>
                    </div>
                ) : (
                    filteredMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "group bg-card rounded-2xl border transition-all duration-300 overflow-hidden",
                                msg.is_read ? "border-border opacity-80" : "border-primary/30 shadow-sm ring-1 ring-primary/5",
                                expandedId === msg.id && "shadow-lg border-primary/50"
                            )}
                        >
                            <div
                                className="p-4 sm:p-5 flex items-start gap-4 cursor-pointer"
                                onClick={() => toggleExpand(msg.id, msg.is_read)}
                            >
                                {/* Status Icon */}
                                <div className={cn(
                                    "mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                    msg.is_read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                                )}>
                                    {msg.is_read ? <MailOpen size={20} /> : <Mail size={20} className="animate-pulse" />}
                                </div>

                                {/* Summary info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <h3 className={cn(
                                            "text-sm sm:text-base font-black truncate",
                                            !msg.is_read && "text-primary"
                                        )}>
                                            {msg.name}
                                        </h3>
                                        <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                            <Clock size={12} />
                                            {format(new Date(msg.created_at), 'd MMMM yyyy HH:mm', { locale: ar })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] sm:text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1 truncate">
                                            <AtSign size={12} />
                                            {msg.email}
                                        </span>
                                        {msg.ip_address && (
                                            <span className="hidden sm:inline text-[9px] bg-muted px-1.5 py-0.5 rounded uppercase font-mono">
                                                IP: {msg.ip_address}
                                            </span>
                                        )}
                                    </div>
                                    {expandedId !== msg.id && (
                                        <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-1">
                                            {msg.message}
                                        </p>
                                    )}
                                </div>

                                <div className="shrink-0 self-center text-muted-foreground group-hover:text-primary transition-colors">
                                    {expandedId === msg.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedId === msg.id && (
                                <div className="px-4 pb-5 pt-0 sm:px-5 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
                                    <div className="mt-5 p-5 bg-muted/30 rounded-2xl border border-border/50">
                                        <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-wrap">
                                            {msg.message}
                                        </p>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between gap-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggleRead(msg.id, msg.is_read)}
                                                disabled={isPending}
                                                className={cn(
                                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                                    msg.is_read
                                                        ? "bg-muted text-muted-foreground hover:bg-muted/80"
                                                        : "bg-primary/10 text-primary hover:bg-primary/20"
                                                )}
                                            >
                                                <CheckCircle2 size={16} />
                                                {msg.is_read ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                                            </button>
                                            <a
                                                href={`mailto:${msg.email}`}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all"
                                            >
                                                <Mail size={16} />
                                                رد بالبريد
                                            </a>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            disabled={isPending}
                                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                            title="حذف الرسالة"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
