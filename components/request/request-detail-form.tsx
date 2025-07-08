"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { type RequestDetail, SpaceType, Size, Nivel, Building } from "@/types/request"

interface RequestDetailFormProps {
    initialData?: RequestDetail
    onSubmit: (data: RequestDetail | Omit<RequestDetail, "id" | "createdAt" | "updatedAt">) => void
    onCancel: () => void
}

export default function RequestDetailForm({ initialData, onSubmit, onCancel }: RequestDetailFormProps) {
    const [formData, setFormData] = useState({
        minimum: initialData?.minimum || undefined,
        maximum: initialData?.maximum || undefined,
        spaceType: initialData?.spaceType || "Sin especificar",
        spaceSize: initialData?.spaceSize || "Sin especificar",
        building: initialData?.building || "Sin especificar",
        costCenterId: initialData?.costCenterId || "",
        inAfternoon: initialData?.inAfternoon || false,
        description: initialData?.description || "",
        comment: initialData?.comment || "",
        moduleId: initialData?.moduleId || "",
        days: initialData?.days || [],
        spaceId: initialData?.spaceId || "",
        isPriority: initialData?.isPriority || false,
        nivel: initialData?.nivel || Nivel.PREGRADO,
        professorId: initialData?.professorId || "",
        staffCreateId: initialData?.staffCreateId || "",
        staffUpdateId: initialData?.staffUpdateId || "",
    })

    const [newDay, setNewDay] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const submitData = {
        ...formData,
        minimum: formData.minimum || undefined,
        maximum: formData.maximum || undefined,
        spaceType: formData.spaceType || undefined,
        spaceSize: formData.spaceSize || undefined,
        building: formData.building || undefined,
        costCenterId: formData.costCenterId || undefined,
        description: formData.description || undefined,
        comment: formData.comment || undefined,
        moduleId: formData.moduleId || undefined,
        spaceId: formData.spaceId || undefined,
        professorId: formData.professorId || undefined,
        staffCreateId: formData.staffCreateId || undefined,
        staffUpdateId: formData.staffUpdateId || undefined,
        }

        if (initialData) {
        // onSubmit({
        //     ...initialData,
        //     ...submitData,
        //     requestId: submitData.requestId,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        // }) as RequestDetail)
        onSubmit(submitData as RequestDetail)

        } else {
        onSubmit(submitData as RequestDetail)
        }
    }

    const addDay = () => {
        if (newDay.trim() && !formData.days.includes(newDay.trim())) {
        setFormData((prev) => ({
            ...prev,
            days: [...prev.days, newDay.trim()],
        }))
        setNewDay("")
        }
    }

    const removeDay = (dayToRemove: string) => {
        setFormData((prev) => ({
        ...prev,
        days: prev.days.filter((day) => day !== dayToRemove),
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="minimum">Mínimo de estudiantes</Label>
            <Input
                id="minimum"
                type="number"
                value={formData.minimum || ""}
                onChange={(e) =>
                setFormData((prev) => ({
                    ...prev,
                    minimum: e.target.value ? Number.parseInt(e.target.value) : undefined,
                }))
                }
            />
            </div>

            <div className="space-y-2">
            <Label htmlFor="maximum">Máximo de estudiantes</Label>
            <Input
                id="maximum"
                type="number"
                value={formData.maximum || ""}
                onChange={(e) =>
                setFormData((prev) => ({
                    ...prev,
                    maximum: e.target.value ? Number.parseInt(e.target.value) : undefined,
                }))
                }
            />
            </div>

            <div className="space-y-2">
            <Label>Tipo de espacio</Label>
            <Select
                value={formData.spaceType}
                onValueChange={(value) =>
                setFormData((prev) => ({
                    ...prev,
                    spaceType: value as SpaceType,
                }))
                }
            >
                <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="Sin especificar">Sin especificar</SelectItem>
                {Object.values(SpaceType).map((type) => (
                    <SelectItem key={type} value={type}>
                    {type}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

            <div className="space-y-2">
            <Label>Tamaño del espacio</Label>
            <Select
                value={formData.spaceSize}
                onValueChange={(value) =>
                setFormData((prev) => ({
                    ...prev,
                    spaceSize: value as Size,
                }))
                }
            >
                <SelectTrigger>
                <SelectValue placeholder="Seleccionar tamaño" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="Sin especificar">Sin especificar</SelectItem>
                {Object.values(Size).map((size) => (
                    <SelectItem key={size} value={size}>
                    {size}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

            <div className="space-y-2">
            <Label>Edificio</Label>
            <Select
                value={formData.building}
                onValueChange={(value) =>
                setFormData((prev) => ({
                    ...prev,
                    building: value as Building,
                }))
                }
            >
                <SelectTrigger>
                <SelectValue placeholder="Seleccionar edificio" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="Sin especificar">Sin especificar</SelectItem>
                {Object.values(Building).map((building) => (
                    <SelectItem key={building} value={building}>
                    Edificio {building}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

            <div className="space-y-2">
            <Label>Nivel</Label>
            <Select
                value={formData.nivel}
                onValueChange={(value) =>
                setFormData((prev) => ({
                    ...prev,
                    nivel: value as Nivel,
                }))
                }
            >
                <SelectTrigger>
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                {Object.values(Nivel).map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                    {nivel}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="costCenterId">ID Centro de Costo</Label>
            <Input
                id="costCenterId"
                value={formData.costCenterId}
                onChange={(e) => setFormData((prev) => ({ ...prev, costCenterId: e.target.value }))}
            />
            </div>

            <div className="space-y-2">
            <Label htmlFor="moduleId">ID Módulo</Label>
            <Input
                id="moduleId"
                value={formData.moduleId}
                onChange={(e) => setFormData((prev) => ({ ...prev, moduleId: e.target.value }))}
            />
            </div>

            <div className="space-y-2">
            <Label htmlFor="spaceId">ID Espacio</Label>
            <Input
                id="spaceId"
                value={formData.spaceId}
                onChange={(e) => setFormData((prev) => ({ ...prev, spaceId: e.target.value }))}
            />
            </div>

            <div className="space-y-2">
            <Label htmlFor="professorId">ID Profesor</Label>
            <Input
                id="professorId"
                value={formData.professorId}
                onChange={(e) => setFormData((prev) => ({ ...prev, professorId: e.target.value }))}
            />
            </div>
        </div>

        <div className="space-y-4">
            <div className="space-y-2">
            <Label>Días</Label>
            <div className="flex gap-2">
                <Input
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                placeholder="Agregar día (ej: Lunes)"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDay())}
                />
                <Button type="button" onClick={addDay}>
                Agregar
                </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {formData.days.map((day, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {day}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeDay(day)} />
                </Badge>
                ))}
            </div>
            </div>

            <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
            />
            </div>

            <div className="space-y-2">
            <Label htmlFor="comment">Comentario</Label>
            <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                rows={3}
            />
            </div>
        </div>

        <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
            <Switch
                id="inAfternoon"
                checked={formData.inAfternoon}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, inAfternoon: checked }))}
            />
            <Label htmlFor="inAfternoon">En la tarde</Label>
            </div>

            <div className="flex items-center space-x-2">
            <Switch
                id="isPriority"
                checked={formData.isPriority}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPriority: checked }))}
            />
            <Label htmlFor="isPriority">Es prioridad</Label>
            </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
            </Button>
            <Button type="submit">{initialData ? "Actualizar" : "Crear"} Detalle</Button>
        </div>
        </form>
    )
}
