'use server'

import { getEventByIdUseCase } from "@/di/modules";
import { SuezEvent } from "@/domain/entities/suez-event";

import { createClient } from "@/lib/supabase/server";

export async function getEventAction(id: string): Promise<SuezEvent | null> {
    try {
        const supabase = await createClient();
        return await getEventByIdUseCase.execute(id, supabase);
    } catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
}
