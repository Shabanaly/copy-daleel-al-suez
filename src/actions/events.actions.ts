'use server'

import { getEventByIdUseCase } from "@/di/modules";
import { SuezEvent } from "@/domain/entities/suez-event";

import { createClient, createReadOnlyClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import { eventRepository } from "@/di/modules";
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

export const getCachedActiveEvents = unstable_cache(
    async (limit: number = 10) => {
        const supabase = await createReadOnlyClient();
        return await eventRepository.getEvents({ status: 'active', limit }, supabase);
    },
    ['active-events'],
    { revalidate: 3600, tags: ['events'] }
)
