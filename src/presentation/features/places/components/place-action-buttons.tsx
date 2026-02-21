'use client'

import { Phone, MessageCircle, Share2, ExternalLink, Facebook, Instagram } from 'lucide-react'
import { useState } from 'react'
import { FavoriteButton } from './favorite-button'

interface PlaceActionButtonsProps {
    phone?: string
    whatsapp?: string
    website?: string
    facebook?: string
    instagram?: string
    placeName: string
    placeId: string
}

export function PlaceActionButtons({
    phone,
    whatsapp,
    website,
    facebook,
    instagram,
    placeName,
    placeId
}: PlaceActionButtonsProps) {
    const [shareSuccess, setShareSuccess] = useState(false)

    const handleShare = async () => {
        const shareData = {
            title: placeName,
            text: `تعرف على ${placeName} على دليل السويس`,
            url: window.location.href
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch {
                console.log('Share cancelled')
            }
        } else if (navigator.clipboard) {
            // Fallback: copy link
            navigator.clipboard.writeText(window.location.href)
            setShareSuccess(true)
            setTimeout(() => setShareSuccess(false), 2000)
        }
    }

    return (
        <div className="space-y-4">
            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-3">
                {phone && (
                    <a
                        href={`tel:${phone}`}
                        className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        <Phone size={20} />
                        <span>اتصال</span>
                    </a>
                )}

                {(whatsapp || phone) && (
                    <a
                        href={`https://wa.me/${(whatsapp || phone)?.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={20} />
                        <span>واتساب</span>
                    </a>
                )}
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-2">
                <FavoriteButton
                    id={placeId}
                    className="flex-1 bg-card hover:bg-muted border border-border text-foreground px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 data-[active=true]:bg-red-50 data-[active=true]:text-red-600 data-[active=true]:border-red-200"
                    size={18}
                />

                <button
                    onClick={handleShare}
                    className="flex-1 bg-card hover:bg-muted border border-border text-foreground px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                    <Share2 size={18} />
                    <span>{shareSuccess ? 'تم النسخ!' : 'مشاركة'}</span>
                </button>

                {website && (
                    <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-card hover:bg-muted border border-border text-foreground px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <ExternalLink size={18} />
                        <span>الموقع</span>
                    </a>
                )}
            </div>

            {/* Social Links */}
            {(facebook || instagram) && (
                <div className="flex gap-2 pt-2">
                    {facebook && (
                        <a
                            href={facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Facebook size={18} />
                            <span>Facebook</span>
                        </a>
                    )}
                    {instagram && (
                        <a
                            href={instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white px-4 py-3 rounded-xl font-medium transition-opacity flex items-center justify-center gap-2"
                        >
                            <Instagram size={18} />
                            <span>Instagram</span>
                        </a>
                    )}
                </div>
            )}
        </div>
    )
}
