interface BaseProfessor {
    name    : string;
    email   : string | null;
    isMock  : boolean;
}

export interface Professor extends BaseProfessor {
    id: string;
}

export interface CreateProfessor extends BaseProfessor { }

export interface UpdateProfessor extends Partial<Professor>{
    id: string;
}
