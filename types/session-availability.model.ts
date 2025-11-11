import {
    BuildingEnum,
    Size,
    SpaceType
}                   from "@/types/request-detail.model";
import { Professor }  from "@/types/professor";
import { Session }  from "@/types/section.model";


export type SessionAvailabilityStatus = "Available" | "Unavailable" | "Probable";


export interface SessionAvailabilityResult {
    SSEC            : string;
    session         : string;
    date            : string;
    module          : string;
    spaceId?        : string;
    professor?      : Professor;
    status          : SessionAvailabilityStatus;
    detalle         : string;
    sessionId       : string;
}


export type SessionAssignmentType = 'space' | 'professor' | 'registrants';


export interface SessionAssignmentCache {
    type        : SessionAssignmentType;
    results     : SessionAvailabilityResult[];
}


export interface AvailableSpace {
    id          : string;
    name        : string;
    building    : BuildingEnum;
    type        : SpaceType;
    capacity    : number;
    size        : Size;
}


export interface AvailableProfessor {
    id          : string;
    name        : string;
    available   : boolean;
}


export interface ScheduledDate {
    date            : Date;
    dayModuleId     : number;
    dayName         : string;
    timeRange       : string;
}


export interface SessionAvailabilityResponse {
	session                 : Session;
	availableSpaces         : AvailableSpace[];
	availableProfessors     : AvailableProfessor[];
	scheduledDates          : ScheduledDate[];
	isReadyToCreate         : boolean;
}


export interface SessionAvailabilityRequest {
	session         : Session;
	dayModuleIds    : number[];
	spaceIds        : string[] | null;
	professorIds    : string[];
	isEnglish       : boolean;
	building        : BuildingEnum | null;
	spaceType       : SpaceType | null;
	spaceSize       : Size | null;
}
