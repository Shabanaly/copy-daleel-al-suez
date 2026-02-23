'use client';

import { FlashDeal } from "@/domain/entities/flash-deal";
import { useEffect, useRef } from "react";

interface Props {
    ad: FlashDeal;
    className?: string;
}

export function AdSenseBlock({ ad, className }: Props) {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        if (ad.type === 'adsense' && ad.adCode && adRef.current) {
            try {
                // Typical AdSense Push
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            } catch (e) {
                console.error("AdSense error:", e);
            }
        }
    }, [ad]);

    if (ad.type !== 'adsense' || !ad.adCode) return null;

    return (
        <div className={`w-full overflow-hidden flex justify-center items-center bg-muted/20 py-4 ${className || ''}`}>
            <div className="relative text-center w-full min-h-[100px]">
                {/* 
                  Note: In a real AdSense setup, you need the client ID and slot ID. 
                  We assume adCode holds the slot ID here, or a full JSON config.
                  For this example, we use a standard responsive ad unit structure.
                */}
                <ins
                    ref={adRef}
                    className="adsbygoogle"
                    style={{ display: "block" }}
                    data-ad-client="ca-pub-YYYYYYYYYYYYYYY" // Replace with real publisher ID
                    data-ad-slot={ad.adCode}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                ></ins>
            </div>
        </div>
    );
}
