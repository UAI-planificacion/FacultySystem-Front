import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Status } from '@/types/request';

import { format, parse } from "@formkit/tempo"



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

export const getStatusColor = ( status: Status ): string => ({
    [Status.PENDING]    : "bg-yellow-100 text-yellow-800 border-yellow-200",
    [Status.APPROVED]   : "bg-green-100 text-green-800 border-green-200",
    [Status.REJECTED]   : "bg-red-100 text-red-800 border-red-200",
    [Status.REVIEWING]  : "bg-blue-100 text-blue-800 border-blue-200",
})[status] || "bg-gray-100 text-gray-800 border-gray-200";
