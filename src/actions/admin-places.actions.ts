'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { PlaceMapper } from "@/data/mappers/place.mapper"

export async function getAdminPlacesAction(filters?: {
    status?: string
    categoryId?: string
    query?: string
}) {
    try {
        await requireAdmin()
        const supabase = await createClient()

        let query = supabase
            .from('places')
            .select('*, categories(name), areas(name)')
            .order('created_at', { ascending: false })

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status)
        }
        if (filters?.categoryId && filters.categoryId !== 'all') {
            query = query.eq('category_id', filters.categoryId)
        }
        if (filters?.query) {
            query = query.ilike('name', `%${filters.query}%`)
        }

        const { data, error } = await query

        if (error) throw error

        return {
            success: true,
            places: PlaceMapper.toEntities(data)
        }
    } catch (error) {
        console.error('Error fetching admin places:', error)
        return { success: false, message: 'فشل في تحميل الأماكن' }
    }
}

export async function updatePlaceStatusAction(id: string, status: 'active' | 'pending' | 'inactive') {
    try {
        await requireAdmin()
        const supabase = await createClient()

        const { error } = await supabase
            .from('places')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) throw error

        revalidatePath('/content-admin/places')
        revalidatePath('/places')
        return { success: true, message: 'تم تحديث حالة المكان بنجاح' }
    } catch (error) {
        console.error('Error updating place status:', error)
        return { success: false, message: 'فشل في تحديث حالة المكان' }
    }
}

export async function deletePlaceAction(id: string) {
    try {
        await requireAdmin()
        const supabase = await createClient()

        const { error } = await supabase
            .from('places')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/content-admin/places')
        revalidatePath('/places')
        return { success: true, message: 'تم حذف المكان بنجاح' }
    } catch (error) {
        console.error('Error deleting place:', error)
        return { success: false, message: 'فشل في حذف المكان' }
    }
}

export async function bulkUpdatePlacesStatusAction(ids: string[], status: 'active' | 'pending' | 'inactive') {
    try {
        await requireAdmin()
        const supabase = await createClient()

        const { error } = await supabase
            .from('places')
            .update({ status, updated_at: new Date().toISOString() })
            .in('id', ids)

        if (error) throw error

        revalidatePath('/content-admin/places')
        revalidatePath('/places')
        return { success: true, message: `تم تحديث حالة ${ids.length} مكان بنجاح` }
    } catch (error) {
        console.error('Error bulk updating places:', error)
        return { success: false, message: 'فشل في تحديث الأماكن' }
    }
}
