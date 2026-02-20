import { ShoppingBag, MessageSquare, Newspaper, Key, ArrowLeft, Users, MapPin, Star, LayoutGrid, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { getAdminOverviewStatsAction } from '@/actions/admin-overview.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/ui/card'

export const dynamic = 'force-dynamic'

export default async function ContentAdminPage() {
    const { success, stats } = await getAdminOverviewStatsAction()

    if (!success || !stats) {
        return (
            <div className="p-8 text-center bg-card rounded-2xl border border-border">
                <AlertTriangle className="mx-auto text-rose-500 mb-4" size={40} />
                <h2 className="text-xl font-bold">فشل تحميل الإحصائيات</h2>
                <p className="text-muted-foreground mt-2">يرجى المحاولة مرة أخرى لاحقاً</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">نظرة عامة</h1>
                <p className="text-muted-foreground mt-1 text-sm font-medium">إحصائيات المنصة وأدوات الإدارة السريعة</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                    title="إجمالي الأماكن"
                    value={stats.places.total}
                    icon={MapPin}
                    subValue={`${stats.places.pending} معلق`}
                    color="blue"
                />
                <StatCard
                    title="سوق السويس"
                    value={stats.marketplace.today}
                    icon={ShoppingBag}
                    subValue={`${stats.marketplace.pending} معلق`}
                    color="amber"
                />
                <StatCard
                    title="إشراف المجتمع"
                    value={stats.community.flaggedQuestions + stats.community.flaggedAnswers}
                    icon={MessageSquare}
                    subText="بلاغات"
                    color="purple"
                />
                <StatCard
                    title="المستخدمين"
                    value={stats.users.total}
                    icon={Users}
                    subText="مسجل"
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Dashboard Introduction / Stats Details */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[250px] sm:min-h-[300px]">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <LayoutGrid size={28} className="sm:w-8 sm:h-8" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-black text-foreground">لوحة التحكم الإدارية</h2>
                                <p className="text-muted-foreground mt-2 max-w-md mx-auto text-[11px] sm:text-sm leading-relaxed">
                                    مرحباً بك في لوحة تحكم المحتوى. يمكنك متابعة أهم الإحصائيات هنا، والوصول المباشر للأقسام المختلفة من خلال القائمة الجانبية أو الدروار.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Important Items / Pending Actions */}
                <div className="space-y-5">
                    <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        تحتاج إجراء
                    </h2>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                            <PendingItem
                                label="إعلانات سوق بانتظار المراجعة"
                                count={stats.marketplace.pending}
                                href="/content-admin/marketplace"
                                color="amber"
                            />
                            <PendingItem
                                label="بلاغات المجتمع المعلقة"
                                count={stats.community.flaggedQuestions + stats.community.flaggedAnswers}
                                href="/content-admin/community"
                                color="purple"
                            />
                            <PendingItem
                                label="طلبات توثيق محلات جديدة"
                                count={stats.claims.pending}
                                href="/content-admin/claims"
                                color="blue"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, subText, subValue, color }: any) {
    const colors: any = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/30',
        purple: 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-900/30',
        amber: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/30',
        green: 'text-green-600 bg-green-50 border-green-100 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30',
    }

    return (
        <Card className="border-border/50 bg-card hover:border-primary/20 transition-all duration-300">
            <CardContent className="p-3.5 sm:p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg border ${colors[color]}`}>
                        <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate ml-1">{title}</span>
                </div>
                <div className="flex items-baseline gap-1 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-black text-foreground">{value}</span>
                    {subText && <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium truncate">{subText}</span>}
                </div>
                {subValue && (
                    <div className="mt-1.5 sm:mt-2.5 flex items-center gap-1 sm:gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-primary truncate">{subValue}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function PendingItem({ label, count, href, color }: any) {
    const active = count > 0;
    const colors: any = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
        amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    }

    return (
        <Link
            href={href}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${active
                ? 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                : 'border-transparent bg-muted/30 opacity-60 cursor-not-allowed'
                }`}
        >
            <span className="text-xs font-bold text-foreground">{label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? colors[color] : 'bg-muted text-muted-foreground'}`}>
                {count}
            </span>
        </Link>
    )
}
