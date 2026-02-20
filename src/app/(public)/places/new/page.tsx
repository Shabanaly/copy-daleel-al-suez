import { getCategoriesUseCase, getAreasUseCase } from "@/di/modules"
import { createClient } from "@/lib/supabase/server"
import AddPlaceForm from "@/presentation/components/places/AddPlaceForm"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: 'أضف مكانك | دليل السويس',
    description: 'أضف مكانك التجاري أو الخدمي إلى دليل السويس ليصل إلى آلاف الزوار يومياً.',
}

export default async function AddPlacePage() {
    const supabase = await createClient()
    const categories = await getCategoriesUseCase.execute(undefined, supabase)

    const areas = await getAreasUseCase.execute(supabase)

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">أضف مكانك للدليل</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                    هل تمتلك نشاطاً تجارياً أو خدمياً في السويس؟ أضفه الآن مجاناً ليظهر لآلاف الزوار والعملاء المحتملين.
                </p>
            </div>

            <AddPlaceForm categories={categories} areas={areas} />
        </div>
    )
}
