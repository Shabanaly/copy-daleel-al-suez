'use client'

import { useState } from 'react'
import { MapPin, ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useArea } from '@/contexts/area-context'

export function AreaSelector({ onSelect }: { onSelect?: (areaId: string | null) => void }) {
    const { areas, currentArea, setCurrentArea, isLoading } = useArea()
    const [isOpen, setIsOpen] = useState(false)

    const handleSelect = (area: any | null) => {
        setCurrentArea(area)
        setIsOpen(false)
        onSelect?.(area?.id || null)
    }


    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 md:gap-2 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors hover:bg-accent/50 rounded-full"
                title="اختر المنطقة"
            >
                <MapPin size={18} className="text-primary" />
                <span className="hidden md:inline-block max-w-[100px] truncate">
                    {currentArea ? currentArea.name : 'كل المناطق'}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute mt-2 w-64 max-h-80 overflow-y-auto bg-popover border border-border rounded-xl shadow-lg z-50 py-1 scrollbar-hide right-0 md:right-auto md:left-0"
                        >
                            <div className="sticky top-0 bg-popover border-b border-border p-2 space-y-2">
                                <p className="text-xs text-muted-foreground font-medium px-2">اختر المنطقة</p>
                            </div>

                            <button
                                onClick={() => handleSelect(null)}
                                className="w-full text-right px-4 py-2.5 text-sm hover:bg-accent flex items-center justify-between"
                            >
                                <span className={!currentArea ? 'font-bold text-primary' : ''}>كل المناطق</span>
                                {!currentArea && <Check size={16} className="text-primary" />}
                            </button>

                            {isLoading ? (
                                <div className="p-4 text-center text-xs text-muted-foreground">جاري التحميل...</div>
                            ) : (
                                areas.map((area) => (
                                    <button
                                        key={area.id}
                                        onClick={() => handleSelect(area)}
                                        className="w-full text-right px-4 py-2.5 text-sm hover:bg-accent flex items-center justify-between transition-colors"
                                    >
                                        <span className={currentArea?.id === area.id ? 'font-bold text-primary' : ''}>
                                            {area.name}
                                        </span>
                                        {currentArea?.id === area.id && <Check size={16} className="text-primary" />}
                                    </button>
                                ))
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

