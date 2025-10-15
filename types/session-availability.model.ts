import { Building, Size, SpaceType } from "@/types/request-detail.model";
import { Session } from "@/types/section.model";


export interface AvailableSpace {
	id          : string;
	name        : string;
	building    : Building;
	type        : SpaceType;
	capacity    : number;
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
	building        : Building | null;
	spaceType       : SpaceType | null;
	spaceSize       : Size | null;
}
