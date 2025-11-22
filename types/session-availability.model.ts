import {
    BuildingEnum,
    Size,
    SpaceType
}                   from "@/types/request-detail.model";
import { Session }  from "@/types/section.model";
// import { Professor }    from "@/types/professor";


export type Status = "Available" | "Unavailable" | "Probable";


// export interface SessionAvailabilityResult {
//     SSEC        : string;
//     session     : string;
//     date        : string;
//     module      : string;
//     spaceId?    : string;
//     professor?  : Professor;
//     status      : Status;
//     detalle     : string;
//     sessionId   : string;
// }


export interface SessionAvailabilityResult {
    SSEC                : string;
    SesionId            : string;
    Numero              : number;
    NombreAsignatura    : string;
    Fecha               : Date;
    Dia                 : number;
    Modulo              : string;
    Periodo             : string;
    TipoPeriodo         : string;
    Edificio            : string | null;
    TipoEspacio         : string | null;
    TamanoEspacio       : string | null;
    TipoSesion          : string;
    Cupos               : number;
    Profesor            : string | null;
    Espacio             : string | null;
    Estado?             : Status;
    Detalle?            : string;
}


export type SessionAssignmentType = 'space' | 'professor' | 'registrants';


export interface SessionAssignmentCache {
    type    : SessionAssignmentType;
    results : SessionAvailabilityResult[];
}


export interface SessionAssignment {
    sessionId       : string;
    spaceId?        : string;
    professorId?    : string;
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
    date        : Date;
    dayModuleId : number;
    dayName     : string;
    timeRange   : string;
}


export interface SessionAvailabilityResponse {
	session             : Session;
	availableSpaces     : AvailableSpace[];
	availableProfessors : AvailableProfessor[];
	scheduledDates      : ScheduledDate[];
	isReadyToCreate     : boolean;
}


// export interface SessionAvailabilityRequest {
// 	session         : Session;
// 	dayModuleIds    : number[];
// 	spaceIds        : string[] | null;
// 	professorIds    : string[];
// 	isEnglish       : boolean;
// 	building        : BuildingEnum | null;
// 	spaceType       : SpaceType | null;
// 	spaceSize       : Size | null;
// }
