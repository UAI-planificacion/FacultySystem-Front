import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { parseISO } from 'date-fns';


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


export function dateToString( dateInput?: Date | string | undefined ): string {
    if ( !dateInput ) return "-";

    const date = typeof dateInput === 'string'
        ? parseISO( dateInput )
        : dateInput;

    if ( isNaN( date.getTime() )) return "-";

    const opciones: Intl.DateTimeFormatOptions = {
        day     : '2-digit',
        month   : '2-digit',
        year    : 'numeric'
    };

    return new Intl.DateTimeFormat( 'es-ES', opciones ).format( date );
}
