import { Grade }        from "@/types/grade";
import { StaffRequest } from "@/types/request";


//Communic & garage are multipurpose
export enum SpaceType {
    ROOM                = "ROOM",
    AUDITORIO           = "AUDITORIO",
    LAB                 = "LAB",
    LABPC               = "LABPC",
    DIS                 = "DIS",
    CORE                = "CORE",
    STUDY_ROOM          = "STUDY_ROOM",
    MEETING_ROOM        = "MEETING_ROOM",
    POSTGRADUATE_ROOM   = "POSTGRADUATE_ROOM",
    MULTIPURPOSE        = "MULTIPURPOSE"
}


export enum Building {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
}


export enum BuildingEnum {
    PREGRADO_A    = 'PREGRADO_A',
    PREGRADO_B    = 'PREGRADO_B',
    POSTGRADO_C   = 'POSTGRADO_C',
    TALLERES_D    = 'TALLERES_D',
    TALLERES_E    = 'TALLERES_E',
    PREGRADO_F    = 'PREGRADO_F',
    ERRAZURIZ     = 'ERRAZURIZ',
    VITACURA      = 'VITACURA',
    VINA_A        = 'VINA_A',
    VINA_B        = 'VINA_B',
    VINA_C        = 'VINA_C',
    VINA_D        = 'VINA_D',
    VINA_E        = 'VINA_E',
    VINA_F        = 'VINA_F',
    Z             = 'Z'
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
