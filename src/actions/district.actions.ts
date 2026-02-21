'use server'

import { createClient } from "@/lib/supabase/server";
import { SupabaseDistrictRepository } from "@/data/repositories/supabase-district.repository";
import { District } from "@/domain/entities/district";

export async function getDistrictsAction(): Promise<District[]> {
    try {
        const supabase = await createClient();
        const districtRepository = new SupabaseDistrictRepository(supabase);
        return await districtRepository.getDistricts();
    } catch (error) {
        console.error('Error fetching districts:', error);
        return [];
    }
}
