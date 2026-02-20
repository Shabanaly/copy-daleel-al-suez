'use client'

import React from "react"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

interface VideoEmbedProps {
    url: string
    className?: string
}

export function VideoEmbed({ url: rawUrl, className }: VideoEmbedProps) {
    if (!rawUrl) return null
    const url = rawUrl.trim()

    const isReel = url.includes('/reels/') || url.includes('/reel/') || url.includes('/shorts/') || url.includes('tiktok.com')
    const aspectClass = isReel ? "aspect-[9/16] max-w-[400px] mx-auto" : "aspect-video"

    const renderWrapper = (children: React.ReactNode, platform: string) => (
        <div className={cn("space-y-3", className)}>
            <div className={cn("relative w-full overflow-hidden rounded-2xl shadow-lg bg-black/10 flex items-center justify-center min-h-[200px]", aspectClass)}>
                {children}
            </div>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2 px-4 rounded-lg bg-muted/50 hover:bg-muted"
            >
                <span>مشاهدة على {platform}</span>
                <ExternalLink size={14} />
            </a>
        </div>
    )

    // YouTube (including Shorts & Live)
    // Refined regex to be more greedy for the ID
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    if (ytMatch && ytMatch[1]) {
        return renderWrapper(
            <iframe
                src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube Video"
            />,
            "YouTube"
        )
    }

    // TikTok
    if (url.includes('tiktok.com')) {
        const tiktokMatch = url.match(/\/video\/(\d+)/) || url.match(/\/v\/(\d+)/)
        const videoId = tiktokMatch ? tiktokMatch[1] : null

        return renderWrapper(
            <iframe
                src={`https://www.tiktok.com/embed/v2/${videoId || ''}?u_code=0&id=${videoId || ''}`}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title="TikTok Video"
            />,
            "TikTok"
        )
    }

    // Facebook (including Reels and fb.watch)
    if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('facebook.com/reel/')) {
        return renderWrapper(
            <iframe
                src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                title="Facebook Video"
            />,
            "Facebook"
        )
    }

    // Instagram (including Reels)
    if (url.includes('instagram.com')) {
        const cleanUrl = url.split('?')[0].replace(/\/$/, '')
        return renderWrapper(
            <iframe
                src={`${cleanUrl}/embed`}
                className="absolute inset-0 h-full w-full border-0"
                allowTransparency
                title="Instagram Video"
            />,
            "Instagram"
        )
    }

    // Generic Fallback (Link Only or Error)
    return (
        <div className={cn("p-6 rounded-2xl bg-muted border border-dashed border-border text-center", className)}>
            <p className="text-sm text-muted-foreground mb-3">رابط الفيديو غير مدعوم للمعالجة التلقائية حالياً:</p>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-bold hover:underline break-all bg-primary/10 px-4 py-2 rounded-lg"
            >
                <span>فتح الرابط مباشرة</span>
                <ExternalLink size={16} />
            </a>
        </div>
    )
}

