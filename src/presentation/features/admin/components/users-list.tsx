'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, Shield, ShieldCheck, UserCog, MoreVertical, Ban, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { updateUserRoleAction } from '@/actions/admin-users.actions'
import { Button } from '@/presentation/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/avatar'
import { cn } from '@/lib/utils'

interface Props {
    initialUsers: any[]
}

const ROLES = [
    { value: 'user', label: 'مستخدم', icon: User, color: 'text-gray-500' },
    { value: 'business_owner', label: 'صاحب عمل', icon: Shield, color: 'text-blue-500' },
    { value: 'admin', label: 'مشرف', icon: ShieldCheck, color: 'text-purple-500' },
    { value: 'super_admin', label: 'مدير نظام', icon: UserCog, color: 'text-rose-500' },
]

export function UsersList({ initialUsers }: Props) {
    const [search, setSearch] = useState('')
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleRoleChange = async (userId: string, newRole: any) => {
        if (!confirm('هل أنت متأكد من رغبتك في تغيير رتبة هذا المستخدم؟')) return

        startTransition(async () => {
            const result = await updateUserRoleAction(userId, newRole)
            if (result.success) {
                toast.success('تم تحديث الرتبة بنجاح ✅')
                router.refresh()
            } else {
                toast.error(result.error || 'حدث خطأ')
            }
        })
    }

    const filteredUsers = initialUsers // We rely on server searching for real use cases, but keep it basic here

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                    type="text"
                    placeholder="ابحث بالاسم أو المعرف (ID)..."
                    className="w-full h-12 pr-12 pl-4 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            router.push(`/admin/users?q=${search}`)
                        }
                    }}
                />
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">المستخدم</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">الرتبة الحالية</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">تاريخ الانضمام</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-border shadow-sm">
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                                                    {user.full_name?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-sm font-bold text-foreground">{user.full_name}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">{user.id.substring(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const currentRole = ROLES.find(r => r.value === user.role) || ROLES[0]
                                                const RoleIcon = currentRole.icon
                                                return (
                                                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border", currentRole.color.replace('text', 'bg').replace('500', '50'), currentRole.color)}>
                                                        <RoleIcon size={12} />
                                                        {currentRole.label}
                                                    </span>
                                                )
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString('ar-EG')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="relative group">
                                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                                    تغيير الرتبة
                                                </Button>
                                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 bg-popover border border-border rounded-xl shadow-xl p-2 min-w-[150px]">
                                                    <div className="flex flex-col gap-1">
                                                        {ROLES.map((role) => (
                                                            <button
                                                                key={role.value}
                                                                onClick={() => handleRoleChange(user.id, role.value)}
                                                                className={cn(
                                                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-right transition-colors hover:bg-muted",
                                                                    user.role === role.value ? "text-primary bg-primary/5" : "text-foreground"
                                                                )}
                                                            >
                                                                <role.icon size={14} className={role.color} />
                                                                {role.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                                                <Ban size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
