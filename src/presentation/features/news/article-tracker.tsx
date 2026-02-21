'use client';

import { useSpyOnArticle } from '@/lib/user-spy/use-spy-on';

interface ArticleTrackerProps {
    id: string;
    title: string;
}

export function ArticleTracker({ id, title }: ArticleTrackerProps) {
    useSpyOnArticle(id, title);
    return null;
}
