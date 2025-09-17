import { Grade }        from "@/types/grade";
import { StaffRequest } from "@/types/request";


export enum SpaceType {
    ROOM        = "ROOM",
    AUDITORIO   = "AUDITORIO",
    COMMUNIC    = "COMMUNIC",
    LAB         = "LAB",
    LABPC       = "LABPC",
    DIS         = "DIS",
    GARAGE      = "GARAGE",
    CORE        = "CORE",
}


export enum Building {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
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


export interface ModuleDay {
    id?          : string;
    day         : string;
    moduleId    : string;
}


export interface BaseRequestDetail {
    minimum?        : number | null;
    maximum?        : number | null;
    spaceType?      : SpaceType | null;
    spaceSize?      : Size | null;
    costCenterId?   : string | null;
    inAfternoon?    : boolean;
    building?       : Building | null;
    description?    : string | null;
    moduleId?       : string | null;
    days?           : string[];
    spaceId?        : string | null;
    isPriority?     : boolean;
    professorId?    : string | null;
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
    spaceId         : string | null;
    isPriority      : boolean;
    grade           : Grade | null;
    professorId     : string | null;
    staffCreate     : StaffRequest;
    staffUpdate     : StaffRequest | null;
    createdAt       : Date;
    updatedAt       : Date;
    moduleDays      : ModuleDay[];
}


export interface CreateRequestDetail extends Omit<BaseRequestDetail, 'comment'> {
    requestId       : string;
    inAfternoon     : boolean;
    isPriority      : boolean;
    staffCreateId   : string;
    gradeId?        : string | null;
}


export interface UpdateRequestDetail {
    id              : string;
    minimum?        : number | null;
    maximum?        : number | null;
    spaceType?      : SpaceType | null;
    spaceSize?      : Size | null;
    costCenterId?   : string | null;
    inAfternoon?    : boolean;
    building?       : Building | null;
    moduleId?       : string | null;
    days?           : string[];
    spaceId?        : string | null;
    isPriority?     : boolean;
    gradeId?        : string | null;
    professorId?    : string | null;
    moduleDays?     : ModuleDay[];
    staffUpdateId   : string;
}
