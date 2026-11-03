import { Pet } from "../../../domain/pet";

export const GET_ALL_PETS_USE_CASE = Symbol("GET_ALL_PETS_USE_CASE");

export interface GetAllPetsUseCasePort {
  execute(): Promise<Pet[]>;
}