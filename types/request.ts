import { Role } from "./staff.model";

export enum Status {
    PENDING     = "PENDING",
    APPROVED    = "APPROVED",
    REJECTED    = "REJECTED",
    REVIEWING   = "REVIEWING",
}


export enum SpaceType {
    ROOM        = "ROOM",
    AUDITORIUM  = "AUDITORIUM",
    COMMUNIC    = "COMMUNIC",
    LAB         = "LAB",
    LABPC       = "LABPC",
    DIS         = "DIS",
    GARAGE      = "GARAGE",
    CORE        = "CORE",
}

export enum Size {
    XS  = "XS",
    XE  = "XE",
    S   = "S",
    SE  = "SE",
    MS  = "MS",
    M   = "M",
    L   = "L",
    XL  = "XL",
    XXL = "XXL",
}

export enum Nivel {
    PREGRADO        = "PREGRADO",
    FIRST_GRADE     = "FIRST_GRADE",
    SECOND_GRADE    = "SECOND_GRADE",
}

export enum Building {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
}

export interface StaffRequest {
    id      : string;
    name    : string;
    email   : string;
    role    : Role;
}

export interface SubjectRequest {
    id      : string;
    name    : string;
}

export interface Professor {
    id      : string;
    name    : string;
    email   : string;
}

export interface RequestDetail {
    id              : string;
    requestId       : string;
    minimum         : number | null;
    maximum         : number | null;
    spaceType       : SpaceType | null;
    spaceSize       : Size | null;
    costCenterId    : string | null;
    inAfternoon     : boolean;
    building        : Building | null;
    description     : string | null;
    comment         : string | null;
    moduleId        : string | null;
    days            : string[];
    spaceId         : string | null;
    isPriority      : boolean;
    nivel           : Nivel;
    professor       : Professor | null;
    staffCreate     : StaffRequest;
    staffUpdate     : StaffRequest | null;
    createdAt       : Date;
    updatedAt       : Date;
}


export interface Request {
    id              : string;
    title           : string;
    status          : Status;
    isConsecutive   : boolean;
    description     : string | null;
    comment         : string | null;
    updatedAt       : Date;
    createdAt       : Date;
    staffCreate     : StaffRequest;
    staffUpdate     : StaffRequest | null;
    subject         : SubjectRequest;
    totalDetails    : number;
}


export interface UpdateRequest {
    id              : string;
    title?          : string;
    status?         : Status;
    isConsecutive?  : boolean;
    subjectId?      : string;
    comment?        : string | null;
}
