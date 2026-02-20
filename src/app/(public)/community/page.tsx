import { CommunityView } from "@/presentation/features/community/community-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'مجتمع السويس | دليل السويس',
    description: 'شارك، استفسر، وساعد الآخرين في مجتمع السويس الرقمي.',
};

export default function CommunityPage() {
    return (
        <main className="min-h-screen bg-background/50">
            <CommunityView />
        </main>
    );
}
