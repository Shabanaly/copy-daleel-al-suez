import { redirect } from 'next/navigation'

interface Props {
    params: {
        id: string
    }
}

export default function SupportRunRedirect({ params }: Props) {
    // Redirect /profile/support/[id] -> /profile?tab=support&ticketId=[id]
    redirect(`/profile?tab=support&ticketId=${params.id}`)
}
