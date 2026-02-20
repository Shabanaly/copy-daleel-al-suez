
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY is not set. Email will not be sent.')
        return { success: false, error: 'API key missing' }
    }

    try {
        const data = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to,
            subject,
            html,
        })

        if (data.error) {
            console.error('❌ Resend returned error:', data.error)
            return { success: false, error: data.error }
        }

        return { success: true, data }
    } catch (error) {
        console.error('❌ Failed to send email (exception):', error)
        return { success: false, error }
    }
}
