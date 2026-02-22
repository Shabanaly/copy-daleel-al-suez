'use client'

import { HelpCircle, MessageSquare, Shield, FileText, Smartphone, ExternalLink, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function SupportSettings() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="space-y-1">
                <h2 className="text-2xl font-bold">الدعم والمساعدة</h2>
                <p className="text-muted-foreground text-sm">نحن هنا لمساعدتك والتأكد من حصولك على أفضل تجربة</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SupportCard
                    icon={HelpCircle}
                    title="مركز المساعدة"
                    description="تصفح الأسئلة الشائعة والدروس التعليمية لاستخدام المنصة بكفاءة"
                    href="/help"
                />
                <SupportCard
                    icon={MessageSquare}
                    title="تواصل معنا"
                    description="راسل فريق الدعم الفني مباشرة عبر واتساب لحل أي مشكلة تواجهك"
                    href="https://wa.me/201200000000"
                    external
                    color="text-green-500"
                    bg="bg-green-500/5"
                />
                <SupportCard
                    icon={Shield}
                    title="سياسة الخصوصية"
                    description="تعرف على كيفية جمعنا للبيانات وحمايتها والتزامنا بخصوصيتك"
                    href="/privacy"
                />
                <SupportCard
                    icon={FileText}
                    title="شروط الاستخدام"
                    description="قواعد استخدام منصة دليل السويس والحقوق والواجبات المتبادلة"
                    href="/terms"
                />
            </div>

            <div className="relative overflow-hidden p-8 bg-gradient-to-br from-primary/10 via-background to-blue-600/10 rounded-[2rem] border border-primary/20 text-center space-y-6">
                {/* Decorative circles */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -z-10" />

                <div className="relative inline-block">
                    <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-primary/20 scale-110">
                        <Smartphone className="text-primary" size={40} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-background rounded-full animate-pulse" />
                </div>

                <div className="space-y-2">
                    <h4 className="font-bold text-2xl">دليل السويس - الاصدار الثاني</h4>
                    <p className="text-primary font-bold">نسخة v2.0.0 "الاربعين"</p>
                    <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed mt-4">
                        نحن ممتنون جداً لثقتك بنا. هذا التطبيق تم برمجته وتصميمه بحب لخدمة أهل السويس وزوارها. رأيك يهمنا دائماً لتطوير المنصة.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <div className="px-4 py-2 bg-muted/50 rounded-full text-xs font-bold text-muted-foreground border border-border">
                        أمان عالي (SSL)
                    </div>
                    <div className="px-4 py-2 bg-muted/50 rounded-full text-xs font-bold text-muted-foreground border border-border">
                        خوادم سريعة
                    </div>
                    <div className="px-4 py-2 bg-muted/50 rounded-full text-xs font-bold text-muted-foreground border border-border">
                        دعم فني 24/7
                    </div>
                </div>
            </div>
        </div>
    )
}

function SupportCard({ icon: Icon, title, description, href, external, color = "text-primary", bg = "bg-primary/5" }: any) {
    const Component = external ? 'a' : Link

    return (
        <Component
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="flex items-center gap-5 p-6 rounded-3xl border border-border/60 bg-card hover:bg-accent/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all text-right group"
        >
            <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center ${color} group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-inner`}>
                <Icon size={28} />
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-base">{title}</p>
                    {external && <ExternalLink size={12} className="opacity-40" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
            <ArrowLeft size={16} className="text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </Component>
    )
}
