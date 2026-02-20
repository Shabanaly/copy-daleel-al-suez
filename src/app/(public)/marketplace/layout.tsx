import { MarketplaceFloatingAddButton } from '@/presentation/components/marketplace/floating-add-button'

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
            <MarketplaceFloatingAddButton />
        </>
    )
}
