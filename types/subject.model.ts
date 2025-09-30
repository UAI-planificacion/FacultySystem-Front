import { Size, SpaceType } from "@/types/request-detail.model";


interface BaseSubject {
    id              : string;
    name            : string;
    spaceSizeId     : Size      | null;
    spaceType       : SpaceType | null;
    workshop        : number;
    lecture         : number;
    tutoringSession : number;
    laboratory      : number;
}


export interface Subject extends BaseSubject {
    facultyId   : string;
    isActive    : boolean;
    createAt    : Date      | string;
    updateAt    : Date      | string;
    offersCount : number;
}


export interface CreateSubject extends BaseSubject {
    facultyId: string;
}


export interface UpdateSubject extends Partial<BaseSubject> {}
