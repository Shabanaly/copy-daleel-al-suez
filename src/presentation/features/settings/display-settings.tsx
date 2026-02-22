'use client'

import { Sun, Moon, Globe, Check, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DisplaySettingsProps {
    theme: string | undefined
    setTheme: (theme: string) => void
}

export function DisplaySettings({ theme, setTheme }: DisplaySettingsProps) {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="space-y-1">
                <h2 className="text-2xl font-bold">المظهر واللغة</h2>
                <p className="text-muted-foreground text-sm">خصص شكل التطبيق وتفضيلات العرض التي تناسب ذوقك</p>
            </header>

            <div className="space-y-10">
                {/* Theme Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">المظهر العام</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <button
                            onClick={() => setTheme('light')}
                            className={cn(
                                "group relative flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all duration-300",
                                theme === 'light'
                                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/5"
                                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                            )}
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                                theme === 'light' ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground group-hover:scale-110"
                            )}>
                                <Sun size={32} />
                            </div>
                            <div className="text-center">
                                <span className="font-bold block text-lg">الوضع الفاتح</span>
                                <p className="text-xs text-muted-foreground mt-1">مناسب للقراءة في ضوء النهار</p>
                            </div>
                            {theme === 'light' && (
                                <div className="absolute top-4 left-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => setTheme('dark')}
                            className={cn(
                                "group relative flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all duration-300",
                                theme === 'dark'
                                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/5"
                                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                            )}
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                                theme === 'dark' ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground group-hover:scale-110"
                            )}>
                                <Moon size={32} />
                            </div>
                            <div className="text-center">
                                <span className="font-bold block text-lg">الوضع الداكن</span>
                                <p className="text-xs text-muted-foreground mt-1">مريح للعين في ظروف الإضاءة المنخفضة</p>
                            </div>
                            {theme === 'dark' && (
                                <div className="absolute top-4 left-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-white" />
                                </div>
                            )}
                        </button>
                    </div>
                </section>

                <hr className="border-border/50" />

                {/* Language Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">اللغة</h3>
                    <div className="bg-muted/30 border border-border/50 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-center sm:text-right">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <Globe size={28} />
                            </div>
                            <div>
                                <p className="font-bold text-lg">اللغة الحالية</p>
                                <p className="text-sm text-muted-foreground mt-1">التطبيق متوفر حالياً باللغة العربية لدعم المحتوى المحلي</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/10">
                            العربية (مصر)
                            <Check size={16} />
                        </div>
                    </div>

                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-4">
                        <div className="mt-1 text-blue-500">
                            <Globe size={18} />
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed font-medium">
                            نحن نعمل حالياً على دعم المزيد من اللغات لتوسيع قاعدة مستخدمينا. ترقبوا التحديثات القادمة!
                        </p>
                    </div>
                </section>
            </div>
        </div>
    )
}
