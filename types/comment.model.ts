export interface StaffComment {
    id      : string;
    name    : string;
    email   : string;
}


export interface RequestComment {
    id      : string
    name    : string;
}


export interface RequestDetailComment {
    id: string;
}


export interface Comment {
    id              : string;
    content         : string;
    parentCommentId : string | null;
    request         : RequestComment | null;
    requestDetail   : RequestDetailComment | null;
    staff           : StaffComment | null;
    adminName       : string | null;
    adminEmail      : string | null;
    createdAt       : Date | string;
    updatedAt       : Date | string;
}
