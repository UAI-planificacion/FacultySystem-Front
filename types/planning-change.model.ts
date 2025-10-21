import {
    BuildingEnum,
    Size,
    SpaceType
}                                   from "@/types/request-detail.model";
import { OfferSectionProffesor }    from '@/types/offer-section.model';
import { Status }                   from "@/types/request";
import { Session }                  from "@/types/section.model";
import { SizeId }                   from "@/types/size.model";
import { Staff }                    from "@/types/staff.model";


interface StaffPlanningChange extends Staff {
    id          : string;
    name : string
}


export interface PlanningChange {
    id              : string;
    title           : string;
    status          : Status;
    sessionName     : Session               | null;
    building        : BuildingEnum          | null;
    spaceId         : string                | null;
    isEnglish       : boolean;
    isConsecutive   : boolean;
    description     : string                | null;
    spaceType       : SpaceType             | null;
    inAfternoon     : boolean;
    professor       : OfferSectionProffesor | null;
    spaceSize       : Size                  | null;
    sessionId       : string                | null;
    sectionId       : string                | null;
    createdAt       : Date;
    updatedAt       : Date;
    staffCreate     : StaffPlanningChange;
    staffUpdate     : StaffPlanningChange   | null;
    dayModulesId    : number[];
}


interface PlanningChangeSave {
    title           : string;
    sessionName     : Session       | null;
    professorId     : string        | null;
    spaceSizeId     : SizeId        | null;
    spaceType       : SpaceType     | null;
    spaceId         : string        | null;
    isEnglish       : boolean       | null;
    isConsecutive   : boolean       | null;
    inAfternoon     : boolean       | null;
    description     : string        | null;
    building        : BuildingEnum  | null;
    status          : Status        | null;
    // sessionId       : string        | null;
    dayModulesId    : number[];
}


export interface PlanningChangeCreate extends PlanningChangeSave {
    staffCreateId   : string;
    sessionId       : string        | null;
    sectionId       : string | null;
}


export interface PlanningChangeUpdate extends PlanningChangeSave {
    staffUpdateId: string;
}


interface SubjectSectionPlanningChange {
    id      : string;
    name    : string;
}


interface SectionSeccionPlanningChange {
    id          : string;
    code        : number,
    startDate   : Date;
    endDate     : Date;
    subject     : SubjectSectionPlanningChange
}


interface ModulePlanningChange {
    id          : number;
    startHour   : string;
    endHour     : string;
    difference  : string;
    code        : string;
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
