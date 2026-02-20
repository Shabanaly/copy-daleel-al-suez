import { createClient } from "@/lib/supabase/server"
import { SupabaseCategoryRepository } from "@/data/repositories/supabase-category.repository"
import { CategoriesManagement } from "@/presentation/features/admin/components/categories-management"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
    const supabase = await createClient()
    const categoryRepo = new SupabaseCategoryRepository(supabase)

    // Fetch all categories including inactive ones
    const categories = await categoryRepo.getAllCategories({ includeInactive: true })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowRight size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">إدارة التصنيفات</h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">التحكم في تصنيفات دليل الأماكن، الأيقونات، والألوان</p>
                    </div>
                </div>
            </div>

            <CategoriesManagement categories={categories} />
        </div>
    )
}
