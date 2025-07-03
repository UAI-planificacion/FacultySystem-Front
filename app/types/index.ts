// Faculty Management System Types

export type Role = 'admin' | 'editor' | 'viewer';

export interface Person {
  id: string;
  name: string;
  email: string;
  position: string;
  role: Role;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  maxStudents: number;
  description?: string;
  costCenter?: CostCenter;
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
  description?: string;
  subjects: Subject[];
  personnel: Person[];
}
