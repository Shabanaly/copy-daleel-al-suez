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
export async function createAreaAction(area: Partial<Area>): Promise<{ success: boolean; data?: Area; error?: string; isDuplicate?: boolean }> {
    try {
        const supabase = await createClient();
        const areaRepository = new SupabaseAreaRepository(supabase);

        // 1. Check if area already exists
        if (area.name) {
            const existing = await areaRepository.getAreaByName(area.name);
            if (existing) {
                return { success: true, data: existing, isDuplicate: true };
            }
        }

        // 2. Otherwise create new one
        const result = await areaRepository.createArea(area);
        return { success: true, data: result };
    } catch (error: any) {
        console.error('Error creating area:', error);
        return { success: false, error: error.message };
    }
}
