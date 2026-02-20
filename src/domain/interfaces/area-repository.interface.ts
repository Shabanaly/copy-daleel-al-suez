import { Area } from "../entities/area";

export interface IAreaRepository {
    getAreas(client?: unknown): Promise<Area[]>;
}
