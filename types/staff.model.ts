export type Role = 'admin' | 'editor' | 'viewer';

export interface Staff {
    id          : string;
    name        : string;
    email       : string;
    position    : string;
    role        : Role;
}
