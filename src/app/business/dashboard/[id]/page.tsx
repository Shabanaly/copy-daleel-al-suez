import { BusinessDashboard } from "@/presentation/features/business/dashboard/business-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'لوحة تحكم الأعمال | دليل السويس',
    description: 'إدارة مكانك وتفاعل مع الزبائن',
};

type Props = {
    params: Promise<{ id: string }>
}

export default async function BusinessDashboardPage({ params }: Props) {
    const { id } = await params;

    return <BusinessDashboard placeId={id} />;
}
