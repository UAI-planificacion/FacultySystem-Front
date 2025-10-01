import { clsx, type ClassValue }    from 'clsx';
import { twMerge }                  from 'tailwind-merge';
import { format }                   from "@formkit/tempo"

import { Status }       from '@/types/request';
import { SpaceType }    from '@/types/request-detail.model';


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


export function dateToString( dateInput?: Date | string | undefined ): string {
    if ( !dateInput ) return "-";

    return dateInput instanceof Date ? dateInput.toISOString().split('T')[0] : dateInput;
}


export function tempoFormat( dateInput: Date | string | undefined ) {
    if ( !dateInput ) return "-";

    return format( dateInput, "ddd DD MMM YYYY" );
}


export const getStatusName = ( status: Status ) : string => ({
    [Status.PENDING]    : "Pendiente",
    [Status.APPROVED]   : "Aprobado",
    [Status.REJECTED]   : "Rechazado",
    [Status.REVIEWING]  : "Revisando",
})[status] || "Pendiente";


export const getSpaceType = ( spaceType: SpaceType ) => ({
    [SpaceType.ROOM]                : "Sala",
    [SpaceType.LABPC]               : "Laboratorio de Computación",
    [SpaceType.AUDITORIO]           : "Auditorio",
    [SpaceType.STUDY_ROOM]          : "Sala Estudio",
    [SpaceType.MEETING_ROOM]        : "Sala Reuniones",
    [SpaceType.DIS]                 : "Sala Diseño",
    [SpaceType.LAB]                 : "Laboratorio Investigación",
    [SpaceType.CORE]                : "Sala Core",
    [SpaceType.POSTGRADUATE_ROOM]   : "Sala Postgrado",
    [SpaceType.MULTIPURPOSE]        : "Multiuso",
})[spaceType];
