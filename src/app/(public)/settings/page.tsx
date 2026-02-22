import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { SettingsView } from '@/presentation/features/settings/settings-view'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'الإعدادات | دليل السويس',
    description: 'تحكم في حسابك وخصص تجربتك على دليل السويس',
}

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                    <p className="text-sm font-bold text-muted-foreground animate-pulse">جاري تحميل إعداداتك...</p>
                </div>
            </div>
        }>
            <SettingsView user={user} profile={profile} />
        </Suspense>
    )
}
