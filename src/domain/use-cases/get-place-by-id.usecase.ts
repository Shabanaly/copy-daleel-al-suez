import { Place } from "../entities/place";
import { IPlaceRepository } from "../interfaces/place-repository.interface";

export class GetPlaceByIdUseCase {
    constructor(private placeRepository: IPlaceRepository) { }

    async execute(id: string): Promise<Place | null> {

        return this.placeRepository.getPlaceById(id);
    }
}
