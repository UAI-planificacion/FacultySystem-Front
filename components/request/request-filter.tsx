'use client'

import { JSX } from "react";

import { Search, Plus } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                   from "@/components/ui/select";
import {
    Card,
    CardHeader,
}                   from "@/components/ui/card";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { ViewMode } from "@/components/shared/view-mode";

import { Status } from "@/types/request";


export interface RequestFilter {
    title                   : string;
    setTitle                : ( title: string ) => void;
    statusFilter            : Status | "ALL";
    setStatusFilter         : ( statusFilter: Status | "ALL" ) => void;
    consecutiveFilter       : "ALL" | "TRUE" | "FALSE";
    setConsecutiveFilter    : ( consecutiveFilter: "ALL" | "TRUE" | "FALSE" ) => void;
    sortBy                  : "title" | "consecutive" | "updatedAt";
    setSortBy               : ( sortBy: "title" | "consecutive" | "updatedAt" ) => void;
    sortOrder               : "asc" | "desc";
    setSortOrder            : ( sortOrder: "asc" | "desc" ) => void;
    onNewRequest            : () => void;
    viewMode                : ViewMode,
    setViewMode             : ( viewMode: ViewMode ) => void;
}


export function RequestFilter({
    title,
    setTitle,
    statusFilter,
    setStatusFilter,
    consecutiveFilter,
    setConsecutiveFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    onNewRequest,
    viewMode,
    setViewMode,
}: RequestFilter ): JSX.Element {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end flex-1">
                        <div className="grid space-y-2">
                            <Label htmlFor="search">Buscar por Título</Label>

                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

                                <Input
                                    id          = "search"
                                    placeholder = "Título de solicitud..."
                                    value       = { title }
                                    onChange    = {( e ) => setTitle( e.target.value )}
                                    className   = "pl-8"
                                />
                            </div>
                        </div>

                        <div className="grid space-y-2">
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

                        <div className="grid space-y-2">
                            <Label>Consecutivo</Label>

                            <Select
                                value={consecutiveFilter}
                                onValueChange={( value ) => setConsecutiveFilter( value as "ALL" | "TRUE" | "FALSE" )}
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

                        <div className="grid space-y-2">
                            <Label>Ordenar por</Label>

                            <div className="flex gap-2">
                                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="title">Título</SelectItem>
                                        <SelectItem value="consecutive">Consecutivo</SelectItem>
                                        <SelectItem value="updatedAt">Fecha de Actualización</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end gap-2 sm:gap-4">
                        <ViewMode
                            viewMode        = { viewMode }
                            onViewChange    = { setViewMode }
                        />

                        <Button
                            onClick     = { onNewRequest }
                            className   = "w-full lg:w-auto gap-2"
                        >
                            <Plus className="h-4 w-4" />

                            <span className="lg:hidden">Crear Solicitud</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
