export enum PeriodStatus {
    Pending     = 'Pending',
    Opened      = 'Opened',
    InProgress  = 'InProgress',
    Closed      = 'Closed'
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
