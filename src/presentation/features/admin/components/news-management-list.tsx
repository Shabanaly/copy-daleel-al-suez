'use client'

import { useState, useTransition } from 'react'
import { Newspaper, Calendar, Plus, Trash2, Edit, CheckCircle, XCircle, ArrowUp, ArrowDown, Clock } from 'lucide-react'
import { toast } from 'sonner'
import {
    deleteArticleAction,
    deleteEventAction,
    toggleArticlePublishAction,
    updateArticleOrderAction,
    updateArticleAction
} from '@/actions/admin-news.actions'
import { Button } from '@/presentation/ui/button'
import { Badge } from '@/presentation/ui/badge'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog'
import { AddNewsModal } from './add-news-modal'
import { AddEventModal } from './add-event-modal'

interface Props {
    initialArticles: any[]
    initialEvents: any[]
}

export function NewsManagementList({ initialArticles, initialEvents }: Props) {
    const [tab, setTab] = useState<'news' | 'events'>('news')
    const [isPending, startTransition] = useTransition()
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [isAddNewsOpen, setIsAddNewsOpen] = useState(false)
    const [isAddEventOpen, setIsAddEventOpen] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string,
        description: string,
        onConfirm: () => Promise<void>,
        variant: 'danger' | 'warning' | 'primary'
    } | null>(null)

    const handleDeleteArticle = (id: string, title: string) => {
        setConfirmConfig({
            title: 'حذف المقال',
            description: `هل أنت متأكد من حذف مقال "${title}"؟`,
            variant: 'danger',
            onConfirm: async () => {
                const result = await deleteArticleAction(id)
                if (result.success) toast.success('تم حذف المقال بنجاح')
                else toast.error(result.error)
            }
        })
        setConfirmOpen(true)
    }

    const handleDeleteEvent = (id: string, title: string) => {
        setConfirmConfig({
            title: 'حذف الفعالية',
            description: `هل أنت متأكد من حذف فعالية "${title}"؟`,
            variant: 'danger',
            onConfirm: async () => {
                const result = await deleteEventAction(id)
                if (result.success) toast.success('تم حذف الفعالية بنجاح')
                else toast.error(result.error)
            }
        })
        setConfirmOpen(true)
    }

    const handleReorder = async (id: string, currentOrder: number, direction: 'up' | 'down') => {
        startTransition(async () => {
            const newOrder = direction === 'up' ? (currentOrder || 0) - 1 : (currentOrder || 0) + 1
            const result = await updateArticleOrderAction(id, newOrder)
            if (result.success) toast.success('تم تحديث الترتيب')
            else toast.error(result.error)
        })
    }

    const handleTogglePublish = (id: string, current: boolean) => {
        startTransition(async () => {
            const result = await toggleArticlePublishAction(id, current)
            if (result.success) toast.success('تم تحديث حالة النشر')
            else toast.error(result.error)
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border">
                <div className="flex">
                    <button
                        onClick={() => setTab('news')}
                        className={cn(
                            "px-6 py-4 text-xs font-black border-b-2 transition-all flex items-center gap-2 uppercase tracking-wider",
                            tab === 'news' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Newspaper size={16} />
                        المقالات والأخبار ({initialArticles.length})
                    </button>
                    <button
                        onClick={() => setTab('events')}
                        className={cn(
                            "px-6 py-4 text-xs font-black border-b-2 transition-all flex items-center gap-2 uppercase tracking-wider",
                            tab === 'events' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Calendar size={16} />
                        الفعاليات ({initialEvents.length})
                    </button>
                </div>
                <Button
                    onClick={() => tab === 'news' ? setIsAddNewsOpen(true) : setIsAddEventOpen(true)}
                    className="mb-2 h-9 text-[10px] font-black uppercase tracking-widest px-4 rounded-xl"
                >
                    <Plus size={16} className="ml-2" />
                    إضافة {tab === 'news' ? 'خبر' : 'فعالية'}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tab === 'news' ? (
                    initialArticles.map((article, index) => (
                        <div key={article.id} className="bg-card border border-border rounded-2xl p-4 flex gap-4 items-center hover:shadow-md transition-shadow group">
                            <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleReorder(article.id, article.display_order, 'up')}
                                    className="p-1 hover:bg-muted rounded-md text-muted-foreground"
                                >
                                    <ArrowUp size={14} />
                                </button>
                                <button
                                    onClick={() => handleReorder(article.id, article.display_order, 'down')}
                                    className="p-1 hover:bg-muted rounded-md text-muted-foreground"
                                >
                                    <ArrowDown size={14} />
                                </button>
                            </div>

                            <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden shrink-0 border border-border shadow-inner">
                                {article.cover_image_url && <img src={article.cover_image_url} className="w-full h-full object-cover" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-black text-sm truncate">{article.title}</h3>
                                    {article.display_order !== null && (
                                        <Badge variant="outline" className="text-[9px] font-black h-4 px-1.5 opacity-50">#{article.display_order}</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><Badge variant="outline" className="text-[10px]">{article.category || 'عام'}</Badge></span>
                                    <span className="flex items-center gap-1"><Clock size={12} className="text-primary/70" /> {new Date(article.created_at).toLocaleDateString('ar-EG')}</span>
                                    {article.starts_at && (
                                        <span className="text-emerald-600 font-black">تبدأ: {new Date(article.starts_at).toLocaleDateString('ar-EG')}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", article.is_published ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-muted text-muted-foreground")}>
                                    {article.is_published ? 'منشور' : 'مسودة'}
                                </Badge>
                                <div className="h-4 w-[1px] bg-border mx-1" />
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleTogglePublish(article.id, article.is_published)}>
                                    {article.is_published ? <XCircle size={16} className="text-amber-500" /> : <CheckCircle size={16} className="text-green-600" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-50" onClick={() => handleDeleteArticle(article.id, article.title)}>
                                    <Trash2 size={16} className="text-rose-500" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                    <Edit size={16} className="text-muted-foreground" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    initialEvents.map((event) => (
                        <div key={event.id} className="bg-card border border-border rounded-2xl p-4 flex gap-4 items-center hover:shadow-md transition-shadow">
                            <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden shrink-0 border border-border shadow-inner">
                                {event.image_url && <img src={event.image_url} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-sm truncate mb-1">{event.title}</h3>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                    <span className="flex items-center gap-1 font-black text-emerald-600"><Calendar size={12} /> {new Date(event.start_date).toLocaleDateString('ar-EG')}</span>
                                    <span>•</span>
                                    <span className="text-primary">{event.places?.name || 'موقع عام'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", event.status === 'active' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-muted text-muted-foreground")}>
                                    {event.status === 'active' ? 'نشط' : 'متوقف'}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-50" onClick={() => handleDeleteEvent(event.id, event.title)}>
                                    <Trash2 size={16} className="text-rose-500" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                    <Edit size={16} className="text-muted-foreground" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AddNewsModal
                isOpen={isAddNewsOpen}
                onClose={() => setIsAddNewsOpen(false)}
            />

            <AddEventModal
                isOpen={isAddEventOpen}
                onClose={() => setIsAddEventOpen(false)}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmConfig?.onConfirm || (async () => { })}
                title={confirmConfig?.title || ''}
                description={confirmConfig?.description || ''}
                variant={confirmConfig?.variant}
            />
        </div>
    )
}
