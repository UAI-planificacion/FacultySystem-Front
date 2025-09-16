import { Size, SpaceType } from "@/types/request-detail.model";


interface BaseSubject {
    id              : string;
    name            : string;
    costCenterId    : string;
    spaceSize       : Size      | null;
    spaceTypeId     : SpaceType | null;
}


export interface Subject extends BaseSubject {
    facultyId   : string;
    isActive    : boolean;
    createAt    : Date      | string;
    updateAt    : Date      | string;
}


export interface CreateSubject extends BaseSubject {
    facultyId       : string;
}


export interface UpdateSubject extends Partial<BaseSubject> {}
