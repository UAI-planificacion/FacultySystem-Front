import { Size } from "@/types/request-detail.model";

export interface SectionBase {
    session                 : Session;
    size                    : Size | null | undefined;
    correctedRegistrants    : number | null;
    realRegistrants         : number | null;
    plannedBuilding         : string | null;
    chairsAvailable         : number | null;
    professorId             : string | null;
}


export interface Section extends SectionBase {
    id                      : string;
    period                  : string;
    professorName           : string | null;
    room                    : string | null;
    code                    : number;
    day                     : number | null;
    moduleId                : string | null;
    subjectName             : string;
    subjectId               : string;
    isClosed                : boolean;
    groupId                 : string;    
}


export interface CreateSectionRequest extends SectionBase {
    roomId      : string | null;
    periodId    : string;
    subjectId   : string;

    code                    : number;
    day                     : number | null;
    moduleId                : string | null;
    groupId                 : string;    
}


export interface UpdateSectionRequest extends SectionBase {
    id          : string;
    roomId      : string | null;
    day         : number | null;
    moduleId    : string | null;
}


export enum Session {
    C = 'C', // Cátedra
    A = 'A', // Ayudantía
    T = 'T', // Taller
    L = 'L'  // Laboratorio
}

export interface SectionToCreate {
    periodId    : string;
    session     : Session;
    code        : number;
    groupId     : string;
}

export interface SessionCounts {
    [Session.C]: number;
    [Session.A]: number;
    [Session.T]: number;
    [Session.L]: number;
}

export interface SectionData {
    id              : string;
    period          : string;
    sessionCounts   : SessionCounts;
    sectionNumber   : number;
    isNew           : boolean;
}
