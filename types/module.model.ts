export type Difference = 'A' | 'B' | 'C' | 'D' | null | undefined;


interface ModuleBase {
    id          : string;
    code        : string;
    isActive    : boolean;
    name        : string;
    difference? : Difference;
    startHour   : string;
    endHour     : string;
}

export interface Module extends ModuleBase {
    dayId       : number;
    order       : number;
    dayModuleId : number;
}

export interface ModuleOriginal extends ModuleBase {
    days        : number[];
    createdAt   : Date;
    updatedAt   : Date;
}


export interface ModuleCreate {
    startHour   : string;
    endHour     : string;
    dayIds      : number[];
}
