'use client'

import { useState } from 'react'
import { BusinessClaimModal } from './business-claim-modal'
import { Flag, ShieldCheck } from 'lucide-react'

interface PlaceFooterActionsProps {
    placeId: string
    placeName: string
    isClaimed: boolean
    currentUserId?: string
}

export function PlaceFooterActions({ placeId, placeName, isClaimed, currentUserId }: PlaceFooterActionsProps) {
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)

    return (
        <>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl">
                <div className="flex items-center gap-4">
                    {!isClaimed && (
                        <button
                            onClick={() => setIsClaimModalOpen(true)}
                            className="hover:text-primary transition-colors flex items-center gap-1.5 group"
                        >
                            <ShieldCheck size={16} className="text-primary/70 group-hover:text-primary" />
                            <span className="underline decoration-dashed">هل تملك هذا المكان؟</span>
                        </button>
                    )}
                    {!isClaimed && <span className="text-border">|</span>}
                    <button className="hover:text-red-500 transition-colors flex items-center gap-1.5 group">
                        <Flag size={16} className="text-muted-foreground group-hover:text-red-500" />
                        <span>أبلغ عن خطأ</span>
                    </button>
                </div>
                <div>
                    تم التحديث في: {new Date().toLocaleDateString('ar-EG')}
                </div>
            </div>

            <BusinessClaimModal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
                placeId={placeId}
                placeName={placeName}
            />
        </>
    )
}
