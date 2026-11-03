import { ClinicAddress } from "./clinic-address";

export { ClinicCountryCode } from "./clinic-address";
export type { ClinicAddress } from "./clinic-address";

export enum ClinicStatus {
  Active = "active",
  Inactive = "inactive",
}

export interface Clinic {
  id: string;
  name: string;
  status: ClinicStatus;
  address: ClinicAddress;
  phone: string;
  contactEmail: string;
}
