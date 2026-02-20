'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function requireSuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin' && profile?.role !== 'admin') {
        throw new Error('Forbidden')
    }
    return user
}

export async function createCategoryAction(data: { name: string; slug: string; icon?: string; color?: string; sortOrder?: number }) {
    try {
        await requireSuperAdmin()
        const supabase = await createClient()

        const { data: category, error } = await supabase
            .from('categories')
            .insert({
                name: data.name,
                slug: data.slug,
                icon: data.icon,
                color: data.color,
                sort_order: data.sortOrder || 0,
                is_active: true
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath('/admin/categories')
        revalidatePath('/places/new')
        revalidatePath('/')

        return { success: true, message: 'تم إضافة التصنيف بنجاح', category }
    } catch (error) {
        console.error('Error creating category:', error)
        return { success: false, message: 'فشل في إضافة التصنيف' }
    }
}

export async function updateCategoryAction(id: string, data: { name?: string; slug?: string; icon?: string; color?: string; sortOrder?: number; isActive?: boolean }) {
    try {
        await requireSuperAdmin()
        const supabase = await createClient()

        const { data: category, error } = await supabase
            .from('categories')
            .update({
                name: data.name,
                slug: data.slug,
                icon: data.icon,
                color: data.color,
                sort_order: data.sortOrder,
                is_active: data.isActive
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/admin/categories')
        revalidatePath('/places/new')
        revalidatePath('/')

        return { success: true, message: 'تم تحديث التصنيف بنجاح', category }
    } catch (error) {
        console.error('Error updating category:', error)
        return { success: false, message: 'فشل في تحديث التصنيف' }
    }
}

export async function deleteCategoryAction(id: string) {
    try {
        await requireSuperAdmin()
        const supabase = await createClient()

        // Check if there are places in this category
        const { count, error: countError } = await supabase
            .from('places')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', id)

        if (countError) throw countError

        if (count && count > 0) {
            return { success: false, message: 'لا يمكن حذف التصنيف لوجود أماكن مرتبطة به. قم بنقل الأماكن أولاً.' }
        }

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/admin/categories')
        revalidatePath('/places/new')
        revalidatePath('/')

        return { success: true, message: 'تم حذف التصنيف بنجاح' }
    } catch (error) {
        console.error('Error deleting category:', error)
        return { success: false, message: 'فشل في حذف التصنيف' }
    }
}
