import { getUsersAction } from '@/actions/admin-users.actions'
import { UsersList } from '@/presentation/features/admin/components'
import { requireSuperAdmin } from '@/lib/supabase/auth-utils'

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string, role?: string, page?: string }>
}) {
    await requireSuperAdmin()
    const params = await searchParams

    const page = params.page ? parseInt(params.page) : 1
    const result = await getUsersAction({
        search: params.q,
        role: params.role,
        page: page,
        limit: 20
    })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
                <p className="text-muted-foreground mt-1">عرض جميع المستخدمين، إدارة الأدوار، والتحكم في صلاحيات الوصول.</p>
            </div>

            <UsersList
                initialUsers={result.users || []}
                totalCount={result.count || 0}
                currentPage={result.page || 1}
                totalPages={result.totalPages || 1}
            />
        </div>
    )
}
