import { Place } from "../entities/place";
import { IPlaceRepository } from "../interfaces/place-repository.interface";

export class SearchPlacesUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(query: string = "", areaId?: string): Promise<Place[]> {
        return this.placeRepository.searchPlaces(query, areaId);
    }
}
