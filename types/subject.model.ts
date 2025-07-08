
export interface Subject {
    id              : string;
    name            : string;
    startDate?      : Date;
    endDate?        : Date;
    students        : number;
    costCenterId    : string;
    isActive        : boolean;
    facultyId       : string;
    createdAt       : Date;
    updatedAt       : Date;
}
