import { Area } from "../entities/area";

export interface IAreaRepository {
    getAreas(client?: unknown): Promise<Area[]>;
    createArea(area: Partial<Area>, client?: unknown): Promise<Area>;
    getAreaByName(name: string, client?: unknown): Promise<Area | null>;
}
