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

// Mock data for initial development
export const mockFaculties: Faculty[] = [
  {
    id: '1',
    name: 'Faculty of Engineering',
    code: 'ENG',
    description: 'Faculty focused on engineering disciplines',
    subjects: [
      {
        id: '101',
        name: 'Introduction to Engineering',
        code: 'ENG101',
        maxStudents: 120,
        costCenter: {
          id: 'cc-eng-101',
          code: 'ENG',
          name: 'ENGINEERING-101'
        }
      },
      {
        id: '102',
        name: 'Mechanics',
        code: 'ENG102',
        maxStudents: 80,
        costCenter: {
          id: 'cc-eng-102',
          code: 'ENG',
          name: 'ENGINEERING-102'
        }
      }
    ],
    personnel: [
      {
        id: 'p1',
        name: 'Dr. Jane Smith',
        email: 'jane.smith@university.edu',
        position: 'Dean',
        role: 'admin',
      }
    ]
  },
  {
    id: '2',
    name: 'Faculty of Science',
    code: 'SCI',
    description: 'Faculty focused on scientific research and education',
    subjects: [
      {
        id: '201',
        name: 'Biology Fundamentals',
        code: 'SCI201',
        maxStudents: 100,
        costCenter: {
          id: 'cc-sci-201',
          code: 'SCI',
          name: 'SCIENCE-201'
        }
      }
    ],
    personnel: [
      {
        id: 'p2',
        name: 'Dr. Michael Johnson',
        email: 'michael.johnson@university.edu',
        position: 'Dean',
        role: 'admin',
      }
    ]
  }
];