export interface Grade {
    id              : string;
    name            : string;
    headquartersId  : string;
    createdAt       : Date;
    updatedAt       : Date;
}


export interface GradeFormData {
    name            : string;
    headquartersId  : string;
}
