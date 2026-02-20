'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    searchParams?: Record<string, string | undefined>;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
    if (totalPages <= 1) return null;

    const buildUrl = (page: number) => {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value && key !== 'page') params.set(key, value);
        });
        if (page > 1) params.set('page', String(page));
        const qs = params.toString();
        return qs ? `${baseUrl}?${qs}` : baseUrl;
    };

    // Generate page numbers to show
    const pages: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push('...');

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);

        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
    }

    return (
        <nav className="flex items-center justify-center gap-1 mt-8" dir="ltr" aria-label="Pagination">
            {/* Previous */}
            {currentPage > 1 ? (
                <Link
                    href={buildUrl(currentPage - 1)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">السابق</span>
                </Link>
            ) : (
                <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/40 cursor-not-allowed">
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">السابق</span>
                </span>
            )}

            {/* Page Numbers */}
            {pages.map((page, i) => {
                if (page === '...') {
                    return (
                        <span key={`dots-${i}`} className="px-2 py-2 text-sm text-muted-foreground">
                            …
                        </span>
                    );
                }
                return page === currentPage ? (
                    <span
                        key={page}
                        className="px-3.5 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground shadow-sm"
                    >
                        {page}
                    </span>
                ) : (
                    <Link
                        key={page}
                        href={buildUrl(page)}
                        className="px-3.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                        {page}
                    </Link>
                );
            })}

            {/* Next */}
            {currentPage < totalPages ? (
                <Link
                    href={buildUrl(currentPage + 1)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                    <span className="hidden sm:inline">التالي</span>
                    <ChevronRight size={16} />
                </Link>
            ) : (
                <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/40 cursor-not-allowed">
                    <span className="hidden sm:inline">التالي</span>
                    <ChevronRight size={16} />
                </span>
            )}
        </nav>
    );
}
