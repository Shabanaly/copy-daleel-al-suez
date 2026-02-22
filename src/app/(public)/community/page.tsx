import { CommunityView } from "@/presentation/features/community/community-view";
import { Metadata } from "next";
import { getQuestionsAction } from "@/actions/community.actions";
import { createReadOnlyClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
    title: 'مجتمع السويس | دليل السويس',
    description: 'شارك، استفسر، وساعد الآخرين في مجتمع السويس الرقمي.',
};

export const revalidate = 60; // ISR for community list

export default async function CommunityPage() {
    const supabase = await createReadOnlyClient();
    const initialQuestions = await getQuestionsAction(undefined, supabase);

    return (
        <main className="min-h-screen bg-background/50">
            <CommunityView initialQuestions={initialQuestions} />
        </main>
    );
}
