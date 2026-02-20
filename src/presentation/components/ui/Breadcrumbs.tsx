import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    return (
        <nav className={`flex items-center text-sm text-muted-foreground ${className}`} aria-label="Breadcrumb">
            <ol className="flex items-center gap-1">
                <li>
                    <Link href="/" className="flex items-center hover:text-primary transition-colors">
                        <Home size={16} />
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-1">
                        <ChevronLeft size={14} className="text-muted-foreground/60 rtl:rotate-180" />
                        {item.href ? (
                            <Link href={item.href} className="hover:text-primary transition-colors">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-medium text-foreground line-clamp-1 max-w-[150px] md:max-w-none">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
