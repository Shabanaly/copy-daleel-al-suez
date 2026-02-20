'use server'

import { createClient } from '@/lib/supabase/server'
// import { revalidatePath } from 'next/cache' // Currently unused
// import { sendEmail } from '@/lib/email' // Currently unused

/**
 * Generate a random 6-digit verification code
 */
function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send verification code to user's email for account deletion
 */
export async function sendDeleteAccountCode() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('غير مصرح')
    }

    // Generate code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store code in database
    const { error: insertError } = await supabase
        .from('verification_codes')
        .insert({
            user_id: user.id,
            code,
            purpose: 'delete_account',
            expires_at: expiresAt.toISOString()
        })

    if (insertError) {
        console.error('Error storing verification code:', insertError)
        console.error('Error details:', {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint
        })
        throw new Error(`فشل إنشاء رمز التحقق: ${insertError.message}`)
    }

    // Send email with code
    /* 
    // TEMPORARY: Disabled email sending as per user request to avoid Resend limits
    const emailResult = await sendEmail({
        to: user.email!,
        subject: 'رمز التحقق لحذف حسابك - دليل السويس',
        html: `
            <div style="font-family: sans-serif; direction: rtl; text-align: right; padding: 20px;">
                <h2>تأكيد حذف الحساب</h2>
                <p>لقد طلبت حذف حسابك في دليل السويس نهائياً.</p>
                <p>استخدم الرمز التالي لتأكيد العملية:</p>
                <h1 style="letter-spacing: 5px; background: #f4f4f4; padding: 10px; text-align: center; border-radius: 8px;">${code}</h1>
                <p style="color: #666; font-size: 14px;">هذا الرمز صالح لمدة 10 دقائق.</p>
                <p style="color: red; font-size: 14px;">إذا لم تطلب حذف حسابك، يرجى تجاهل هذا البريد وتغيير كلمة المرور فوراً.</p>
            </div>
        `
    })

    if (data.error) {
            console.error('❌ Resend returned error:', data.error)
            return { success: false, error: data.error }
    }
    */

    console.log(`🔐 Verification code for ${user.email}: ${code}`)

    // In development, return the code for easy testing (BUT ALSO SEND EMAIL)
    return {
        success: true,
        code // Always return code for now
    }
}



/**
 * Delete user account permanently
 */
export async function deleteAccountPermanently({
    code,
    password
}: {
    code?: string
    password?: string
}) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('غير مصرح')
    }

    const provider = user.app_metadata?.provider

    // Verify based on auth method
    if (provider === 'google' || provider === 'facebook') {
        // OAuth user - verify code
        if (!code) {
            throw new Error('رمز التحقق مطلوب')
        }

        const { data: verificationData, error: verifyError } = await supabase
            .from('verification_codes')
            .select('*')
            .eq('user_id', user.id)
            .eq('purpose', 'delete_account')
            .eq('code', code)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (verifyError || !verificationData) {
            throw new Error('رمز التحقق غير صحيح أو منتهي الصلاحية')
        }

        // Mark code as used
        await supabase
            .from('verification_codes')
            .update({ used: true })
            .eq('id', verificationData.id)

    } else {
        // Email/password user - verify password
        if (!password) {
            throw new Error('كلمة المرور مطلوبة')
        }

        // Verify password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password
        })

        if (signInError) {
            throw new Error('كلمة المرور غير صحيحة')
        }
    }

    // CRITICAL: Manual cleanup before deletion to avoid foreign key errors
    // This is necessary because CASCADE constraints may not be properly set
    try {
        console.log('🗑️ Starting account deletion:', user.id)

        // Step 1: Delete all related data manually in correct order
        // CRITICAL: places must be deleted first due to NO ACTION constraint
        const cleanupTables = [
            { name: 'places', column: 'owner_id' },      // Must be first!
            { name: 'review_votes', column: 'user_id' },
            { name: 'reviews', column: 'user_id' },
            { name: 'favorites', column: 'user_id' },
            { name: 'notifications', column: 'user_id' },
            { name: 'verification_codes', column: 'user_id' },
            { name: 'login_activity', column: 'user_id' },
            // Add audit_logs to prevent FK errors
            { name: 'audit_logs', column: 'target_id' },
            { name: 'audit_logs', column: 'actor_id' },
        ]

        for (const table of cleanupTables) {
            const { error } = await supabase
                .from(table.name)
                .delete()
                .eq(table.column, user.id)

            // Ignore "table not found" errors (PGRST116)
            if (error && error.code !== 'PGRST116') {
                console.warn(`⚠️ Error cleaning ${table.name}:`, error.message)
            }
        }

        console.log('✅ User data cleaned')

        // Step 2: Delete auth user and profile using service role
        const { createServiceRoleClient } = await import('@/lib/supabase/service-role')
        const adminClient = createServiceRoleClient()

        // Delete profile first using service role (bypasses RLS)
        const { error: profileError } = await adminClient
            .from('profiles')
            .delete()
            .eq('id', user.id)

        if (profileError) {
            console.warn('⚠️ Error deleting profile:', profileError.message)
        } else {
            console.log('✅ Profile deleted')
        }

        // Step 3: Delete auth user

        console.log('🗑️ Calling admin.deleteUser for user:', user.id)
        // Try with shouldSoftDelete: false to force hard delete
        const deleteResult = await adminClient.auth.admin.deleteUser(user.id, true)
        console.log('📋 Delete result:', JSON.stringify(deleteResult, null, 2))

        if (deleteResult.error) {
            console.error('❌ Auth deletion failed:', deleteResult.error)
            console.error('Error code:', deleteResult.error.code)
            console.error('Error details:', deleteResult.error)
            // Provide more specific error message
            const errorMsg = deleteResult.error.message || 'خطأ في قاعدة البيانات'
            throw new Error(`فشل حذف الحساب: ${errorMsg}. راجع console للتفاصيل.`)
        }

        console.log('✅ Account deleted successfully')

        // Step 4: Sign out
        await supabase.auth.signOut()

        return { success: true }
    } catch (error) {
        console.error('💥 Account deletion error:', error)
        // Re-throw with more context
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('فشل حذف الحساب')) {
            throw error // Re-throw the Error object if it's already ours
        }
        throw new Error(`خطأ غير متوقع: ${message}`)
    }
}

/**
 * Deactivate account (soft delete with 30-day grace period)
 */
export async function deactivateAccount() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('غير مصرح')
    }

    const scheduledDeletion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            account_status: 'deactivated',
            deactivated_at: new Date().toISOString(),
            scheduled_deletion_at: scheduledDeletion.toISOString()
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('Error deactivating account:', updateError)
        throw new Error('فشل تعطيل الحساب')
    }

    // Sign out
    await supabase.auth.signOut()

    return { success: true }
}
