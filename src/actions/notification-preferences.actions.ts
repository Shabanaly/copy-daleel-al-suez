'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotificationPreferences() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

    // Create default preferences if not exists
    if (error && error.code === 'PGRST116') {
        const { data: newPrefs } = await supabase
            .from('notification_preferences')
            .insert({ user_id: user.id })
            .select()
            .single()
        return newPrefs
    }

    if (error) throw error
    return data
}

export async function updateNotificationPreferences(preferences: Record<string, unknown>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('غير مصرح')

    // Remove immutable fields if present
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, user_id, created_at, updated_at, ...updates } = preferences

    const { error } = await supabase
        .from('notification_preferences')
        .upsert({
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString()
        })

    if (error) throw error

    revalidatePath('/profile')
    return { success: true }
}
