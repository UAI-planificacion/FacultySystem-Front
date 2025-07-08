"use client"

import { useState } from "react"
import RequestList from "./request-list"
import RequestDetailView from "./request-detail"
import { type Request, Status, SpaceType, Size, Nivel, Building } from "@/types/request"

// Mock data para demostración
const mockRequests: Request[] = [
  {
    id: "01H9XKJ8WXKJ8WXKJ8WXKJ8WX",
    status: Status.PENDING,
    isConsecutive: false,
    description: "Request for classroom with projector",
    comment: null,
    staffCreateId: "01H9XKJ8WXKJ8WXKJ8WXKJ8WX",
    staffCreate: {
      id: "01H9XKJ8WXKJ8WXKJ8WXKJ8WX",
      name: "Juan Pérez",
      email: "juan.perez@universidad.edu",
    },
    staffUpdateId: null,
    staffUpdate: null,
    subjectId: "01H9XKJ8WXKJ8WXKJ8WXKJ8WX",
    subject: {
      id: "01H9XKJ8WXKJ8WXKJ8WXKJ8WX",
      name: "Programación Avanzada",
      code: "CS301",
    },
    details: [
      {
        id: "01H9XKJ8WXKJ8WXKJ8WXKJ8W1",
        minimum: 20,
        maximum: 30,
        spaceType: SpaceType.ROOM,
        spaceSize: Size.M,
        costCenterId: "CC001",
        inAfternoon: false,
        building: Building.A,
        description: "Aula con proyector para clase de programación",
        comment: null,
        moduleId: "MOD001",
        days: ["Lunes", "Miércoles", "Viernes"],
        spaceId: "ROOM_A101",
        isPriority: false,
        nivel: Nivel.PREGRADO,
        professorId: "PROF001",
        professor: {
          id: "PROF001",
          name: "Dr. María García",
          email: "maria.garcia@universidad.edu",
        },
        staffCreateId: "01H9XKJ8WXKJ8WXKJ8WXKJ8WX",
        staffCreate: {
          id: "01H9XKJ8WXKJ8WXKJ8WXKJ8WX",
          name: "Juan Pérez",
          email: "juan.perez@universidad.edu",
        },
        staffUpdateId: null,
        staffUpdate: null,
        requestId: "01H9XKJ8WXKJ8WXKJ8WXKJ8WX",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
    ],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "01H9XKJ8WXKJ8WXKJ8WXKJ8W2",
    status: Status.APPROVED,
    isConsecutive: true,
    description: "Laboratorio de química para prácticas",
    comment: "Aprobado con observaciones",
    staffCreateId: "01H9XKJ8WXKJ8WXKJ8WXKJ8W2",
    staffCreate: {
      id: "01H9XKJ8WXKJ8WXKJ8WXKJ8W2",
      name: "Ana López",
      email: "ana.lopez@universidad.edu",
    },
    staffUpdateId: "01H9XKJ8WXKJ8WXKJ8WXKJ8W3",
    staffUpdate: {
      id: "01H9XKJ8WXKJ8WXKJ8WXKJ8W3",
      name: "Carlos Admin",
      email: "carlos.admin@universidad.edu",
    },
    subjectId: "01H9XKJ8WXKJ8WXKJ8WXKJ8W2",
    subject: {
      id: "01H9XKJ8WXKJ8WXKJ8WXKJ8W2",
      name: "Química Orgánica",
      code: "CHEM201",
    },
    details: [
      {
        id: "01H9XKJ8WXKJ8WXKJ8WXKJ8W3",
        minimum: 15,
        maximum: 20,
        spaceType: SpaceType.LAB,
        spaceSize: Size.L,
        costCenterId: "CC002",
        inAfternoon: true,
        building: Building.B,
        description: "Laboratorio con campana extractora",
        comment: null,
        moduleId: "MOD002",
        days: ["Martes", "Jueves"],
        spaceId: "LAB_B201",
        isPriority: true,
        nivel: Nivel.PREGRADO,
        professorId: "PROF002",
        professor: {
          id: "PROF002",
          name: "Dr. Roberto Silva",
          email: "roberto.silva@universidad.edu",
        },
        staffCreateId: "01H9XKJ8WXKJ8WXKJ8WXKJ8W2",
        staffCreate: {
          id: "01H9XKJ8WXKJ8WXKJ8WXKJ8W2",
          name: "Ana López",
          email: "ana.lopez@universidad.edu",
        },
        staffUpdateId: null,
        staffUpdate: null,
        requestId: "01H9XKJ8WXKJ8WXKJ8WXKJ8W2",
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-12"),
      },
      {
        id: "01H9XKJ8WXKJ8WXKJ8WXKJ8W4",
        minimum: 10,
        maximum: 15,
        spaceType: SpaceType.LAB,
        spaceSize: Size.M,
        costCenterId: "CC002",
        inAfternoon: false,
        building: Building.B,
        description: "Laboratorio adicional para grupos pequeños",
        comment: null,
        moduleId: "MOD003",
        days: ["Viernes"],
        spaceId: "LAB_B202",
        isPriority: false,
        nivel: Nivel.PREGRADO,
        professorId: "PROF002",
        professor: {
          id: "PROF002",
          name: "Dr. Roberto Silva",
          email: "roberto.silva@universidad.edu",
        },
        staffCreateId: "01H9XKJ8WXKJ8WXKJ8WXKJ8W2",
        staffCreate: {
          id: "01H9XKJ8WXKJ8WXKJ8WXKJ8W2",
          name: "Ana López",
          email: "ana.lopez@universidad.edu",
        },
        staffUpdateId: null,
        staffUpdate: null,
        requestId: "01H9XKJ8WXKJ8WXKJ8WXKJ8W2",
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-12"),
      },
    ],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-12"),
  },
]

export default function FacultyRequestsPage() {
  const [requests, setRequests] = useState<Request[]>(mockRequests)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request)
  }

  const handleBack = () => {
    setSelectedRequest(null)
  }

  const handleUpdateRequest = (updatedRequest: Request) => {
    setRequests((prev) => prev.map((req) => (req.id === updatedRequest.id ? updatedRequest : req)))
    setSelectedRequest(updatedRequest)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Solicitudes de Facultad</h1>
        <p className="text-muted-foreground">Gestiona las solicitudes de espacios y recursos de la facultad</p>
      </div>

      {selectedRequest ? (
        <RequestDetailView request={selectedRequest} onBack={handleBack} onUpdateRequest={handleUpdateRequest} />
      ) : (
        <RequestList requests={requests} onViewDetails={handleViewDetails} />
      )}
    </div>
  )
}
