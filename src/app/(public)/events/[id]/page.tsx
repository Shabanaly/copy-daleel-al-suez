import { notFound } from 'next/navigation'
import { getEventAction } from '@/actions/events.actions'
import { EventDetailView } from '@/presentation/features/events/event-detail-view'
import { ViewTracker } from '@/presentation/components/shared/view-tracker'

export const dynamic = 'force-dynamic'

interface EventPageProps {
    params: {
        id: string
    }
}

export default async function EventPage({ params }: EventPageProps) {
    const { id } = await params
    const event = await getEventAction(id)

    if (!event) {
        notFound()
    }

    return (
        <>
            <ViewTracker tableName="events" id={event.id} />
            <EventDetailView event={event} />
        </>
    )
}
