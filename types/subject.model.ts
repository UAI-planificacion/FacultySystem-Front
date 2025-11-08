import { BuildingEnum, Size, SpaceType } from "@/types/request-detail.model";


interface BaseSubject {
    id              : string;
    name            : string;
    spaceSizeId     : Size      | null;
    spaceType       : SpaceType | null;
    workshop        : number;
    lecture         : number;
    tutoringSession : number;
    laboratory      : number;
    quota           : number | null;
}


interface Grade {
    id              : string;
    name            : string;
    headquartersId  : string;
}


export interface Subject extends BaseSubject {
    facultyId   : string;
    isActive    : boolean;
    createAt    : Date      | string;
    updateAt    : Date      | string;
    offersCount : number;
    grade       : Grade | null;
}


export interface CreateSubject extends BaseSubject {
    facultyId   : string;
    gradeId     : string | null;
}


export interface UpdateSubject extends Partial<BaseSubject> {
    gradeId?    : string | null;
    isActive?   : boolean;
}


export interface CreateOfferSubject {
	subjectId       : string;
	periodId        : string;
	professorId     : string | null;
	numberOfSections: number;
	spaceType       : string | null;
	spaceSizeId     : string | null;
	building        : BuildingEnum | null;
	workshop        : number;
	lecture         : number;
	tutoringSession : number;
	laboratory      : number;
	startDate       : Date;
	endDate         : Date;
    quota           : number;
}
