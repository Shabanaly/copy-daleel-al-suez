'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { fullName?: string, phone?: string, city?: string, avatarUrl?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const currentMetadata = (user.user_metadata || {}) as Record<string, any>
    const dataUpdates: Record<string, any> = { ...currentMetadata }

    if (data.fullName) dataUpdates.full_name = data.fullName
    if (data.avatarUrl) dataUpdates.avatar_url = data.avatarUrl
    if (data.phone) dataUpdates.phone = data.phone
    if (data.city) dataUpdates.city = data.city

    const { error: authError } = await supabase.auth.updateUser({
        data: dataUpdates
    })

    if (authError) {
        throw new Error(authError.message)
    }

    // Update profiles table as well for consistency
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            full_name: data.fullName || user.user_metadata?.full_name,
            phone: data.phone || user.user_metadata?.phone,
            city: data.city || user.user_metadata?.city,
            avatar_url: data.avatarUrl || user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (profileError) {
        console.error('Error updating profiles table:', profileError)
    }

    revalidatePath('/profile')
    revalidatePath('/settings')
    return { success: true }
}

export async function updatePassword(data: { currentPassword: string, newPassword: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
        throw new Error('غير مصرح')
    }

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword
    })

    if (signInError) {
        throw new Error('كلمة المرور الحالية غير صحيحة')
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
    })

    if (updateError) {
        throw new Error(updateError.message)
    }

    revalidatePath('/profile')
    revalidatePath('/settings')
    return { success: true }
}
