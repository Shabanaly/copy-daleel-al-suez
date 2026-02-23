'use server'

import { getEventByIdUseCase, getActiveEventsUseCase } from "@/di/modules";
import { SuezEvent } from "@/domain/entities/suez-event";

import { createClient, createReadOnlyClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import { cache as reactCache } from "react";

export const getEventAction = reactCache(async (id: string): Promise<SuezEvent | null> => {
    try {
        const supabase = await createReadOnlyClient();
        return await getEventByIdUseCase.execute(id, supabase);
    } catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
})

export async function getEventsAction(limit: number = 10, offset: number = 0) {
    return await unstable_cache(
        async (l: number, o: number) => {
            const supabase = await createReadOnlyClient();
            return await getActiveEventsUseCase.execute(l, o, supabase);
        },
        ['active-events', limit.toString(), offset.toString()],
        { revalidate: 3600, tags: ['events'] }
    )(limit, offset);
}
