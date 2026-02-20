'use client'

import { Phone, MessageCircle } from 'lucide-react'
import { trackUserEvent } from '@/actions/analytics.actions'

interface ContactSellerButtonsProps {
    itemId: string
    itemTitle: string
    itemSlug: string
    category: string
    sellerPhone?: string | null
    sellerWhatsapp?: string | null
}

export function ContactSellerButtons({
    itemId,
    itemTitle,
    itemSlug,
    category,
    sellerPhone,
    sellerWhatsapp
}: ContactSellerButtonsProps) {
    if (!sellerPhone && !sellerWhatsapp) return null

    return (
        <div className="space-y-3">
            {sellerPhone && (
                <a
                    href={`tel:${sellerPhone.startsWith('0') ? '+2' + sellerPhone : sellerPhone.startsWith('20') ? '+' + sellerPhone : '+20' + sellerPhone}`}
                    className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    onClick={() => trackUserEvent({ eventType: 'contact_seller', entityId: itemId, categoryId: category, metadata: { method: 'phone' } })}
                >
                    <Phone className="w-5 h-5" />
                    اتصل بالبائع
                </a>
            )}
            {sellerWhatsapp && (
                <a
                    href={`https://wa.me/${sellerWhatsapp.startsWith('0') ? '2' + sellerWhatsapp : sellerWhatsapp.startsWith('20') ? sellerWhatsapp : '20' + sellerWhatsapp}?text=${encodeURIComponent(`مرحباً، أنا مهتم بإعلانك على دليل السويس: ${itemTitle}\nرابط الإعلان: ${process.env.NEXT_PUBLIC_SITE_URL}/marketplace/${itemSlug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#128C7E] transition-colors"
                    onClick={() => trackUserEvent({ eventType: 'contact_seller', entityId: itemId, categoryId: category, metadata: { method: 'whatsapp' } })}
                >
                    <MessageCircle className="w-5 h-5" />
                    تواصل عبر واتساب
                </a>
            )}
        </div>
    )
}
