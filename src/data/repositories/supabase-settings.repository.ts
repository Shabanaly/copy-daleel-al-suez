import { ISettingsRepository } from "@/domain/interfaces/settings-repository.interface";
import { Setting } from "@/domain/entities/setting";
import { SupabaseClient } from "@supabase/supabase-js";

interface SupabaseSettingRow {
    key: string;
    value: string;
    group: 'general' | 'contact' | 'menus' | 'system' | 'appearance';
    type: 'text' | 'boolean' | 'json' | 'image';
    label: string;
    description: string | null;
    is_public: boolean;
    updated_at: string;
}

export class SupabaseSettingsRepository implements ISettingsRepository {
    constructor(private supabase?: SupabaseClient) { }

    async getSettingsByGroup(group: string, client?: unknown): Promise<Setting[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('group', group)
            .order('key');

        if (error) throw new Error(error.message);
        return (data as SupabaseSettingRow[]).map(row => this.mapToEntity(row));
    }

    async getAllSettings(client?: unknown): Promise<Setting[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .order('group');

        if (error) throw new Error(error.message);
        return (data as SupabaseSettingRow[]).map(row => this.mapToEntity(row));
    }

    async getPublicSettings(client?: unknown): Promise<Record<string, unknown>> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return {};

        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('is_public', true);

        if (error) {
            console.error("Error fetching public settings:", error);
            return {};
        }

        const rows = data as SupabaseSettingRow[];

        // Convert to Key-Value map with parsed types
        const settingsMap: Record<string, unknown> = {};
        rows.forEach(item => {
            let parsedValue: unknown = item.value;
            if (item.type === 'boolean') parsedValue = item.value === 'true';
            if (item.type === 'json') {
                try {
                    parsedValue = JSON.parse(item.value);
                } catch (e) {
                    console.error(`Failed to parse scalar setting ${item.key}`, e);
                }
            }
            settingsMap[item.key] = parsedValue;
        });
        return settingsMap;
    }

    async updateSetting(key: string, value: string, client?: unknown): Promise<void> {
        // Use injected client (for server actions) or default (browser)
        const supabaseClient = (client as import('@supabase/supabase-js').SupabaseClient) || this.supabase;
        if (!supabaseClient) throw new Error("Supabase client not initialized");

        const { error } = await supabaseClient
            .from('settings')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key);

        if (error) throw new Error(error.message);
    }

    private mapToEntity(data: SupabaseSettingRow): Setting {
        return {
            key: data.key,
            value: data.value,
            group: data.group,
            type: data.type,
            label: data.label,
            description: data.description || '',
            isPublic: data.is_public,
            updatedAt: new Date(data.updated_at)
        };
    }
}
