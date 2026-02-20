'use server'

import { SupabaseAreaRepository } from "@/data/repositories/supabase-area.repository";
import { Area } from "@/domain/entities/area";
import { createClient } from "@/lib/supabase/server";

export async function getAreasAction(): Promise<Area[]> {
    try {
        const supabase = await createClient();
        const areaRepository = new SupabaseAreaRepository(supabase);
        return await areaRepository.getAreas();
    } catch (error) {
        console.error('Error fetching areas:', error);
        return [];
    }
}
