'use client'

import { useEffect, useState } from 'react'
import { getBusinessDashboardDataAction } from '@/actions/business.actions'
import { Place } from '@/domain/entities/place'
import {
    LayoutDashboard,
    Eye,
    Star,
    MessageSquare,
    Settings,
    ChevronLeft,
    Building2,
    MapPin,
    Phone,
    Clock,
    Zap,
    Users,
    Loader2,
    ArrowRight,
    ExternalLink,
    Edit3,
    ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { FlashDealsManager } from "./flash-deals-manager";

interface BusinessDashboardProps {
    placeId: string
}

export function BusinessDashboard({ placeId }: BusinessDashboardProps) {
    const [place, setPlace] = useState<Place | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeSection, setActiveSection] = useState<'overview' | 'deals'>('overview')

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await getBusinessDashboardDataAction(placeId)
                if (res.success) {
                    setPlace(res.place)
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'فشل تحميل البيانات')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [placeId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        )
    }

    if (!place) return null

    return (
        <div className="min-h-screen bg-muted/30 pb-20" dir="rtl">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/profile?tab=business" className="p-2 hover:bg-muted rounded-full transition-colors">
                            <ArrowRight size={20} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <LayoutDashboard size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-foreground">لوحة التحكم</h1>
                                <p className="text-xs text-muted-foreground">{place.name}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/places/${place.slug}`}
                            target="_blank"
                            className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all"
                        >
                            <span>عرض المكان</span>
                            <ExternalLink size={14} />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {activeSection === 'overview' ? (
                    <>
                        {/* 1. Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'مشاهدات المكان', value: place.viewCount, icon: Eye },
                                { label: 'متوسط التقييم', value: (place.rating || 0).toFixed(1), icon: Star },
                                { label: 'إجمالي التعليقات', value: place.reviewCount, icon: MessageSquare },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-card border border-border rounded-2xl p-6 shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                            <stat.icon size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground">آخر 30 يوم</span>
                                    </div>
                                    <h4 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h4>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Features Activation */}
                                <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                                    <div className="p-6 border-b border-border bg-primary/5">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Zap size={20} className="text-primary" />
                                            تفعيل الخدمات المتقدمة
                                        </h3>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl border border-border bg-muted/20 hover:border-primary/30 transition-all group">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                                                    <Zap size={24} />
                                                </div>
                                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-500/10 text-orange-600">جديد</span>
                                            </div>
                                            <h4 className="font-bold text-foreground mb-1">العروض اللحظية</h4>
                                            <p className="text-xs text-muted-foreground mb-4">اجذب الزبائن بعروض حصرية ولفترة محدودة تظهر فوراً لمستخدمي التطبيق.</p>
                                            <button
                                                onClick={() => setActiveSection('deals')}
                                                className="w-full py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                                            >
                                                إدارة العروض
                                            </button>
                                        </div>

                                    </div>
                                </section>

                                <section className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-border">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Clock size={20} className="text-primary" />
                                            آخر النشاطات
                                        </h3>
                                    </div>
                                    <div className="p-8 text-center">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                            <MessageSquare size={32} />
                                        </div>
                                        <p className="text-muted-foreground">لا توجد نشاطات جديدة اليوم. سنعرض هنا التقييمات والحجوزات الجديدة.</p>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-6">
                                <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                                    <div className="p-5 border-b border-border flex items-center justify-between">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <Building2 size={18} className="text-primary" />
                                            معلومات المكان
                                        </h3>
                                        <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors">
                                            <Edit3 size={16} />
                                        </button>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <MapPin size={16} className="text-muted-foreground shrink-0" />
                                            <p className="text-xs text-foreground truncate">{place.address}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-muted-foreground shrink-0" />
                                            <p className="text-xs text-foreground">{place.phone}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock size={16} className="text-muted-foreground shrink-0" />
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <span className="font-bold text-green-600">مفتوح</span>
                                                <span className="text-muted-foreground">• حتى 11:00 م</span>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-border">
                                            <h4 className="text-xs font-bold text-muted-foreground mb-3">حالة الظهور</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-xs font-medium">المكان نشط على الخارطة</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent border border-border rounded-2xl transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <Settings size={18} />
                                            </div>
                                            <span className="text-sm font-bold">إعدادات الحساب التجاري</span>
                                        </div>
                                        <ChevronLeft size={16} className="text-muted-foreground" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent border border-border rounded-2xl transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <span className="text-sm font-bold">الدعم الفني والشكاوي</span>
                                        </div>
                                        <ChevronLeft size={16} className="text-muted-foreground" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => setActiveSection('overview')}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <ArrowRight size={20} />
                            </button>
                            <h2 className="text-2xl font-bold">إدارة العروض اللحظية</h2>
                        </div>
                        <FlashDealsManager placeId={placeId} />
                    </div>
                )}
            </main>
        </div>
    )
}
