import { Place } from "../entities/place";
import { IPlaceRepository } from "../interfaces/place-repository.interface";

export class GetPlacesByCategoryUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(categorySlug: string): Promise<Place[]> {
        return this.placeRepository.getPlacesByCategory(categorySlug);
    }
}
