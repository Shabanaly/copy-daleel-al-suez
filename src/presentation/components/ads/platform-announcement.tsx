'use client';

import { FlashDeal } from "@/domain/entities/flash-deal";
import { X, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
    announcement: FlashDeal;
}

export function PlatformAnnouncement({ announcement }: Props) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible || announcement.type !== 'platform_announcement') return null;

    return (
        <div
            className="text-white px-4 py-2.5 flex items-center justify-center relative z-50 animate-in slide-in-from-top-4 duration-500"
            style={{ backgroundColor: announcement.backgroundColor || '#f43f5e' }} // bg-rose-500 hex
        >
            <div className="container mx-auto flex items-center justify-between text-sm sm:text-base font-medium">
                <div className="w-6 h-6 flex-shrink-0" /> {/* Spacer for centering */}

                <div className="flex items-center gap-2 text-center max-w-2xl px-2">
                    <Info size={18} className="flex-shrink-0" />
                    <p>
                        <strong className="ml-1">{announcement.title}:</strong>
                        {announcement.description}
                    </p>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-black/10 rounded-full transition-colors flex-shrink-0"
                    aria-label="إغلاق التنبيه"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
