import { ContactView } from "@/presentation/features/static/contact-view";
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'تواصل معنا - دليل السويس',
    description: 'تواصل مع فريق دليل السويس للإستفسارات والاقتراحات.',
}

export default function ContactPage() {
    return <ContactView />
}
