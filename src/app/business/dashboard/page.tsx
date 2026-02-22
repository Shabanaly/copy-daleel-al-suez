import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BusinessDashboardContent } from '@/app/business/dashboard/business-dashboard-content'

export const dynamic = 'force-dynamic'

export default async function BusinessDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Owned or Created Places
    const { data: placesData } = await supabase
        .from('places')
        .select('*, categories(name), areas(name)')
        .or(`owner_id.eq.${user.id},created_by.eq.${user.id}`)
        .in('status', ['active', 'pending'])
        .order('created_at', { ascending: false })

    // Fetch Claims
    const { data: claimsData } = await supabase
        .from('business_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <BusinessDashboardContent
            initialPlaces={placesData || []}
            initialClaims={claimsData || []}
            user={user}
        />
    )
}
