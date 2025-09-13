import { Building, Size, SpaceType } from "@/types/request-detail.model";

interface BaseSubject {
    id              : string;
    name            : string;
    // startDate       : Date[];
    // endDate         : Date[];
    // students        : number;
    costCenterId    : string;
    // isEnglish       : boolean;
    isActive       : boolean;
    // building        : Building  | null;
    spaceSize       : Size      | null;
    spaceType       : SpaceType | null;
    createAt        : Date | string;
    updateAt        : Date | string;
}


export interface Subject extends BaseSubject {
    facultyId   : string;
    isActive    : boolean;
    createdAt   : Date;
    updatedAt   : Date;
}


export interface CreateSubject extends BaseSubject {
    facultyId       : string;
}


export interface UpdateSubject extends Partial<BaseSubject> {}
