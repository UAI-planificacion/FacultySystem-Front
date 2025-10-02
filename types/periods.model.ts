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
    startDate       : Date;
    endDate         : Date;
    costCenterId    : string;
    openingDate     : Date | null;
    closingDate     : Date | null;
    status          : PeriodStatus;
    type            : PeriodType;
    createdAt       : Date
    updatedAt       : Date;
}
