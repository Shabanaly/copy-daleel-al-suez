'use client';

import { useSpyOnMarketplace } from '@/lib/user-spy/use-spy-on';

interface MarketplaceSpyProps {
    category?: string;
}

export function MarketplaceSpy({ category }: MarketplaceSpyProps) {
    useSpyOnMarketplace(category || '');
    return null;
}
