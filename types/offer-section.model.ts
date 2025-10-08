import { RequestProfessor, Status } from "./request";
import { Session } from "./section.model";

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


export interface RequestSession {
    id          : string;
    title       : string;
    spaceId     : string | null;
    isEnglish   : boolean;
    isAfternoon : boolean;
    description : string | null;
    building    : string | null;
    professor   : RequestProfessor;
    moduleId    : number;
    grade       : RequestSessionGrade;
    status      : Status;
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
