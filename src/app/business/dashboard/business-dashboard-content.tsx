'use client'

import React from 'react'
import { Place } from '@/domain/entities/place'
import { BusinessClaim } from '@/domain/entities/business-claim'
import { User } from '@supabase/supabase-js'
import { ShieldCheck, Clock, XCircle, ChevronRight, Building2, LayoutDashboard, PlusCircle, Store, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Props {
    initialPlaces: any[]
    initialClaims: any[]
    user: User
}

export function BusinessDashboardContent({ initialPlaces, initialClaims, user }: Props) {
    const ownedPlaces = initialPlaces.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        images: p.images || [],
        categoryName: p.categories?.name,
        areaName: p.areas?.name,
        isVerified: p.is_verified,
        isClaimed: p.is_claimed,
        status: p.status
    } as unknown as Place))

    const claims = initialClaims.map(c => ({
        id: c.id,
        placeId: c.place_id,
        userId: c.user_id,
        status: c.status,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        adminNotes: c.admin_notes,
        rejectionReason: c.rejection_reason
    } as unknown as BusinessClaim))

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header / Breadcrumb */}
            <div className="mb-8 flex items-center gap-3">
                <Link href="/profile" className="p-2 -mx-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowRight size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                        <Building2 className="text-primary hidden sm:block" size={28} />
                        لوحة أنشطتي
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">أدر محلاتك التجارية، إعلاناتك، وتابع طلبات التوثيق من مكان واحد</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Managed Places & Claims */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Managed Places */}
                    <section className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                الأنشطة الخاصة بك
                            </h3>
                            <Link
                                href="/places/new"
                                className="text-primary bg-primary/10 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors"
                            >
                                <PlusCircle size={16} />
                                إضافة مكان جديد
                            </Link>
                        </div>

                        {ownedPlaces.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {ownedPlaces.map((place, index) => (
                                    <motion.div
                                        key={place.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-muted/30 border border-border rounded-2xl p-3 md:p-4 hover:bg-muted/50 transition-all group relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-4"
                                    >
                                        <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                                            <div className="w-16 h-16 rounded-xl bg-background overflow-hidden relative border border-border shrink-0 shadow-sm">
                                                {place.images?.[0] ? (
                                                    <img src={place.images[0]} alt={place.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 size={24} className="absolute inset-0 m-auto text-muted-foreground opacity-30" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-foreground text-base truncate">{place.name}</h4>
                                                    {place.status === 'pending' && (
                                                        <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md font-bold">قيد المراجعة</span>
                                                    )}
                                                    {place.isVerified && (
                                                        <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-md font-bold">موثق</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {place.categoryName} • {place.areaName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0 mt-3 sm:mt-0">
                                            <Link
                                                href={`/business/dashboard/${place.id}`}
                                                className="flex-1 sm:flex-none h-10 px-4 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-sm"
                                            >
                                                <LayoutDashboard size={16} />
                                                لوحة التحكم
                                            </Link>
                                            <Link
                                                href={`/places/${place.slug}`}
                                                className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background border border-border rounded-xl transition-colors"
                                                title="عرض في الموقع"
                                            >
                                                <ChevronRight size={18} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-border">
                                    <Building2 size={24} className="text-muted-foreground opacity-50" />
                                </div>
                                <h4 className="text-base font-bold mb-1">لا توجد أنشطة تجارية مسجلة</h4>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
                                    أضف نشاطك التجاري الآن لتصل إلى آلاف العملاء في السويس وتدير تواجدك بسهولة.
                                </p>
                                <Link
                                    href="/places/new"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                >
                                    <PlusCircle size={18} />
                                    أضف مكانك الأول
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* Pending Claims */}
                    {claims.length > 0 && (
                        <section className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                                <ShieldCheck size={20} className="text-primary hidden sm:block" />
                                طلبات التوثيق والملكية
                            </h3>
                            <div className="space-y-3">
                                {claims.map((claim, index) => (
                                    <motion.div
                                        key={claim.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-muted/30 border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl shrink-0 ${claim.status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                                claim.status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {claim.status === 'pending' ? <Clock size={20} /> :
                                                    claim.status === 'approved' ? <ShieldCheck size={20} /> :
                                                        <XCircle size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-foreground">
                                                    {ownedPlaces.find(p => p.id === claim.placeId)?.name || 'طلب توثيق لمكان'}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold border ${claim.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                        claim.status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                            'bg-red-500/10 text-red-600 border-red-500/20'
                                                        }`}>
                                                        {claim.status === 'pending' ? 'قيد المراجعة' :
                                                            claim.status === 'approved' ? 'تم القبول والتوثيق' : 'مرفوض'}
                                                    </span>
                                                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                                                        بتاريخ {new Date(claim.createdAt).toLocaleDateString('ar-EG')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {claim.status === 'rejected' && claim.rejectionReason && (
                                            <div className="w-full md:w-auto flex-1 max-w-md bg-red-50 dark:bg-red-900/10 p-3 rounded-xl text-xs sm:text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                                                <strong>سبب الرفض:</strong> {claim.rejectionReason}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar: Cross-links to Marketplace */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg sticky top-24">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <Store size={24} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">إعلاناتك في السوق</h3>
                        <p className="text-white/80 text-sm mb-6 leading-relaxed">
                            هل تبيع منتجات أو تقدم عروضاً خاصة؟ أدر إعلاناتك في سوق السويس وتابع المشاهدات والرسائل.
                        </p>
                        <Link
                            href="/marketplace/my-items"
                            className="bg-white/10 hover:bg-white text-white hover:text-indigo-600 backdrop-blur-md border border-white/20 w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all group"
                        >
                            <span>إدارة الإعلانات</span>
                            <ChevronRight size={18} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                        <h4 className="font-bold text-sm mb-3">تحتاج إلى مساعدة؟</h4>
                        <ul className="text-sm space-y-2 text-muted-foreground">
                            <li><Link href="/about/how-to-add-place" className="hover:text-primary transition-colors">مربع كيف أضيف مكاني؟</Link></li>
                            <li><Link href="/about/verification" className="hover:text-primary transition-colors">ما هو توثيق الأماكن؟</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
