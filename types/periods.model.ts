export enum PeriodStatus {
    Opened      = 'Opened',
    InProgress  = 'InProgress',
    Completed   = 'Completed'
}


export enum PeriodType {
    ANUAL       = 'ANUAL' ,
    TRIMESTRAL  = 'TRIMESTRAL' ,
    SEMESTRAL   = 'SEMESTRAL' ,
    VERANO      = 'VERANO' ,
}


export interface Period {
    id              : string;
    name            : string;
    startDate       : string;
    costCenterId    : string;
    endDate         : string;
    openingDate     : string | null;
    closingDate     : string | null;
    status          : PeriodStatus;
    type            : PeriodType;
    createdAt       : Date
    updatedAt       : Date;
}
