import { createClient } from '@/lib/supabase/server'

export type AuditAction =
    | 'category.create'
    | 'category.update'
    | 'category.delete'
    | 'place.create'
    | 'place.update'
    | 'place.delete'
    | 'user.role_change'

export interface AuditLogData {
    action: AuditAction
    targetId?: string
    details?: {
        before?: unknown
        after?: unknown
        changes?: string[]
        metadata?: Record<string, unknown>
    }
}

/**
 * Log an admin action to audit_logs table
 * 
 * @example
 * await logAudit({
 *   action: 'category.create',
 *   targetId: newCategory.id,
 *   details: {
 *     after: { name: 'مطاعم', slug: 'restaurants' }
 *   }
 * })
 */
export async function logAudit(data: AuditLogData) {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.warn('Audit log skipped: No authenticated user')
            return
        }

        const { error } = await supabase.from('audit_logs').insert({
            actor_id: user.id,
            action: data.action,
            target_id: data.targetId,
            details: data.details
        })

        if (error) {
            console.error('Failed to log audit:', error)
        }
    } catch (err) {
        console.error('Audit logging error:', err)
    }
}

/**
 * Generate a human-readable change summary
 */
export function generateChangesSummary(before: Record<string, unknown> | null, after: Record<string, unknown> | null): string[] {
    const changes: string[] = []

    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})])

    allKeys.forEach(key => {
        const oldValue = before?.[key]
        const newValue = after?.[key]

        if (oldValue !== newValue) {
            if (oldValue === undefined) {
                changes.push(`Added ${key}: ${newValue}`)
            } else if (newValue === undefined) {
                changes.push(`Removed ${key}`)
            } else {
                changes.push(`Changed ${key} from "${oldValue}" to "${newValue}"`)
            }
        }
    })

    return changes
}
