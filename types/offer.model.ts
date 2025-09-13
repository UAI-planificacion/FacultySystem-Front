import { Building, Size, SpaceType } from "@/types/request-detail.model";


interface Id {
    id: string;
}


export interface BasicOffer {
    startDate       : Date[];
    endDate         : Date[];
    building        : Building  | null;
    isEnglish       : boolean;
    workshop        : number;
    lecture         : number;
    tutorialSession : number;
    laboratory      : number;
    subjectId       : string;
    spaceType       : SpaceType | null;
    spaceSize       : Size      | null;
    periodId        : string;
}


export interface Offer extends Id, BasicOffer {}


export interface CreateOffer extends BasicOffer {}


export interface UpdateOffer extends Partial<BasicOffer> {
    id: string;
}
