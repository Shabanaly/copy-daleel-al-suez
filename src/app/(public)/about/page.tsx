import { AboutView } from "@/presentation/features/static/about-view";
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'عن دليل السويس',
    description: 'تعرف على دليل السويس، بوابتك الشاملة لكل الأماكن والخدمات في المدينة.',
}

export default function AboutPage() {
    return <AboutView />
}
