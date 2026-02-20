'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/presentation/components/ui/dropdown-menu";
import { MARKETPLACE_FORMS } from '@/config/marketplace-forms';
import { CATEGORY_ICONS } from '@/lib/constants/marketplace';
import { Store, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function MarketplaceMegaMenu() {
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category') || 'all';

    return (
        <div className="w-full overflow-x-auto no-scrollbar pb-2">
            <div className="flex w-full justify-start gap-2 px-4 md:px-[64px] min-w-max">
                {/* Note: justify-start + min-w-max ensures scrolling works correctly without clipping */}

                {/* My Ads Button */}
                <div className="flex-grow flex justify-center">
                    <Link href="/marketplace/my-items" className="group flex flex-col items-center gap-1 w-full p-1.5 rounded-xl transition-all duration-200 hover:bg-secondary/10">
                        <div className="p-1.5 rounded-full transition-colors bg-secondary/20 text-secondary group-hover:bg-secondary/30">
                            <Store size={18} />
                        </div>
                        <span className="text-[9px] font-bold whitespace-nowrap text-secondary">إعلاناتي</span>
                    </Link>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-border mx-1 shrink-0 self-center" />

                {/* All Categories Link */}
                <div className="flex-grow flex justify-center">
                    <Link
                        href="/marketplace/browse"
                        className={cn(
                            "flex flex-col items-center gap-1 w-full p-1.5 rounded-xl transition-all duration-200 group shrink-0",
                            (currentCategory === 'all' && !searchParams.has('category'))
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-full transition-colors",
                            (currentCategory === 'all' && !searchParams.has('category'))
                                ? "bg-primary text-white"
                                : "bg-muted group-hover:bg-muted-foreground/20 text-muted-foreground group-hover:text-foreground"
                        )}>
                            <Store size={18} />
                        </div>
                        <span className="text-[9px] font-bold whitespace-nowrap">الكل</span>
                    </Link>
                </div>

                {Object.values(MARKETPLACE_FORMS)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((category) => {
                        const IconComponent = CATEGORY_ICONS[category.icon] || CATEGORY_ICONS['Store'];
                        const isActive = currentCategory === category.id;
                        const hasSubTypes = category.subTypes && Object.keys(category.subTypes).length > 0;

                        return (
                            <div key={category.id} className="flex-grow flex justify-center">
                                {hasSubTypes ? (
                                    <HoverDropdown category={category} isActive={isActive} IconComponent={IconComponent} />
                                ) : (
                                    <Link
                                        href={`/marketplace/browse?category=${category.id}`}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 w-full p-2 rounded-xl transition-all duration-200 group shrink-0",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-full transition-colors",
                                            isActive ? "bg-primary text-white" : "bg-muted group-hover:bg-muted-foreground/20 text-muted-foreground group-hover:text-foreground"
                                        )}>
                                            <IconComponent size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold whitespace-nowrap">{category.label}</span>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

function HoverDropdown({ category, isActive, IconComponent }: { category: any, isActive: boolean, IconComponent: any }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 300); // Increased delay to 300ms for better stability across the gap
    };

    return (
        <DropdownMenu dir="rtl" open={isOpen} onOpenChange={setIsOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                <button
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={cn(
                        "flex flex-col items-center gap-1.5 w-full p-2 rounded-xl transition-all duration-200 group shrink-0 outline-none",
                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    <div className={cn(
                        "p-2 rounded-full transition-colors mx-auto relative",
                        isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:text-foreground hover:bg-muted-foreground/20"
                    )}>
                        <IconComponent size={20} />
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm border border-border">
                            <ChevronDown size={10} className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")} />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold whitespace-nowrap">{category.label}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="center"
                className="min-w-[200px] p-2 bg-popover rounded-xl shadow-lg border border-border !z-[100]"
                sideOffset={8}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onInteractOutside={(e) => {
                    // Prevent closing when interacting with the scrollbar or other necessary UI elements if needed
                    // For now, default behavior is fine, but modal={false} helps a lot
                }}
            >
                <div className="grid w-[250px] gap-1 md:w-[320px] md:grid-cols-1">
                    {Object.keys(category.subTypes).map((subType) => (
                        <DropdownMenuItem key={subType} asChild>
                            <Link
                                href={`/marketplace/browse?category=${category.id}&type=${encodeURIComponent(subType)}`}
                                className="flex w-full cursor-pointer items-center rounded-lg p-2 text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors focus:bg-primary/5 focus:text-primary"
                            >
                                {subType}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild>
                        <Link
                            href={`/marketplace/browse?category=${category.id}`}
                            className="flex w-full justify-center cursor-pointer items-center rounded-lg p-2 text-sm font-bold bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20 mt-1 focus:bg-primary/10"
                        >
                            عرض كل {category.label}
                        </Link>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


