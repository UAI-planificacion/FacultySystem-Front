import { Size } from "@/types/request-detail.model";


export interface Section {
    id                      : string;
    code                    : number;
    session                 : Session;
    size                    : Size | null;
    correctedRegistrants    : number | null;
    realRegistrants         : number | null;
    plannedBuilding         : string | null;
    chairsAvailable         : number | null;
    room                    : string | null;
    professorName           : string | null;
    professorId             : string | null;
    day                     : number | null;
    moduleId                : string | null;
    subjectName             : string | null;
    subjectId               : string | null;
    period                  : string;
    isClosed                : boolean;
    groupId                 : string;
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