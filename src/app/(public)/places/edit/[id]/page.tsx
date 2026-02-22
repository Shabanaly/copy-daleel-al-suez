import { getCategoriesUseCase, getAreasUseCase } from "@/di/modules"
import { createClient } from "@/lib/supabase/server"
import AddPlaceForm from "@/presentation/components/places/AddPlaceForm"
import { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { SupabasePlaceRepository } from "@/data/repositories/supabase-place.repository"

export const metadata: Metadata = {
    title: 'تعديل بيانت المكان | دليل السويس',
}

type Props = {
    params: Promise<{ id: string }>
}

export default async function EditPlacePage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const placeRepository = new SupabasePlaceRepository(supabase)
    const place = await placeRepository.getPlaceById(id)

    if (!place) notFound()

    // 🔒 Security Check: Only owner or admin can edit
    // Fetch user profile to check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const isAdmin = profile && ['admin', 'super_admin'].includes(profile.role)
    const isOwner = place.ownerId === user.id || place.createdBy === user.id

    if (!isAdmin && !isOwner) {
        redirect('/')
    }

    const categories = await getCategoriesUseCase.execute(undefined, supabase)
    const areas = await getAreasUseCase.execute(supabase)

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">تعديل بيانات المكان</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                    قم بتحديث بيانات نشاطك التجاري لضمان وصول أدق المعلومات لعملائك.
                </p>
            </div>

            <AddPlaceForm
                categories={categories}
                areas={areas}
                initialPlace={place}
            />
        </div>
    )
}
