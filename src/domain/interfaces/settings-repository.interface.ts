import { Setting } from "../entities/setting";

export interface ISettingsRepository {
    getSettingsByGroup(group: string, client?: unknown): Promise<Setting[]>;
    getAllSettings(client?: unknown): Promise<Setting[]>;
    getPublicSettings(client?: unknown): Promise<Record<string, unknown>>; // Returns key-parsedValue map for frontend
    updateSetting(key: string, value: string, client?: unknown): Promise<void>;
}
