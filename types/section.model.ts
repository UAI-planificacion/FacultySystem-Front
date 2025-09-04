import { Size } from "@/types/request-detail.model";


export interface Section {
    id                      : string;
    code                    : number;
    session                 : Session;
    size                    : Size;
    correctedRegistrants    : number;
    realRegistrants         : number;
    plannedBuilding         : string;
    chairsAvailable         : number;
    room                    : string;
    professorName           : string;
    professorId             : string;
    day                     : number;
    moduleId                : string;
    subjectName             : string;
    subjectId               : string;
    period                  : string;
    isClosed                : boolean;
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