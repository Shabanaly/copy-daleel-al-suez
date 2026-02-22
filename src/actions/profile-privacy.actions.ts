'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleCommunityPrivacyAction(showName: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('profiles')
        .update({ show_name_in_community: showName })
        .eq('id', user.id)

    if (error) {
        console.error('toggleCommunityPrivacyAction error:', error)
        throw new Error('فشل تحديث إعدادات الخصوصية')
    }

    revalidatePath('/settings')
    revalidatePath('/profile')
    return { success: true }
}

export async function getProfilePrivacyAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, data: null }

    const { data, error } = await supabase
        .from('profiles')
        .select('show_name_in_community')
        .eq('id', user.id)
        .single()

    if (error) return { success: false, data: null }

    return { success: true, data: data.show_name_in_community !== false }
}
