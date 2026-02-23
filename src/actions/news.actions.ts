'use server'

import { getArticlesUseCase, getArticleByIdUseCase } from "@/di/modules";
import { Article } from "@/domain/entities/article";
import { createReadOnlyClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import { cache as reactCache } from "react";

export const getArticleAction = reactCache(async (id: string): Promise<Article | null> => {
    try {
        const supabase = await createReadOnlyClient();
        return await getArticleByIdUseCase.execute(id, supabase);
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
})

export async function getArticlesAction(limit: number = 10, offset: number = 0) {
    return await unstable_cache(
        async (l: number, o: number) => {
            const supabase = await createReadOnlyClient();
            return await getArticlesUseCase.execute(l, o, supabase);
        },
        ['news-articles', limit.toString(), offset.toString()],
        { revalidate: 3600, tags: ['news'] }
    )(limit, offset);
}
