import { SupabaseMarketplaceRepository } from '@/data/repositories/supabase-marketplace.repository';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { MarketplaceItemForm } from '@/presentation/components/marketplace/marketplace-item-form';

export const dynamic = 'force-dynamic';

export default async function EditMarketplaceItemPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const repository = new SupabaseMarketplaceRepository(supabase);
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect(`/login?next=/marketplace/edit/${id}`);
    }

    const item = await repository.getItemById(id);
    if (!item) {
        notFound();
    }

    if (item.seller_id !== user.id) {
        redirect('/marketplace');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-8 text-gray-900">تعديل الإعلان</h1>
                <MarketplaceItemForm
                    initialData={item}
                    categoryConfig={{ id: item.category }}
                />
            </div>
        </div>
    );
}
