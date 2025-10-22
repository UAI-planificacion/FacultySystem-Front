"use client"

import { JSX }	from "react";

import { Plus, Search }	from "lucide-react";

import { Button }				from "@/components/ui/button";
import { Card, CardHeader }					from "@/components/ui/card";
import { Input }				from "@/components/ui/input";
import { Label }				from "@/components/ui/label";
import { ChangeStatus }			from "@/components/shared/change-status";
import { SessionTypeSelector }	from "@/components/shared/session-type-selector";

import { type Status }	from "@/types/request";
import { type Session }	from "@/types/section.model";
import { SearchInput } from "../shared/Search-input";


interface PlanningChangeFilterProps {
	title				: string;
	setTitle			: ( value: string ) => void;
	statusFilter		: Status[];
	setStatusFilter		: ( value: Status[] ) => void;
	sessionFilter		: Session[];
	setSessionFilter	: ( value: Session[] ) => void;
	onNewPlanningChange	: () => void;
}


export function PlanningChangeFilter({
	title,
	setTitle,
	statusFilter,
	setStatusFilter,
	sessionFilter,
	setSessionFilter,
	onNewPlanningChange
}: PlanningChangeFilterProps ): JSX.Element {
	return (
		<Card>
            <CardHeader className="p-6">
                <div className="space-y-4">
                    {/* Header con botón de crear */}
                    {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-semibold">Cambios de Planificación</h2>
                        <Button onClick={ onNewPlanningChange } size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Cambio
                        </Button>
                    </div> */}

                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Buscar por título */}
                        <SearchInput
                            label       = "Buscar por Título"
                            title       = { title }
                            setTitle    = { setTitle }
                        />

                        {/* Filtro por estado */}
                        <div className="grid space-y-2">
                            <Label>Estado</Label>
                            <ChangeStatus
                                multiple		= { true }
                                value			= { statusFilter }
                                onValueChange	= { setStatusFilter }
                            />
                        </div>

                        {/* Filtro por tipo de sesión */}
                        <div className="grid space-y-2">
                            <Label>Tipo de Sesión</Label>
                            <SessionTypeSelector
                                multiple		= { true }
                                value			= { sessionFilter }
                                onValueChange	= { setSessionFilter }
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
		</Card>
	);
}
