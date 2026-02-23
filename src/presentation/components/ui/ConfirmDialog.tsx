'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'primary'
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    variant = 'danger'
}: ConfirmDialogProps) {
    const [isPending, setIsPending] = useState(false)

    if (!isOpen) return null

    const handleConfirm = async () => {
        setIsPending(true)
        try {
            await onConfirm()
            onClose()
        } catch (error) {
            console.error('Confirm action failed:', error)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
                dir="rtl"
            >
                <div className="p-6 space-y-4">
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
                        variant === 'danger' ? "bg-rose-100 text-rose-600" :
                            variant === 'warning' ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"
                    )}>
                        <AlertTriangle size={24} />
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-foreground">{title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/30 border-t border-border mt-2">
                    <button
                        disabled={isPending}
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        disabled={isPending}
                        onClick={handleConfirm}
                        className={cn(
                            "flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70",
                            variant === 'danger' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20" :
                                variant === 'warning' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" : "bg-primary hover:bg-primary/90 shadow-primary/20"
                        )}
                    >
                        {isPending && <Loader2 size={16} className="animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
