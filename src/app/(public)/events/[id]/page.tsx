import { notFound } from 'next/navigation'
import { getEventAction } from '@/actions/events.actions'
import { EventDetailView } from '@/presentation/features/events/event-detail-view'
import { ViewTracker } from '@/presentation/components/shared/view-tracker'
import { Metadata } from 'next'

export const revalidate = 3600;

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const event = await getEventAction(id);

    if (!event) {
        return { title: 'الفعالية غير موجودة | دليل السويس' };
    }

    const title = `${event.title} | فعاليات السويس`;
    const description = event.description?.substring(0, 160) || `تعرف على تفاصيل ${event.title} في السويس.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: event.imageUrl ? [event.imageUrl] : [],
            type: 'article',
        }
    };
}

interface EventPageProps {
    params: {
        id: string
    }
}

export default async function EventPage({ params }: Props) {
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
