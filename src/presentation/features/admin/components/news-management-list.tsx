'use client'

import { useState, useTransition } from 'react'
import { Newspaper, Calendar, Plus, Trash2, Edit, CheckCircle, XCircle, Eye, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { deleteArticleAction, deleteEventAction, toggleArticlePublishAction } from '@/actions/admin-news.actions'
import { Button } from '@/presentation/ui/button'
import { Badge } from '@/presentation/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
    initialArticles: any[]
    initialEvents: any[]
}

export function NewsManagementList({ initialArticles, initialEvents }: Props) {
    const [tab, setTab] = useState<'news' | 'events'>('news')
    const [isPending, startTransition] = useTransition()

    const handleDeleteArticle = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return
        startTransition(async () => {
            const result = await deleteArticleAction(id)
            if (result.success) toast.success('تم حذف المقال بنجاح')
            else toast.error(result.error)
        })
    }

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الفعالية؟')) return
        startTransition(async () => {
            const result = await deleteEventAction(id)
            if (result.success) toast.success('تم حذف الفعالية بنجاح')
            else toast.error(result.error)
        })
    }

    const handleTogglePublish = async (id: string, current: boolean) => {
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
                            "px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                            tab === 'news' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Newspaper size={16} />
                        المقالات والأخبار ({initialArticles.length})
                    </button>
                    <button
                        onClick={() => setTab('events')}
                        className={cn(
                            "px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
                            tab === 'events' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Calendar size={16} />
                        الفعاليات ({initialEvents.length})
                    </button>
                </div>
                <Button className="mb-2">
                    <Plus size={16} className="ml-2" />
                    إضافة جديد
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tab === 'news' ? (
                    initialArticles.map((article) => (
                        <div key={article.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center">
                            <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                                {article.cover_image_url && <img src={article.cover_image_url} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm truncate">{article.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    <span>{article.category}</span>
                                    <span>•</span>
                                    <span>{new Date(article.created_at).toLocaleDateString('ar-EG')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={article.is_published ? "default" : "secondary"}>
                                    {article.is_published ? 'منشور' : 'مسودة'}
                                </Badge>
                                <Button variant="ghost" size="icon" onClick={() => handleTogglePublish(article.id, article.is_published)}>
                                    {article.is_published ? <XCircle size={16} className="text-amber-600" /> : <CheckCircle size={16} className="text-green-600" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteArticle(article.id)}>
                                    <Trash2 size={16} className="text-rose-500" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    initialEvents.map((event) => (
                        <div key={event.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center">
                            <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                                {event.image_url && <img src={event.image_url} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm truncate">{event.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(event.start_date).toLocaleDateString('ar-EG')}</span>
                                    <span>•</span>
                                    <span>{event.places?.name || 'موقع عام'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={event.status === 'active' ? "default" : "secondary"}>
                                    {event.status === 'active' ? 'نشط' : 'متوقف'}
                                </Badge>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                                    <Trash2 size={16} className="text-rose-500" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
