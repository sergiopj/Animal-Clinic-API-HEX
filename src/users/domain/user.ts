export enum PlatformRole {
    Admin = "platform_admin", // super admin, can manage clinics and users. and show all data
}

export interface User {
    id: string;
    issuer: string;
    subject: string;
    platformRole?: PlatformRole;
}