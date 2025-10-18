import { OfferSection, OfferSectionProffesor } from '@/types/offer-section.model';
import { Status } from "./request";
import { BuildingEnum, Size, SpaceType } from "./request-detail.model";
import { Session } from "./section.model";
import { SizeId } from "./size.model";
import { SessionBase } from './session-request.model';


export interface PlanningChange {
    id              : string;
    sessionName     : Session;
    professor       : OfferSectionProffesor;
    spaceSize       : Size          | null;
    spaceType       : SpaceType     | null;
    spaceId         : string        | null;
    isEnglish       : boolean;
    isConsecutive   : boolean;
    inAfternoon     : boolean;
    description     : string        | null;
    building        : BuildingEnum  | null;
    title           : string;
    status          : Status;
    sessionId       : SessionBase;
    dayModulesId    : number[];
}


interface PlanningChangeSave {
    sessionName     : Session | null;
    professorId     : string        | null;
    spaceSizeId     : SizeId        | null;
    spaceType       : SpaceType     | null;
    spaceId         : string        | null;
    isEnglish       : boolean       | null;
    isConsecutive   : boolean       | null;
    inAfternoon     : boolean       | null;
    description     : string        | null;
    building        : BuildingEnum  | null;
    title           : string;
    status          : Status        | null;
    sessionId       : string        | null;
    dayModulesId    : number[];
}


export interface PlanningChangeCreate extends PlanningChangeSave {
    staffCreateId   : string;
    sectionId       : string | null;
}


export interface PlanningChangeUpdate extends PlanningChangeSave {
    id              : string;
    staffUpdateId   : string;
}


interface SubjectSectionPlanningChange {
    id : string;
    name : string;
}


interface SectionSeccionPlanningChange {
    id          : string;
    code        : number,
    startDate   : Date;
    endDate     : Date;
    subject     : SubjectSectionPlanningChange
}

interface ModulePlanningChange {
    id : number;
    startHour : string;
    endHour : string;
    difference : string;
    code : string;
}

interface DayModuleSessionPlanningChange {
    id      : number;
    dayId   : number;
    module  : ModulePlanningChange;
}

export interface SessionWithoutPlanningChange {
    id          : string;
    name        : Session;
    spaceId     : string;
    isEnglish   : boolean;
    date        : Date;
    professor   : OfferSectionProffesor;
    dayModule   : DayModuleSessionPlanningChange;
    section     : SectionSeccionPlanningChange;
}
