import { QuestionDetailView } from "@/presentation/features/community/question-detail-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'تفاصيل السؤال | مجتمع السويس',
    description: 'شاهد إجابات المجتمع وشارك بخبرتك في مجتمع السويس.',
};

type Props = {
    params: Promise<{ id: string }>
}

export default async function QuestionDetailPage({ params }: Props) {
    const { id } = await params;

    return (
        <main className="min-h-screen bg-background/50">
            <QuestionDetailView questionId={id} />
        </main>
    );
}
