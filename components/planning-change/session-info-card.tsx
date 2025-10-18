'use client'

import { JSX } from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
}									from "@/components/ui/card";
import { Badge }					from "@/components/ui/badge";
import { Skeleton }					from "@/components/ui/skeleton";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
}									from "@/components/ui/accordion";

import { SessionWithoutPlanningChange }	from "@/types/planning-change.model";
import { tempoFormat }					from "@/lib/utils";
import { Session }						from "@/types/section.model";


interface Props {
	sessionData		: SessionWithoutPlanningChange | null;
	isLoading		: boolean;
}


const sessionLabels: Record<Session, string> = {
	[Session.C]	: 'Cátedra',
	[Session.A]	: 'Ayudantía',
	[Session.T]	: 'Taller',
	[Session.L]	: 'Laboratorio',
};


/**
 * SessionInfoCard Component
 * 
 * Displays detailed information about a selected session.
 * Receives session data as prop from parent component.
 */
export function SessionInfoCard({
    sessionData,
    isLoading
}: Props ): JSX.Element | null {
	if ( !sessionData && !isLoading ) {
		return null;
	}


	if ( isLoading ) {
		return (
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-64 mt-2" />
				</CardHeader>

				<CardContent className="space-y-3">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</CardContent>
			</Card>
		);
	}


	if ( !isLoading && !sessionData ) {
		return (
			<Card className="border-red-200 dark:border-red-800">
				<CardHeader>
					<CardTitle className="text-red-600 dark:text-red-400">Error</CardTitle>
					<CardDescription>No se pudo cargar la información de la sesión</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	// Guard: sessionData must exist at this point
	if ( !sessionData ) {
		return null;
	}


	return (
		<Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
			<Accordion type="single" collapsible defaultValue="session-info">
				<AccordionItem value="session-info" className="border-none">
					<CardHeader className="pb-2">
						<AccordionTrigger className="hover:no-underline py-0">
							<div className="flex items-center gap-2">
								<CardTitle className="text-base">Información de la Sesión</CardTitle>
								<Badge variant="outline">{ sessionLabels[sessionData.name] }</Badge>
							</div>
						</AccordionTrigger>

						<CardDescription className="mt-1">
							Datos de la sesión seleccionada para modificar
						</CardDescription>
					</CardHeader>

					<AccordionContent>
						<CardContent className="pt-0">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								{/* Asignatura */}
								<div>
									<span className="font-semibold text-muted-foreground">Asignatura:</span>
									<p className="mt-1">{ sessionData.section.subject.id } - { sessionData.section.subject.name }</p>
								</div>

								{/* Código de Sección */}
								<div>
									<span className="font-semibold text-muted-foreground">Código de Sección:</span>
									<p className="mt-1">{ sessionData.section.code }</p>
								</div>

								{/* Profesor */}
								<div>
									<span className="font-semibold text-muted-foreground">Profesor:</span>
									<p className="mt-1">{ sessionData.professor.name }</p>
								</div>

								{/* Fecha */}
								<div>
									<span className="font-semibold text-muted-foreground">Fecha:</span>
									<p className="mt-1">{ tempoFormat( sessionData.date ) }</p>
								</div>

								{/* Espacio */}
								<div>
									<span className="font-semibold text-muted-foreground">Espacio:</span>
									<p className="mt-1">{ sessionData.spaceId || '-' }</p>
								</div>

								{/* En Inglés */}
								<div>
									<span className="font-semibold text-muted-foreground">En Inglés:</span>
									{ sessionData.isEnglish ? (
										<Badge variant="default" className="bg-green-600">Sí</Badge>
									) : (
										<Badge variant="secondary">No</Badge>
									)}
								</div>

								{/* Fechas de Sección */}
								<div className="md:col-span-2">
									<span className="font-semibold text-muted-foreground">Período de Sección:</span>
									<p className="mt-1">
										{ tempoFormat( sessionData.section.startDate ) } - { tempoFormat( sessionData.section.endDate ) }
									</p>
								</div>

								{/* Módulo/Horario */}
								<div className="md:col-span-2">
									<span className="font-semibold text-muted-foreground">Módulo/Horario:</span>
									<div className="mt-2">
										<Badge variant="outline" className="font-mono">
											M{ sessionData.dayModule.module.code } { sessionData.dayModule.module.difference || '' }: { sessionData.dayModule.module.startHour } - { sessionData.dayModule.module.endHour } { sessionData.dayModule.module.difference?? '' }
										</Badge>
									</div>
								</div>
							</div>
						</CardContent>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Card>
	);
}
