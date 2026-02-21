import { District } from "../entities/district";

export interface IDistrictRepository {
    getDistricts(client?: unknown): Promise<District[]>;
    getDistrictById(id: string, client?: unknown): Promise<District | null>;
}
