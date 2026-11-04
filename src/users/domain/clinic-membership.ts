/** Roles scoped to one clinic; platform-wide roles belong to the user account. */
export enum ClinicRole {
    User = "clinic_user",
    Admin = "clinic_admin",
}

/** A user's authorization role within a specific clinic. */
export interface ClinicMembership {
    userId: string;
    clinicId: string;
    role: ClinicRole;
}