import { PrivacyView } from "@/presentation/features/static/privacy-view";
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'سياسة الخصوصية - دليل السويس',
    description: 'سياسة الخصوصية وحماية البيانات في دليل السويس.',
}

export default function PrivacyPage() {
    return <PrivacyView />
}
