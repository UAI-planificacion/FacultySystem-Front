export enum Status {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    REVIEWING = "REVIEWING",
}


export enum SpaceType {
    ROOM = "ROOM",
    AUDITORIUM = "AUDITORIUM",
    COMMUNIC = "COMMUNIC",
    LAB = "LAB",
    LABPC = "LABPC",
    DIS = "DIS",
    GARAGE = "GARAGE",
    CORE = "CORE",
}

export enum Size {
    XS = "XS",
    XE = "XE",
    S = "S",
    SE = "SE",
    MS = "MS",
    M = "M",
    L = "L",
    XL = "XL",
    XXL = "XXL",
}

export enum Nivel {
    PREGRADO = "PREGRADO",
    FIRST_GRADE = "FIRST_GRADE",
    SECOND_GRADE = "SECOND_GRADE",
}

export enum Building {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
    E = "E",
    F = "F",
}

export interface Staff {
    id: string
    name: string
    email: string
}

export interface Subject {
    id: string
    name: string
    code: string
}

export interface Professor {
    id: string
    name: string
    email: string
}

export interface RequestDetail {
    id: string
    minimum?: number
    maximum?: number
    spaceType?: SpaceType
    spaceSize?: Size
    costCenterId?: string
    inAfternoon: boolean
    building?: Building
    description?: string
    comment?: string | null
    moduleId?: string
    days: string[]
    spaceId?: string
    isPriority: boolean
    nivel: Nivel
    professorId?: string
    professor?: Professor
    staffCreateId?: string | null
    staffCreate?: Staff | null
    staffUpdateId?: string | null
    staffUpdate?: Staff | null
    requestId: string
    createdAt: Date
    updatedAt: Date
}

export interface Request {
    id: string
    status: Status
    isConsecutive: boolean
    description?: string
    comment?: string | null
    staffCreateId: string
    staffCreate: Staff
    staffUpdateId?: string | null
    staffUpdate?: Staff | null
    subjectId: string
    subject: Subject
    details: RequestDetail[]
    createdAt: Date
    updatedAt: Date
}
