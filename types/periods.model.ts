export enum PeriodStatus {
    Opened      = 'Opened',
    InProgress  = 'InProgress',
    Completed   = 'Completed'
}

export interface Period {
    id          : string;
    name        : string;
    startDate   : string;
    endDate     : string;
    openingDate : string | null;
    closingDate : string | null;
    status      : PeriodStatus;
    createdAt   : Date
    updatedAt   : Date;
}