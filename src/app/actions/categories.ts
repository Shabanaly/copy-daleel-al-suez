'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteCategory(formData: FormData) {
    const id = formData.get('id')
    if (!id) return

    const supabase = await createClient()
    await supabase.from('categories').delete().eq('id', id)
    revalidatePath('/admin/categories')
}
