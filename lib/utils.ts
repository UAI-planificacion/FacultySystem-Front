import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Status } from '@/types/request';

import { format } from "@formkit/tempo"



export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


export function dateToString( dateInput?: Date | string | undefined ): string {
    if ( !dateInput ) return "-";

    return dateInput instanceof Date ? dateInput.toISOString().split('T')[0] : dateInput;
}


export function tempoFormat( dateInput: Date | string | undefined ) {
    if ( !dateInput ) return "-";

    return format( dateInput, "D MMMM YYYY" );
}


export const getStatusName = ( status: Status ) : string => ({
    [Status.PENDING]    : "Pendiente",
    [Status.APPROVED]   : "Aprobado",
    [Status.REJECTED]   : "Rechazado",
    [Status.REVIEWING]  : "Revisando",
})[status] || "Pendiente";

