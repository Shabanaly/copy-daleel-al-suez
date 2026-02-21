'use client'

import { useEffect, useState } from 'react'
import { getUserClaimsAction } from '@/actions/business.actions'
import { BusinessClaim } from '@/domain/entities/business-claim'
import { ShieldCheck, Clock, XCircle, ChevronRight, Building2, LayoutDashboard, PlusCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Place } from '@/domain/entities/place'

export function UserBusinessSection() {
    const [claims, setClaims] = useState<BusinessClaim[]>([])
    const [ownedPlaces, setOwnedPlaces] = useState<Place[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchBusinessData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Fetch Claims
                const claimsData = await getUserClaimsAction()
                setClaims(claimsData)

                // Fetch Owned Places
                const { data: placesData } = await supabase
                    .from('places')
                    .select('*, categories(name), areas(name)')
                    .or(`owner_id.eq.${user.id},created_by.eq.${user.id}`)
                    .in('status', ['active', 'pending'])

                if (placesData) {
                    const mappedPlaces = placesData.map((p: any) => ({
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
                    setOwnedPlaces(mappedPlaces)
                }
            } catch (error) {
                console.error('Error fetching business data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchBusinessData()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-sm font-medium">جاري تحميل البيانات...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* 1. Managed Places */}
            <section className="space-y-4">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Building2 size={20} className="text-primary" />
                        إدارة الأنشطة التجارية
                    </h3>
                    <Link
                        href="/places/new"
                        className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                    >
                        <PlusCircle size={16} />
                        إضافة مكان
                    </Link>
                </div>

                {ownedPlaces.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {ownedPlaces.map((place, index) => (
                            <motion.div
                                key={place.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-card border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden relative border border-border shrink-0">
                                        {place.images?.[0] ? (
                                            <img src={place.images[0]} alt={place.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 size={20} className="absolute inset-0 m-auto text-muted-foreground opacity-50" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className="font-bold text-foreground text-sm truncate">{place.name}</h4>
                                            {place.status === 'pending' && (
                                                <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-bold">قيد المراجعة</span>
                                            )}
                                            {place.isVerified && (
                                                <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-bold">موثق</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate">
                                            {place.categoryName} • {place.areaName}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/business/dashboard/${place.id}`}
                                            className="h-8 w-8 md:w-auto md:px-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5"
                                            title="لوحة التحكم"
                                        >
                                            <LayoutDashboard size={14} />
                                            <span className="hidden md:inline text-[11px] font-bold">الإدارة</span>
                                        </Link>
                                        <Link
                                            href={`/places/${place.slug}`}
                                            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                            title="عرض"
                                        >
                                            <ChevronRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border">
                        <Building2 size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-medium text-muted-foreground">لا توجد أنشطة تجارية بعد</p>
                    </div>
                )}
            </section>

            {/* 2. Claim Requests */}
            {claims.length > 0 && (
                <section className="space-y-4 pt-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2 px-1">
                        <ShieldCheck size={20} className="text-primary" />
                        طلبات التوثيق
                    </h3>
                    <div className="space-y-3">
                        {claims.map((claim, index) => (
                            <motion.div
                                key={claim.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-muted/30 border border-border rounded-xl p-4 flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${claim.status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                        claim.status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                            'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {claim.status === 'pending' ? <Clock size={20} /> :
                                            claim.status === 'approved' ? <ShieldCheck size={20} /> :
                                                <XCircle size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">
                                            {ownedPlaces.find(p => p.id === claim.placeId)?.name || 'طلب توثيق'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] bg-background px-2 py-0.5 rounded border border-border">
                                                {claim.status === 'pending' ? 'قيد المراجعة' :
                                                    claim.status === 'approved' ? 'تم القبول' : 'مرفوض'}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(claim.createdAt).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {claim.status === 'rejected' && claim.rejectionReason && (
                                    <div className="hidden lg:block flex-1 max-w-md bg-red-50 dark:bg-red-900/10 p-2 rounded-lg text-xs text-red-600 dark:text-red-400">
                                        <strong>سبب الرفض:</strong> {claim.rejectionReason}
                                    </div>
                                )}

                                <ChevronRight size={18} className="text-muted-foreground opacity-30" />
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
