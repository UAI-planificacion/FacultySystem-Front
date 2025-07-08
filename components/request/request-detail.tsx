"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Edit, Trash2, User, Calendar, MapPin, Users, Building2 } from "lucide-react"
import { type Request, type RequestDetail, Status } from "@/types/request"
import RequestDetailForm from "./request-detail-form"

interface RequestDetailViewProps {
  request: Request
  onBack: () => void
  onUpdateRequest: (request: Request) => void
}

export default function RequestDetailView({ request, onBack, onUpdateRequest }: RequestDetailViewProps) {
  const [editingDetail, setEditingDetail] = useState<RequestDetail | null>(null)
  const [isAddingDetail, setIsAddingDetail] = useState(false)

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case Status.APPROVED:
        return "bg-green-100 text-green-800 border-green-200"
      case Status.REJECTED:
        return "bg-red-100 text-red-800 border-red-200"
      case Status.REVIEWING:
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleAddDetail = (detail: Omit<RequestDetail, "id" | "requestId" | "createdAt" | "updatedAt">) => {
    const newDetail: RequestDetail = {
      ...detail,
      id: `temp_${Date.now()}`,
      requestId: request.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const updatedRequest = {
      ...request,
      details: [...request.details, newDetail],
    }

    onUpdateRequest(updatedRequest)
    setIsAddingDetail(false)
  }

  const handleUpdateDetail = (updatedDetail: RequestDetail) => {
    const updatedRequest = {
      ...request,
      details: request.details.map((detail) => (detail.id === updatedDetail.id ? updatedDetail : detail)),
    }

    onUpdateRequest(updatedRequest)
    setEditingDetail(null)
  }

  const handleDeleteDetail = (detailId: string) => {
    const updatedRequest = {
      ...request,
      details: request.details.filter((detail) => detail.id !== detailId),
    }

    onUpdateRequest(updatedRequest)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Solicitud {request.id.slice(-8)}</h1>
          <p className="text-muted-foreground">Creada el {new Date(request.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Request Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Información de la Solicitud</CardTitle>
            <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Creado por</p>
                  <p className="text-sm text-muted-foreground">{request.staffCreate.name}</p>
                </div>
              </div>

              {request.staffUpdate && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Actualizado por</p>
                    <p className="text-sm text-muted-foreground">{request.staffUpdate.name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Materia</p>
                  <p className="text-sm text-muted-foreground">{request.subject.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-medium">Consecutivo</p>
                <Badge variant={request.isConsecutive ? "default" : "secondary"}>
                  {request.isConsecutive ? "Sí" : "No"}
                </Badge>
              </div>

              {request.description && (
                <div>
                  <p className="font-medium">Descripción</p>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>
              )}

              {request.comment && (
                <div>
                  <p className="font-medium">Comentario</p>
                  <p className="text-sm text-muted-foreground">{request.comment}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Detalles de la Solicitud ({request.details.length})</h2>
          <Dialog open={isAddingDetail} onOpenChange={setIsAddingDetail}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Detalle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Detalle</DialogTitle>
              </DialogHeader>
              <RequestDetailForm onSubmit={handleAddDetail} onCancel={() => setIsAddingDetail(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {request.details.map((detail) => (
            <Card key={detail.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">Detalle {detail.id.slice(-8)}</CardTitle>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingDetail(detail)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Detalle</DialogTitle>
                        </DialogHeader>
                        <RequestDetailForm
                          initialData={detail}
                          onSubmit={(data) => handleUpdateDetail(data as RequestDetail)}
                          onCancel={() => setEditingDetail(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDetail(detail.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {detail.minimum && detail.maximum && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {detail.minimum}-{detail.maximum}
                      </span>
                    </div>
                  )}

                  {detail.spaceType && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span>{detail.spaceType}</span>
                    </div>
                  )}

                  {detail.building && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>Edificio {detail.building}</span>
                    </div>
                  )}

                  {detail.spaceSize && (
                    <Badge variant="outline" className="text-xs w-fit">
                      {detail.spaceSize}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant={detail.isPriority ? "default" : "secondary"} className="text-xs">
                    {detail.isPriority ? "Prioridad" : "Normal"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {detail.nivel}
                  </Badge>
                  {detail.inAfternoon && (
                    <Badge variant="outline" className="text-xs">
                      Tarde
                    </Badge>
                  )}
                </div>

                {detail.days.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Días:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {detail.days.map((day, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {detail.description && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Descripción:</p>
                    <p className="text-xs text-muted-foreground mt-1">{detail.description}</p>
                  </div>
                )}

                {detail.professor && (
                  <div className="flex items-center gap-1 text-xs">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>{detail.professor.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {request.details.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No hay detalles para esta solicitud.</p>
              <Button className="mt-4" onClick={() => setIsAddingDetail(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Detalle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
