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
                    .eq('owner_id', user.id)
                    .eq('status', 'active')

                if (placesData) {
                    // Map to Place entities (simplified for this view)
                    const mappedPlaces = placesData.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        images: p.images || [],
                        categoryName: p.categories?.name,
                        areaName: p.areas?.name,
                        isVerified: p.is_verified,
                        isClaimed: p.is_claimed
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
                <p className="text-muted-foreground text-sm font-medium">جاري تحميل بيانات أعمالك...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* 1. Managed Places (Dashboards) */}
            <section className="space-y-4">
                <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Building2 size={20} className="text-primary" />
                        أماكني الموثقة
                    </h3>
                    <Link
                        href="/places/new"
                        className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                    >
                        <PlusCircle size={16} />
                        إضافة مكان جديد
                    </Link>
                </div>

                {ownedPlaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ownedPlaces.map((place, index) => (
                            <motion.div
                                key={place.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden relative border border-border">
                                        {place.images?.[0] ? (
                                            <img src={place.images[0]} alt={place.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 size={24} className="absolute inset-0 m-auto text-muted-foreground opacity-50" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-foreground truncate">{place.name}</h4>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            {place.categoryName} • {place.areaName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Link
                                                href={`/business/dashboard/${place.id}`}
                                                className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                                            >
                                                <LayoutDashboard size={14} />
                                                لوحة التحكم
                                            </Link>
                                            <Link
                                                href={`/places/${place.slug}`}
                                                className="text-muted-foreground hover:text-foreground text-xs font-medium px-2 py-1.5 transition-colors"
                                            >
                                                عرض الصفحة
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border">
                        <Building2 size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium text-muted-foreground">ليس لديك أماكن موثقة حالياً</p>
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
