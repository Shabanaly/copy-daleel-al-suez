import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketplaceEmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    action?: {
        label: string;
        href: string;
        icon?: LucideIcon;
    };
    className?: string;
}

export function MarketplaceEmptyState({
    title,
    description,
    icon: Icon,
    action,
    className
}: MarketplaceEmptyStateProps) {
    return (
        <div className={cn("text-center py-16 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20 flex flex-col items-center justify-center p-6", className)}>
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Icon size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">{description}</p>
            {action && (
                <Link
                    href={action.href}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20"
                >
                    {action.icon && <action.icon size={18} />}
                    <span>{action.label}</span>
                </Link>
            )}
        </div>
    );
}
