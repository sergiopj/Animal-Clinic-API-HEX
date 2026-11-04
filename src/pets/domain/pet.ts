export enum Species {
  Dog = "dog",
  Cat = "cat",
  Fish = "fish",
  Bird = "bird",
  Reptile = "reptile",
}

export enum Gender {
  Male = "male",
  Female = "female",
}

export interface Pet {
  id: string;
  name: string;
  species: Species;
  gender: Gender;
  birthdate: string;
  clinicId: string;
}
