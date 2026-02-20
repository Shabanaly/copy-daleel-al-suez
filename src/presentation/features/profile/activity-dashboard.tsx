'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/ui/card'
import { getUserStatistics, getReviewsByMonth, getCategoryBreakdown } from '@/actions/user-stats.actions'
import { Loader2, Star, MessageSquare, Heart, ThumbsUp, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface UserStats {
    total_reviews: number;
    avg_rating: number;
    total_favorites: number;
    helpful_votes: number;
}

interface MonthlyReview {
    month: string;
    reviews_count: number;
    avg_rating: number | string;
}

interface CategoryBreakdown {
    name: string;
    count: number;
}

export function ActivityDashboard() {
    const [stats, setStats] = useState<UserStats | null>(null)
    const [monthlyReviews, setMonthlyReviews] = useState<MonthlyReview[]>([])
    const [categories, setCategories] = useState<CategoryBreakdown[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, monthlyData, categoriesData] = await Promise.all([
                    getUserStatistics(),
                    getReviewsByMonth(),
                    getCategoryBreakdown()
                ])
                setStats(statsData)
                setMonthlyReviews(monthlyData)
                setCategories(categoriesData)
            } catch (error) {
                console.error('Failed to fetch stats', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/20">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div className="text-2xl font-bold">{stats.total_reviews}</div>
                        <div className="text-xs text-muted-foreground">مراجعة</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full dark:bg-yellow-900/20">
                            <Star className="h-6 w-6" />
                        </div>
                        <div className="text-2xl font-bold">{Number(stats.avg_rating).toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">متوسط التقييم</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="p-3 bg-red-100 text-red-600 rounded-full dark:bg-red-900/20">
                            <Heart className="h-6 w-6" />
                        </div>
                        <div className="text-2xl font-bold">{stats.total_favorites}</div>
                        <div className="text-xs text-muted-foreground">مكان مفضل</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full dark:bg-green-900/20">
                            <ThumbsUp className="h-6 w-6" />
                        </div>
                        <div className="text-2xl font-bold">{stats.helpful_votes}</div>
                        <div className="text-xs text-muted-foreground">صوت مفيد</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Monthly Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            النشاط الشهري
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {monthlyReviews.length > 0 ? (
                            <div className="space-y-4">
                                {monthlyReviews.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="text-sm font-medium">
                                            {format(new Date(item.month), 'MMMM yyyy', { locale: ar })}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Star className="h-3 w-3 fill-current text-yellow-500" />
                                                {Number(item.avg_rating).toFixed(1)}
                                            </div>
                                            <div className="text-sm font-bold bg-muted px-2 py-1 rounded">
                                                {item.reviews_count} مراجعة
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                لا يوجد نشاط حتى الآن
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Categories Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">توزيع الفئات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categories.length > 0 ? (
                            <div className="space-y-3">
                                {categories.map((cat, index) => {
                                    const total = categories.reduce((acc, c) => acc + c.count, 0)
                                    const percentage = Math.round((cat.count / total) * 100)

                                    return (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{cat.name}</span>
                                                <span className="text-muted-foreground">{cat.count} ({percentage}%)</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                لا توجد بيانات كافية
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
