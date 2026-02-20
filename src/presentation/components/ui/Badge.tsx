/**
 * Badge Component
 * 
 * Versatile badge component with multiple variants for status, categories, etc.
 */

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors',
    {
        variants: {
            variant: {
                // Status variants
                open: 'bg-green-600 text-white dark:bg-green-900/40 dark:text-green-400',
                closed: 'bg-red-600 text-white dark:bg-red-900/40 dark:text-red-400',
                live: 'bg-amber-500 text-white dark:bg-amber-900/40 dark:text-amber-400 animate-pulse',
                upcoming: 'bg-blue-600 text-white dark:bg-blue-900/40 dark:text-blue-400',
                verified: 'bg-purple-600 text-white dark:bg-purple-900/40 dark:text-purple-400',

                // UI variants
                default: 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-200',
                primary: 'bg-primary text-primary-foreground dark:bg-primary-900/40 dark:text-primary-400',
                secondary: 'bg-secondary text-secondary-foreground dark:bg-secondary-900/40 dark:text-secondary-400',
                success: 'bg-green-600 text-white dark:bg-green-900/40 dark:text-green-400',
                warning: 'bg-amber-500 text-white dark:bg-amber-900/40 dark:text-amber-400',
                error: 'bg-red-600 text-white dark:bg-red-900/40 dark:text-red-400',

                // Outline variant
                outline: 'border border-current text-gray-700 dark:text-gray-300',
            },
            size: {
                sm: 'px-2 py-0.5 text-xs',
                md: 'px-2.5 py-0.5 text-sm',
                lg: 'px-3 py-1 text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    /**
     * Optional icon to display before the text
     */
    icon?: React.ReactNode;
    /**
     * Show pulsing dot indicator (for live status)
     */
    pulse?: boolean;
}

export function Badge({
    className,
    variant,
    size,
    icon,
    pulse,
    children,
    ...props
}: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
            {pulse && (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                </span>
            )}
            {icon && <span className="inline-flex items-center">{icon}</span>}
            {children}
        </div>
    );
}

// Specialized badge components for common use cases
export function OpenBadge() {
    return (
        <Badge variant="open" pulse>
            مفتوح الآن
        </Badge>
    );
}

export function ClosedBadge({ opensAt }: { opensAt?: string }) {
    return (
        <Badge variant="closed">
            مغلق {opensAt && `• يفتح ${opensAt}`}
        </Badge>
    );
}

export function LiveBadge() {
    return (
        <Badge variant="live" pulse>
            🔴 مباشر
        </Badge>
    );
}

export function VerifiedBadge() {
    return (
        <Badge variant="verified" icon={<span>✓</span>}>
            موثق
        </Badge>
    );
}
