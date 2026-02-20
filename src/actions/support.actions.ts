'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSupportTicket({
    subject,
    category,
    priority = 'medium',
    message,
    attachments
}: {
    subject: string
    category: string
    priority?: string
    message: string
    attachments?: string[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('غير مصرح')

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({ user_id: user.id, subject, category, priority })
        .select()
        .single()

    if (ticketError) throw ticketError

    // Create first message
    const { error: msgError } = await supabase
        .from('support_messages')
        .insert({
            ticket_id: ticket.id,
            sender_id: user.id,
            message,
            attachments
        })

    if (msgError) throw msgError

    // Notify Admins (Temporary commented out due to admin redesign)
    /*
    await notifyAdmins(
        'تذكرة دعم جديدة',
        `قام ${user.email} بفتح تذكرة جديدة باسم: ${subject}`,
        'support',
        `/admin/support/${ticket.id}`
    )
    */

    revalidatePath('/settings')
    return { success: true, ticketId: ticket.id }
}

export async function getUserTickets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('support_tickets')
        .select(`
            *,
            messages:support_messages(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function getTicketMessages(ticketId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('support_messages')
        .select(`
            *
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data
}

export async function addTicketMessage(ticketId: string, message: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('غير مصرح')

    const { error } = await supabase
        .from('support_messages')
        .insert({
            ticket_id: ticketId,
            sender_id: user.id,
            message
        })

    // Update ticket updated_at
    await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId)

    if (error) throw error

    revalidatePath(`/settings`)
    return { success: true }
}
