import { Place } from "../entities/place";
import { IPlaceRepository } from "../interfaces/place-repository.interface";

export class GetTopRatedPlacesUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(limit: number = 8, client?: unknown): Promise<Place[]> {
        return this.placeRepository.getTopRatedPlaces(limit, client);
    }
}
