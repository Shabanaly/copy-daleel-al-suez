import { IAreaRepository } from "../interfaces/area-repository.interface";
import { Area } from "../entities/area";

export class GetAreasUseCase {
    constructor(private areaRepository: IAreaRepository) { }

    async execute(client?: unknown): Promise<Area[]> {
        return this.areaRepository.getAreas(client);
    }
}
