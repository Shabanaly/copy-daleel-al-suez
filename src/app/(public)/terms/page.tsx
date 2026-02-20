import { TermsView } from "@/presentation/features/static/terms-view";
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'الشروط والأحكام - دليل السويس',
    description: 'الشروط والأحكام الخاصة باستخدام موقع دليل السويس.',
}

export default function TermsPage() {
    return <TermsView />
}
