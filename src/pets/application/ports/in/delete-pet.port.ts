export const DELETE_PET_USE_CASE = Symbol("DELETE_PET_USE_CASE");

export interface DeletePetUseCasePort {
  execute(id: string, clinicIds?: string[]): Promise<boolean>;
}
