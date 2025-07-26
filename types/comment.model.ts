export interface StaffComment {
    name    : string;
    email   : string;
}


export interface Comment {
    id              : string;
    content         : string;
    // request         : RequestComment | null;
    // requestDetail   : RequestDetailComment | null;
    staff           : StaffComment | null;
    adminName       : string | null;
    adminEmail      : string | null;
    createdAt       : Date | string;
    updatedAt       : Date | string;
}


export interface CreateComment {
    content             : string;
    requestId?          : string | null | undefined;
    requestDetailId?    : string | null | undefined;
    adminName           : string;
    adminEmail          : string;
}

export interface UpdateComment {
    id      : string;
    content : string;
}
