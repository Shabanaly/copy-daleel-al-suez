import { QuestionDetailView } from "@/presentation/features/community/question-detail-view";
import { Metadata } from "next";
import { getQuestionByIdAction, getAnswersAction } from "@/actions/community.actions";

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const { id } = await params;
    const question = await getQuestionByIdAction(id);

    if (!question) {
        return {
            title: 'السؤال غير موجود | مجتمع السويس',
        };
    }

    const seoTitle = question.content.length > 50
        ? `${question.content.substring(0, 50)}...`
        : question.content;

    const seoDescription = question.content.length > 160
        ? `${question.content.substring(0, 157)}...`
        : question.content;

    return {
        title: `${seoTitle} | مجتمع السويس`,
        description: seoDescription,
        openGraph: {
            title: seoTitle,
            description: seoDescription,
            type: 'article',
        },
    };
}



export default async function QuestionDetailPage({ params }: Props) {
    const { id } = await params;

    // Prefetch on server
    const [question, answers] = await Promise.all([
        getQuestionByIdAction(id),
        getAnswersAction(id)
    ]);

    return (
        <main className="min-h-screen bg-background/50">
            <QuestionDetailView
                questionId={id}
                initialQuestion={question || undefined}
                initialAnswers={answers}
            />
        </main>
    );
}
