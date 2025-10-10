import { OfferSectionProffesor } from "./offer-section.model";
import { StaffRequest } from "./request";
import { Size, SpaceType } from "./request-detail.model";
import { Session } from "./section.model";

export interface RequestSession {
    id              : string;
    session           : Session;
    description     : string | null;
    isEnglish       : boolean;
    isConsecutive       : boolean;
    inAfternoon       : boolean;
    spaceSize : Size;
    spaceType : SpaceType;
    professor       : OfferSectionProffesor;
    createdAt       : Date;
    updatedAt       : Date;

    staffCreate     : StaffRequest;
    staffUpdate     : StaffRequest | null;


    // totalDetails    : number;
    // facultyId       : string;

    // section        : RequestSection
}


export interface RequestSessionCreate {
    session         : Session;
    description     : string | null;
    isEnglish       : boolean;
    isConsecutive   : boolean;
    inAfternoon     : boolean;
    spaceSizeId       : string | null;
    spaceType       : SpaceType | null;
    professorId     : string | null;
    staffCreate     : StaffRequest;
    spaceId         : string | null;

    dayModulesId    : number[];

    // totalDetails    : number;
    // facultyId       : string;

    // section        : RequestSection
}