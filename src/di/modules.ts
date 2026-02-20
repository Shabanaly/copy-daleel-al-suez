/**
 * Dependency Injection Central Module
 * This file acts as a facade, exporting instances from domain-specific modules.
 */

export * from './places.module';
export * from './reviews.module';
export * from './community.module';
export * from './auth.module';

// For any remaining one-offs (like Settings which were disabled)
import { SupabaseSettingsRepository } from "@/data/repositories/supabase-settings.repository";
export const settingsRepository = new SupabaseSettingsRepository();
