import { Module, Status }   from "@/types/request";
import { Session }          from "@/types/section.model";
import { Role }             from "@/types/staff.model";
import { Building, SpaceType } from "./request-detail.model";


export interface OfferSectionProffesor {
    id  : string;
    name: string;
}


export interface OfferSectionSubject {
    id  : string;
    name: string;
}


export interface OfferSectionPeriod {
    id  : string;
    name: string;
}


export interface OfferModule {
    id          : string;
    code        : string;
    name        : string;
    startHour   : string;
    endHour     : string;
    diference   : 'A' | 'B' | null;
}


export interface OfferDay {
    id  : string;
    name: string;
}


export interface OfferSession {
    id                      : string;
    name                    : Session;
    spaceId                 : string;
    isEnglish               : boolean;
    chairsAvailable         : number;
    correctedRegistrants    : number;
    realRegistrants         : number;
    plannedBuilding         : string;
    professor               : OfferSectionProffesor;
    module                  : OfferModule;
    date                    : Date;
    dayId                   : number;
    dayModuleId             : number;
    requestSession?         : RequestSession;
}


interface RequestSessionGrade {
    id: string;
    name: string;
}


interface Staff {
    id: string;
    name: string;
    email: string;
    role: Role;
    facultyId: string;
}


interface SpaceSize {
    id          : string;
    detail      : string;
}


interface SessionDayModule {
    id      : string;
    dayId   : number;
    module  : Module;
}


interface RequestSessionDetail {
    id                  : string;
    session             : Session;
    building            : Building;
    spaceId             : string;
    isEnglish           : boolean;
    isConsecutive       : boolean;
    isAfternoon         : boolean;
    description         : string | null;
    professor           : OfferSectionProffesor | null;
    spaceSize           : SpaceSize | null;
    spaceType           : SpaceType | null;
    staffUpdate         : Staff;
    sessionDayModules   : SessionDayModule[];
    createdAt           : Date;
    updatedAt           : Date;
}


export interface RequestSession {
    id              : string;
    title           : string;
    status          : Status;
    staffCreate     : Staff;
    staffUpdated    : Staff;
    createdAt       : Date;
    updatedAt       : Date;
    requestSessions : RequestSessionDetail[];
}


export interface OfferSection {
    id              : string;
    code            : number;
    isClosed        : boolean;
    groupId         : string;
    startDate       : Date;
    endDate         : Date;
    spaceSizeId     : string | null;
    spaceType       : string | null;
    workshop        : number;
    lecture         : number;
    tutoringSession : number;
    laboratory      : number;
    professor       : OfferSectionProffesor;
    subject         : OfferSectionSubject;
    period          : OfferSectionPeriod;
    sessions        : OfferSession[];
}
