'use client';

import { useState, useEffect } from 'react';
import { X, Filter, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/presentation/components/ui/Button';

interface MobileFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    resultsCount?: number;
}

export function MobileFilterDrawer({
    isOpen,
    onClose,
    children,
    title = "فلاتر البحث",
    resultsCount
}: MobileFilterDrawerProps) {
    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Also potential touch issues on some browsers
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Drawer Content */}
            <div className={cn(
                "absolute inset-x-0 bottom-0 bg-background rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] transition-transform duration-500 ease-out animate-in slide-in-from-bottom-full",
            )}>
                {/* Handle Bar */}
                <div className="flex justify-center py-3">
                    <div className="w-12 h-1.5 bg-muted rounded-full" />
                </div>

                {/* Header */}
                <div className="px-6 pb-4 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Filter size={16} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{title}</h2>
                            {resultsCount !== undefined && (
                                <p className="text-[10px] text-muted-foreground">{resultsCount} مكان متاح</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-24 custom-scrollbar">
                    {children}
                </div>

                {/* Footer Actions */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-10">
                    <Button
                        onClick={onClose}
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                    >
                        عرض النتائج
                    </Button>
                </div>
            </div>
        </div>
    );
}
