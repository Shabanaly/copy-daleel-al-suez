import { getUsersAction } from '@/actions/admin-users.actions'
import { UsersList } from '@/presentation/features/admin/components'
import { Users } from 'lucide-react'
import { requireSuperAdmin } from '@/lib/supabase/auth-utils'

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: { q?: string }
}) {
    await requireSuperAdmin()
    const result = await getUsersAction(searchParams.q)
    const users = result.users || []

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
                <p className="text-muted-foreground mt-1">عرض جميع المستخدمين، إدارة الأدوار، والتحكم في صلاحيات الوصول.</p>
            </div>

            <UsersList initialUsers={users} />
        </div>
    )
}
