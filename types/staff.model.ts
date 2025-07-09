export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface Staff {
    id          : string;
    name        : string;
    email       : string;
    isActive    : boolean;
    role        : Role;
    createdAt   : Date;
    updatedAt   : Date;
}
