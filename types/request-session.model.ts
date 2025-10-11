import { OfferSectionProffesor }    from "@/types/offer-section.model";
import { StaffRequest }             from "@/types/request";
import { Size, SpaceType }          from "@/types/request-detail.model";
import { Session }                  from "@/types/section.model";


export interface RequestSession {
    id              : string;
    session         : Session;
    description     : string | null;
    isEnglish       : boolean;
    isConsecutive   : boolean;
    inAfternoon     : boolean;
    spaceSize       : Size;
    spaceType       : SpaceType;
    professor       : OfferSectionProffesor;
    createdAt       : Date;
    updatedAt       : Date;
    staffCreate     : StaffRequest;
    staffUpdate     : StaffRequest | null;
}


export interface RequestSessionCreate {
    session         : Session;
    description     : string | null;
    isEnglish       : boolean;
    isConsecutive   : boolean;
    inAfternoon     : boolean;
    spaceSizeId     : string | null;
    spaceType       : SpaceType | null;
    professorId     : string | null;
    spaceId         : string | null;
    building        : string;
    dayModulesId    : number[];
}