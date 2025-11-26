import {
    BuildingEnum,
    Size,
    SpaceType
}                   from "@/types/request-detail.model";
import { Session }  from "@/types/section.model";


export type Status = "Available" | "Unavailable" | "Probable";



export type Type = 'space' | 'professor' | 'registered';


export interface AssignmentData {
    type : Type;
    data : SessionAvailabilityResult[];
}


export interface SessionAvailabilityResult {
    SSEC                : string;
    SesionId            : string;
    SectionId?          : string;
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
    Inscritos?          : number;
    Profesor            : string | null;
    Espacio             : string | null;
    SillasDisponibles?  : number | null;
    Estado?             : Status;
    Detalle?            : string;
}


export interface SessionAssignmentCache {
    type    : Type;
    results : SessionAvailabilityResult[];
}


export interface SectionAssignment {
    sectionId : string; 
    registered : number | null;
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
