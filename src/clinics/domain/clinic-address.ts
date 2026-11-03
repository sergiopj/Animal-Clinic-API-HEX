export enum ClinicCountryCode {
  Spain = "ES",
  Portugal = "PT",
  UnitedKingdom = "GB",
}

export interface ClinicAddress {
  street: string;
  city: string;
  postalCode: string;
  countryCode: ClinicCountryCode;
  region: string;
}
