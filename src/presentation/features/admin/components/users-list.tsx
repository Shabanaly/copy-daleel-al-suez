'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, User, Shield, ShieldCheck, UserCog, MoreVertical, Ban, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateUserRoleAction, toggleUserBanAction } from '@/actions/admin-users.actions'
import { Button } from '@/presentation/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/avatar'
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Props {
    initialUsers: any[]
    totalCount: number
    currentPage: number
    totalPages: number
}

const ROLES = [
    { value: 'user', label: 'مستخدم', icon: User, color: 'text-gray-500', description: 'مستخدم عادي يمكنه التصفح والتعليق' },
    { value: 'business_owner', label: 'صاحب عمل', icon: Shield, color: 'text-blue-500', description: 'يمكنه إدارة الأماكن والمنتجات الخاصة به' },
    { value: 'admin', label: 'مشرف محتوى', icon: ShieldCheck, color: 'text-purple-500', description: 'صلاحية كاملة لإدارة المحتوى والأماكن' },
    { value: 'super_admin', label: 'مدير نظام', icon: UserCog, color: 'text-rose-500', description: 'صلاحية كاملة لكل وظائف النظام والإعدادات' },
]

export function UsersList({ initialUsers, totalCount, currentPage, totalPages }: Props) {
    const [search, setSearch] = useState('')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Dialog state
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string,
        description: string,
        onConfirm: () => Promise<void>,
        variant: 'danger' | 'warning' | 'primary'
    } | null>(null)

    const handleRoleChange = (userId: string, newRole: any) => {
        setConfirmConfig({
            title: 'تغيير رتبة المستخدم',
            description: `هل أنت متأكد من تغيير صلاحيات هذا المستخدم؟ قد يؤثر هذا على قدرته على الوصول لبعض أقسام النظام.`,
            variant: 'warning',
            onConfirm: async () => {
                const result = await updateUserRoleAction(userId, newRole)
                if (result.success) {
                    toast.success('تم تحديث الرتبة بنجاح')
                    router.refresh()
                } else {
                    toast.error(result.error || 'حدث خطأ')
                }
            }
        })
        setConfirmOpen(true)
    }

    const handleToggleBan = (user: any) => {
        const isBanning = !user.is_banned
        setConfirmConfig({
            title: isBanning ? 'حظر المستخدم' : 'إلغاء حظر المستخدم',
            description: isBanning
                ? `هل أنت متأكد من حظر المستخدم ${user.full_name}؟ لن يتمكن من تسجيل الدخول أو استخدام حسابه.`
                : `هل أنت متأكد من إلغاء حظر المستخدم ${user.full_name}؟`,
            variant: isBanning ? 'danger' : 'primary',
            onConfirm: async () => {
                const result = await toggleUserBanAction(user.id, isBanning)
                if (result.success) {
                    toast.success(isBanning ? 'تم حظر المستخدم بنجاح' : 'تم إلغاء الحظر بنجاح')
                    router.refresh()
                } else {
                    toast.error(result.error || 'حدث خطأ')
                }
            }
        })
        setConfirmOpen(true)
    }

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        router.push(`/admin/users?${params.toString()}`)
    }

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString())
        if (search) params.set('q', search)
        else params.delete('q')
        params.set('page', '1')
        router.push(`/admin/users?${params.toString()}`)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                        className="w-full h-11 pr-11 pl-4 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl border border-border">
                    {['all', 'user', 'business_owner', 'admin'].map(r => (
                        <button
                            key={r}
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString())
                                params.set('role', r)
                                params.set('page', '1')
                                router.push(`/admin/users?${params.toString()}`)
                            }}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                (searchParams.get('role') || 'all') === r
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {r === 'all' ? 'الكل' : ROLES.find(role => role.value === r)?.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm relative">
                {isPending && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">المستخدم</th>
                                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">الرتبة</th>
                                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">الحالة</th>
                                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider">تاريخ الانضمام</th>
                                <th className="px-6 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {initialUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        لا توجد نتائج مطابقة لبحثك.
                                    </td>
                                </tr>
                            ) : (
                                initialUsers.map((user) => (
                                    <tr key={user.id} className={cn("hover:bg-muted/30 transition-colors", user.is_banned && "bg-rose-50/10 opacity-70")}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-border shadow-sm">
                                                    <AvatarImage src={user.avatar_url} />
                                                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">
                                                        {user.full_name?.substring(0, 2) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-black text-foreground">{user.full_name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-medium">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {(() => {
                                                const currentRole = ROLES.find(r => r.value === user.role) || ROLES[0]
                                                const RoleIcon = currentRole.icon
                                                return (
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border",
                                                        currentRole.color.replace('text', 'bg').replace('500', '50/50'),
                                                        currentRole.color
                                                    )}>
                                                        <RoleIcon size={12} />
                                                        {currentRole.label}
                                                    </span>
                                                )
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.is_banned ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">محظور</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold">نشط</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-muted-foreground font-medium">
                                                {new Date(user.created_at).toLocaleDateString('ar-EG')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm" className="h-8 px-3 text-[10px] font-black gap-1.5">
                                                            تعديل الرتبة
                                                            <UserCog size={12} className="text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[220px] p-2 rounded-2xl shadow-xl border-border">
                                                        <div className="flex flex-col gap-1">
                                                            {ROLES.map((role) => (
                                                                <DropdownMenuItem
                                                                    key={role.value}
                                                                    onClick={() => handleRoleChange(user.id, role.value)}
                                                                    className={cn(
                                                                        "flex flex-col items-start gap-1 p-2 rounded-xl text-right transition-colors cursor-pointer",
                                                                        user.role === role.value ? "bg-primary/5 text-primary" : "text-foreground"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-2 text-[10px] font-black w-full">
                                                                        <role.icon size={14} className={role.color} />
                                                                        <span>{role.label}</span>
                                                                        {user.role === role.value && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                                                                    </div>
                                                                    <div className="text-[9px] text-muted-foreground font-medium pr-5 leading-tight">
                                                                        {role.description}
                                                                    </div>
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                                <Button
                                                    onClick={() => handleToggleBan(user)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn(
                                                        "h-8 w-8 transition-colors",
                                                        user.is_banned ? "text-green-600 hover:bg-green-50" : "text-rose-500 hover:bg-rose-50"
                                                    )}
                                                >
                                                    {user.is_banned ? <CheckCircle size={16} /> : <Ban size={16} />}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-border">
                        <div className="text-xs text-muted-foreground font-medium">
                            عرض {initialUsers.length} من {totalCount} مستخدم
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                disabled={currentPage === 1 || isPending}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                <ChevronRight size={16} />
                            </Button>
                            <span className="text-xs font-bold px-3">
                                صفحة {currentPage} من {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                disabled={currentPage === totalPages || isPending}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmConfig?.onConfirm || (async () => { })}
                title={confirmConfig?.title || ''}
                description={confirmConfig?.description || ''}
                variant={confirmConfig?.variant}
            />
        </div >
    )
}
