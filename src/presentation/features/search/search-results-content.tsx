'use client'

import { useEffect, useState, useMemo } from 'react'
import useSWR from 'swr'
import { useSearchParams, useRouter } from 'next/navigation'
import { searchPlacesAndEvents, SearchResult } from '@/actions/search.actions'
import { Loader2, Search, Store, Calendar, FileText, Filter, ArrowLeft, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import NextImage from 'next/image'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
    vehicles: 'سيارات ومركبات',
    real_estate: 'عقارات',
    mobiles: 'موبايلات وتابلت',
    computers: 'كمبيوتر ولابتوب',
    appliances: 'أجهزة منزلية',
    furniture: 'أثاث وديكور',
    fashion: 'ملابس وموضة',
    pets: 'حيوانات أليفة',
    hobbies: 'هوايات وترفيه',
    services: 'خدمات',
    jobs: 'وظائف',
    education: 'تعليم'
};

export function SearchResultsContent({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const search = useSearchParams()
    const router = useRouter()
    const query = search.get('search') || ''
    const areaId = search.get('area')

    // Active Tab State: 'all', 'places', 'events', 'articles'
    const [activeTab, setActiveTab] = useState<'all' | 'places' | 'events' | 'articles'>('all')

    const { data: results = [], isLoading: loading } = useSWR(
        query ? ['search-results', query, areaId || 'all'] : null,
        ([, q, a]) => searchPlacesAndEvents(q, a === 'all' ? undefined : a),
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000
        }
    )

    // Derived states
    const places = useMemo(() => results.filter((r: SearchResult) => r.type === 'place'), [results])
    const events = useMemo(() => results.filter((r: SearchResult) => r.type === 'event'), [results])
    const articles = useMemo(() => results.filter((r: SearchResult) => r.type === 'article'), [results])

    if (!query) return <EmptySearchState />
    if (loading) return <LoadingState query={query} />
    if (results.length === 0) return <NoResultsState query={query} router={router} />

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            {/* Search Header */}
            <div className="bg-background/95 backdrop-blur-sm sticky top-16 z-30 pt-4 pb-2 border-b border-border/40 -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide touch-pan-x">
                    <FilterButton
                        label="الكل"
                        count={results.length}
                        isActive={activeTab === 'all'}
                        onClick={() => setActiveTab('all')}
                    />
                    <FilterButton
                        label="أماكن"
                        count={places.length}
                        isActive={activeTab === 'places'}
                        icon={<Store size={14} />}
                        onClick={() => setActiveTab('places')}
                    />
                    <FilterButton
                        label="فعاليات"
                        count={events.length}
                        isActive={activeTab === 'events'}
                        icon={<Calendar size={14} />}
                        onClick={() => setActiveTab('events')}
                    />
                    <FilterButton
                        label="أخبار"
                        count={articles.length}
                        isActive={activeTab === 'articles'}
                        icon={<FileText size={14} />}
                        onClick={() => setActiveTab('articles')}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="py-2">
                {activeTab === 'all' && (
                    <div className="space-y-10">
                        {places.length > 0 && (
                            <ResultSection
                                title="أماكن"
                                icon={<Store className="text-green-500" />}
                                items={places.slice(0, 4)}
                                onSeeAll={() => setActiveTab('places')}
                            />
                        )}

                        {events.length > 0 && (
                            <>
                                <hr className="border-border/50" />
                                <ResultSection
                                    title="فعاليات"
                                    icon={<Calendar className="text-orange-500" />}
                                    items={events.slice(0, 4)}
                                    onSeeAll={() => setActiveTab('events')}
                                    type="event"
                                />
                            </>
                        )}

                        {articles.length > 0 && (
                            <>
                                <hr className="border-border/50" />
                                <ResultSection
                                    title="أخبار"
                                    icon={<FileText className="text-blue-500" />}
                                    items={articles.slice(0, 4)}
                                    onSeeAll={() => setActiveTab('articles')}
                                    type="article"
                                />
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'places' && (
                    places.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
                            {places.map((place: SearchResult) => <SearchResultCard key={place.id} result={place} />)}
                        </div>
                    ) : (
                        <NoCategoryResultsState label="أماكن" query={query} />
                    )
                )}

                {activeTab === 'events' && (
                    events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
                            {events.map((event: SearchResult) => <SearchResultCard key={event.id} result={event} />)}
                        </div>
                    ) : (
                        <NoCategoryResultsState label="فعاليات" query={query} />
                    )
                )}

                {activeTab === 'articles' && (
                    articles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
                            {articles.map((article: SearchResult) => <SearchResultCard key={article.id} result={article} />)}
                        </div>
                    ) : (
                        <NoCategoryResultsState label="أخبار" query={query} />
                    )
                )}
            </div>
        </div>
    )
}

// --- Sub Components ---

interface FilterButtonProps {
    label: string
    count: number
    isActive: boolean
    onClick: () => void
    icon?: React.ReactNode
}

function FilterButton({ label, count, isActive, onClick, icon }: FilterButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap border scale-100 active:scale-95",
                isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:border-primary/30"
            )}
        >
            {icon && <span className={cn(isActive ? "text-primary-foreground" : "text-primary")}>{icon}</span>}
            {label}
            {count > 0 && (
                <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                )}>
                    {count}
                </span>
            )}
        </button>
    )
}

interface ResultSectionProps {
    title: string
    icon: React.ReactNode
    items: SearchResult[]
    onSeeAll: () => void
    type?: string
}

function ResultSection({ title, icon, items, onSeeAll, type = 'place' }: ResultSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-muted/50 rounded-lg">{icon}</div>
                    <h2 className="text-xl font-bold">{title}</h2>
                </div>
                <button
                    onClick={onSeeAll}
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:bg-primary/5 px-3 py-1 rounded-full transition-colors"
                >
                    عرض الكل
                    <ChevronLeft size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item: SearchResult) => (
                    <SearchResultCard key={item.id} result={item} mini={type !== 'place'} />
                ))}
            </div>
        </div>
    )
}

function SearchResultCard({ result, mini = false }: { result: SearchResult, mini?: boolean }) {
    const icon = {
        'place': <Store size={14} className="text-green-600" />,
        'event': <Calendar size={14} className="text-orange-600" />,
        'article': <FileText size={14} className="text-blue-600" />
    }[result.type]

    return (
        <Link href={result.slug} className={cn(
            "group flex flex-col bg-card hover:bg-muted/30 border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full",
            mini ? "text-sm" : ""
        )}>
            <div className={cn("relative w-full overflow-hidden bg-muted", mini ? "aspect-[3/2]" : "aspect-video")}>
                {result.image ? (
                    <NextImage
                        src={result.image}
                        alt={result.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/50 gap-2">
                        {icon}
                    </div>
                )}
                {result.rating && (
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-yellow-400/90 text-yellow-950 text-[10px] font-bold shadow-sm flex items-center gap-0.5">
                        <span>⭐</span>
                        <span>{result.rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            <div className="p-3 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={cn("font-bold line-clamp-1 group-hover:text-primary transition-colors", mini ? "text-sm" : "text-base")}>
                        {result.title}
                    </h3>
                </div>

                {!mini && (
                    <p className="text-muted-foreground text-xs line-clamp-2 mb-3 leading-relaxed">
                        {result.description}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {(result.category && CATEGORY_LABELS[result.category]) || result.category || result.type}
                    </span>
                    <ArrowLeft size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                </div>
            </div>
        </Link>
    )
}

function EmptySearchState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-4">
                <Search size={32} className="opacity-40" />
            </div>
            <h2 className="text-xl font-bold text-foreground">ابحث في السويس</h2>
            <p className="text-sm">اكتب اسم مكان، فعالية، أو خدمة...</p>
        </div>
    )
}

function LoadingState({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">جاري البحث عن &quot;{query}&quot;...</p>
        </div>
    )
}

function NoResultsState({ query, router }: { query: string, router: any }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full mb-4">
                <Search size={32} className="opacity-40" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">لا توجد نتائج</h2>
            <p className="text-sm mb-6">لم نعثر على أي شيء يطابق &quot;{query}&quot;.</p>
            <button onClick={() => router.push('/')} className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-sm font-bold">
                العودة للرئيسية
            </button>
        </div>
    )
}

function NoCategoryResultsState({ label, query }: { label: string, query: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground animate-in fade-in zoom-in duration-500">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
                <Search size={24} className="opacity-30" />
            </div>
            <h2 className="text-lg font-bold text-foreground">لا توجد {label}</h2>
            <p className="text-sm">لم نجد أي {label} تطابق بحثك عن &quot;{query}&quot;</p>
        </div>
    )
}
