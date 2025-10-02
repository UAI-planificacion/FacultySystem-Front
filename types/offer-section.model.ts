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
    name                    : string;
    spaceId                 : string;
    isEnglish               : boolean;
    chairsAvailable         : number;
    correctedRegistrants    : number;
    realRegistrants         : number;
    plannedBuilding         : string;
    professor               : OfferSectionProffesor;
    module                  : OfferModule;
    day                     : OfferDay;
}


export interface OfferSection {
    id              : string;
    code            : number;
    isClosed        : boolean;
    groupId         : string;
    startDate       : Date | null;
    endDate         : Date | null;
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
