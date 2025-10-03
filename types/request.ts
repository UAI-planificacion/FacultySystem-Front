import { Offer }    from "@/types/offer.model";
import { Role }     from "@/types/staff.model";


export enum Status {
    PENDING     = "PENDING",
    APPROVED    = "APPROVED",
    REJECTED    = "REJECTED",
    REVIEWING   = "REVIEWING",
}


export interface DayModule {
    id          : number;
    dayId       : number;
    moduleId    : number;
}


export interface Module {
    id          : number;
    code        : string;
    difference  : string | null;
    startHour   : string;
    endHour     : string;
    isActive    : boolean;
    createdAt   : string;
    updatedAt   : string;
    name        : string;
    days        : number[];
}


export interface Day {
    id          : number;
    name        : string;
    shortName   : string;
    mediumName  : string;
}


export interface SizeResponse {
    id          : string;
    detail      : string;
    min         : number | null;
    max         : number | null;
    lessThan    : number | null;
    greaterThan : number | null;
}


export interface StaffRequest {
    id      : string;
    name    : string;
    email   : string;
    role    : Role;
}


export interface Request {
    id              : string;
    title           : string;
    status          : Status;
    isConsecutive   : boolean;
    description     : string | null;
    updatedAt       : Date;
    createdAt       : Date;
    staffCreate     : StaffRequest;
    staffUpdate     : StaffRequest | null;
    offer           : Offer;
    totalDetails    : number;
    facultyId       : string;
}


export interface CreateRequest {
    id?             : string | null;
    title           : string;
    isConsecutive?   : boolean;
    subjectId?      : string;
    staffCreateId   : string;
    description?    : string | null;
}


export interface UpdateRequest {
    id              : string;
    title?          : string;
    status?         : Status;
    isConsecutive?  : boolean;
    subjectId?      : string;
    staffUpdateId?  : string;
    description?    : string | null;
}
