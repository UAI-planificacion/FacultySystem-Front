"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, Filter, Eye, Calendar, User, BookOpen } from "lucide-react"
import { type Request, Status } from "@/types/request"

interface RequestListProps {
  requests: Request[]
  onViewDetails: (request: Request) => void
}

export default function RequestList({ requests, onViewDetails }: RequestListProps) {
  const [searchId, setSearchId] = useState("")
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL")
  const [consecutiveFilter, setConsecutiveFilter] = useState<"ALL" | "TRUE" | "FALSE">("ALL")
  const [sortBy, setSortBy] = useState<"status" | "staffCreate" | "staffUpdate" | "subjectId" | "createdAt">(
    "createdAt",
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filteredAndSortedRequests = useMemo(() => {
    const filtered = requests.filter((request) => {
      const matchesId = searchId === "" || request.id.toLowerCase().includes(searchId.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || request.status === statusFilter
      const matchesConsecutive =
        consecutiveFilter === "ALL" ||
        (consecutiveFilter === "TRUE" && request.isConsecutive) ||
        (consecutiveFilter === "FALSE" && !request.isConsecutive)

      return matchesId && matchesStatus && matchesConsecutive
    })

    return filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "staffCreate":
          aValue = a.staffCreate.name
          bValue = b.staffCreate.name
          break
        case "staffUpdate":
          aValue = a.staffUpdate?.name || ""
          bValue = b.staffUpdate?.name || ""
          break
        case "subjectId":
          aValue = a.subject.name
          bValue = b.subject.name
          break
        case "createdAt":
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [requests, searchId, statusFilter, consecutiveFilter, sortBy, sortOrder])

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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar por ID</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ID de solicitud..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status | "ALL")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value={Status.PENDING}>Pendiente</SelectItem>
                  <SelectItem value={Status.APPROVED}>Aprobado</SelectItem>
                  <SelectItem value={Status.REJECTED}>Rechazado</SelectItem>
                  <SelectItem value={Status.REVIEWING}>En Revisión</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Consecutivo</Label>
              <Select
                value={consecutiveFilter}
                onValueChange={(value) => setConsecutiveFilter(value as "ALL" | "TRUE" | "FALSE")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="TRUE">Sí</SelectItem>
                  <SelectItem value="FALSE">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ordenar por</Label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Fecha</SelectItem>
                    <SelectItem value="status">Estado</SelectItem>
                    <SelectItem value="staffCreate">Creador</SelectItem>
                    <SelectItem value="staffUpdate">Actualizador</SelectItem>
                    <SelectItem value="subjectId">Materia</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">ID: {request.id.slice(-8)}</CardTitle>
                  <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                </div>
                {request.isConsecutive && (
                  <Badge variant="outline" className="text-xs">
                    Consecutivo
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{request.subject.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{request.staffCreate.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {request.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <Badge variant="secondary">
                  {request.details.length} detalle{request.details.length !== 1 ? "s" : ""}
                </Badge>
                <Button size="sm" onClick={() => onViewDetails(request)} className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Ver detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedRequests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron solicitudes que coincidan con los filtros.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
