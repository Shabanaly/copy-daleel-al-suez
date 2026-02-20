import { getCategoriesUseCase, getAreasUseCase } from "@/di/modules"
import { createClient } from "@/lib/supabase/server"
import AddPlaceForm from "@/presentation/components/places/AddPlaceForm"
import { SupabasePlaceRepository } from "@/data/repositories/supabase-place.repository"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export const dynamic = 'force-dynamic'

interface EditPlacePageProps {
    params: Promise<{ id: string }>
}

export default async function EditPlacePage({ params }: EditPlacePageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch place
    const placeRepo = new SupabasePlaceRepository(supabase)
    const place = await placeRepo.getPlaceById(id)

    if (!place) {
        notFound()
    }

    // Fetch dependencies
    const [categories, areas] = await Promise.all([
        getCategoriesUseCase.execute(undefined, supabase),
        getAreasUseCase.execute(supabase)
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/content-admin/places" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowRight size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">تعديل بيانات المكان</h1>
                    <p className="text-muted-foreground mt-0.5 text-sm">تعديل معلومات: {place.name}</p>
                </div>
            </div>

            <AddPlaceForm
                categories={categories}
                areas={areas}
                initialPlace={place}
            />
        </div>
    )
}
