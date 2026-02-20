'use client'

import Link from 'next/link'
import { User, Calendar, Phone, Share2, Store } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface SellerHeaderProps {
    profile: {
        id?: string
        full_name: string
        avatar_url: string
        created_at: string
        phone?: string
    }
    stats?: {
        totalItems: number
    }
    isOwner?: boolean
    isDashboard?: boolean
}

export function SellerHeader({ profile, stats, isOwner = false, isDashboard = false }: SellerHeaderProps) {
    if (!profile) return null;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: profile.full_name,
                text: `تصفح إعلانات ${profile.full_name} على دليل السويس`,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            // Ideally show toast here
        }
    }

    return (
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-right shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 -z-10" />

            {/* Avatar */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background ring-4 ring-primary/10 shrink-0 shadow-lg">
                {profile.avatar_url ? (
                    <Image
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        <User size={48} />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3 z-10">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground">{profile.full_name || 'مستخدم السويس'}</h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-muted-foreground">
                    {profile.created_at && (
                        <div className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-full border border-border/50 shadow-sm">
                            <Calendar size={14} className="text-primary" />
                            <span>عضو منذ {format(new Date(profile.created_at), 'MMMM yyyy', { locale: ar })}</span>
                        </div>
                    )}

                    {stats && (
                        <div className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-full border border-border/50 shadow-sm">
                            <span className="font-bold text-foreground">{stats.totalItems}</span>
                            <span>إعلان نشط</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10">
                {!isOwner && profile.phone && (
                    <a href={`tel:${profile.phone}`} className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                        <Phone size={18} />
                        <span>اتصال</span>
                    </a>
                )}

                {isOwner && (
                    isDashboard ? (
                        <Link href={`/marketplace/seller/${profile.id || ''}`} className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                            <User size={18} />
                            <span>معاينة متجري</span>
                        </Link>
                    ) : (
                        <Link href="/marketplace/my-items" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                            <Store size={18} />
                            <span>إدارة إعلاناتي</span>
                        </Link>
                    )
                )}
                <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-secondary/80 text-secondary-foreground hover:bg-secondary px-6 py-3 rounded-xl font-bold transition-all backdrop-blur-sm">
                    <Share2 size={18} />
                    <span>مشاركة</span>
                </button>
            </div>
        </div>
    )
}
