'use client'

import { JSX, useState, useMemo } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button }					from "@/components/ui/button";
import { Alert, AlertDescription }	from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
}										from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
}										from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}										from "@/components/ui/table";
import { Label }						from "@/components/ui/label";
import { Badge }						from "@/components/ui/badge";
import { SessionName }					from "@/components/session/session-name";

import { SessionAvailabilityResponse }	from "@/types/session-availability.model";
import { SessionMassiveCreate }			from "@/types/session-massive-create.model";
import { fetchApi, Method }				from "@/services/fetch";
import { tempoFormat }					from "@/lib/utils";
import { toast }						from "sonner";


interface Props {
	response			: SessionAvailabilityResponse[] | null;
	sectionId			: string;
	sessionInEnglish	: Record<string, boolean>;
	onBack				: () => void;
	onSuccess			: () => void;
}


interface SessionSelection {
	spaceId			: string | null;
	professorId		: string | null;
}


export function ThirdPlanning({ response, sectionId, sessionInEnglish, onBack, onSuccess }: Props ): JSX.Element {
	
	// Estado para las selecciones de cada sesión
	const [ selections, setSelections ] = useState<Record<string, SessionSelection>>({});

	
	// Verificar si hay sesiones no disponibles
	const hasUnavailableSessions = useMemo(() => {
		return response?.some(( item ) => !item.isReadyToCreate ) ?? false;
	}, [ response ]);


	// Verificar si todas las sesiones tienen espacio asignado
	const allSessionsHaveSpace = useMemo(() => {
		if ( !response ) return false;
		
		return response.every(( item ) => {
			const selection = selections[ item.session ];
			return selection?.spaceId != null;
		});
	}, [ response, selections ]);


	// Verificar si se puede reservar
	const canReserve = !hasUnavailableSessions && allSessionsHaveSpace;


	// Mutación para reservar sesiones
	const reserveMutation = useMutation({
		mutationFn: async ( payload: SessionMassiveCreate[] ) => {
			return fetchApi({
				url		: `sessions/massive/${sectionId}`,
				method	: Method.POST,
				body	: payload
			});
		},
		onSuccess: () => {
			toast.success( "Sesiones reservadas exitosamente" );
			onSuccess();
		},
		onError: ( error: Error ) => {
			toast.error( `Error al reservar sesiones: ${error.message}` );
		}
	});


	// Manejar cambio de espacio
	const handleSpaceChange = ( session: string, spaceId: string ) => {
		setSelections(( prev ) => ({
			...prev,
			[ session ]: {
				...prev[ session ],
				spaceId
			}
		}));
	};


	// Manejar cambio de profesor
	const handleProfessorChange = ( session: string, professorId: string ) => {
		setSelections(( prev ) => ({
			...prev,
			[ session ]: {
				...prev[ session ],
				professorId: professorId === "none" ? null : professorId
			}
		}));
	};


	// Manejar reserva
	const handleReserve = () => {
		if ( !response ) return;

		const payload: SessionMassiveCreate[] = response.map(( item ) => ({
			session			: item.session,
			dayModuleIds	: item.scheduledDates.map(( date ) => date.dayModuleId ),
			spaceId			: selections[ item.session ]?.spaceId ?? "",
			professorId		: selections[ item.session ]?.professorId ?? null,
			isEnglish		: sessionInEnglish[ item.session ] ?? false
		}));

		reserveMutation.mutate( payload );
	};


	if ( !response || response.length === 0 ) {
		return (
			<div className="space-y-6">
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						No hay datos de disponibilidad para mostrar
					</AlertDescription>
				</Alert>

				<div className="flex justify-start">
					<Button
						variant	= "outline"
						onClick	= { onBack }
					>
						Atrás
					</Button>
				</div>
			</div>
		);
	}


	return (
		<div className="space-y-6">
			{/* Alerta si hay sesiones no disponibles */}
			{ hasUnavailableSessions && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />

					<AlertDescription>
						Algunas sesiones no están disponibles para ser reservadas. 
						Debe volver a los pasos anteriores para ajustar la configuración.
					</AlertDescription>
				</Alert>
			)}

			{/* Sección de Espacios por Sesión */}
			<Card>
				<CardHeader>
					<CardTitle>Espacios por Sesión</CardTitle>
					<CardDescription>
						Seleccione un espacio (requerido) para cada sesión
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{ response.map(( item ) => (
							<div key={ item.session } className="space-y-2">
								<Label htmlFor={`space-${item.session}`} className="flex items-center gap-2">
									<SessionName session={ item.session } isShort />
									<span className="text-destructive">*</span>
									{ !item.isReadyToCreate && (
										<Badge variant="destructive" className="ml-auto">
											<AlertCircle className="h-3 w-3 mr-1" />
											No disponible
										</Badge>
									)}
								</Label>

								<Select
									value			= { selections[ item.session ]?.spaceId ?? "" }
									onValueChange	= {( value ) => handleSpaceChange( item.session, value )}
									disabled		= { !item.isReadyToCreate }
								>
									<SelectTrigger id={`space-${item.session}`}>
										<SelectValue placeholder="Seleccione un espacio" />
									</SelectTrigger>

									<SelectContent>
										{ item.availableSpaces.map(( space ) => (
											<SelectItem key={ space.id } value={ space.id }>
												{ space.id }
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{ !selections[ item.session ]?.spaceId && (
									<p className="text-xs text-muted-foreground">
										Debe seleccionar un espacio
									</p>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Sección de Profesores por Sesión */}
			<Card>
				<CardHeader>
					<CardTitle>Profesores por Sesión</CardTitle>
					<CardDescription>
						Seleccione opcionalmente un profesor para cada sesión
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{ response.map(( item ) => (
							<div key={ item.session } className="space-y-2">
								<Label htmlFor={`professor-${item.session}`} className="flex items-center gap-2">
									<SessionName session={ item.session } isShort />
									<span className="text-muted-foreground text-xs">(Opcional)</span>
								</Label>

								<Select
									value			= { selections[ item.session ]?.professorId ?? "none" }
									onValueChange	= {( value ) => handleProfessorChange( item.session, value )}
									disabled		= { !item.isReadyToCreate }
								>
									<SelectTrigger id={`professor-${item.session}`}>
										<SelectValue placeholder="Sin profesor asignado" />
									</SelectTrigger>

									<SelectContent>
										<SelectItem value="none">Sin profesor asignado</SelectItem>
										{ item.availableProfessors
											.filter(( prof ) => prof.available )
											.map(( professor ) => (
												<SelectItem key={ professor.id } value={ professor.id }>
													{ professor.id } - { professor.name }
												</SelectItem>
											))
										}
									</SelectContent>
								</Select>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Tabla Unificada de Todas las Sesiones */}
			<Card>
				<CardHeader>
					<CardTitle>Fechas Programadas</CardTitle>
					<CardDescription>
						Todas las sesiones que serán reservadas
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="border rounded-lg">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Sesión</TableHead>
									<TableHead>Fecha</TableHead>
									<TableHead>Módulo</TableHead>
									<TableHead>Estado</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{ response.flatMap(( item ) =>
									item.scheduledDates.map(( date, index ) => (
										<TableRow key={`${item.session}-${index}`}>
											<TableCell>
												<SessionName session={ item.session } isShort />
											</TableCell>

											<TableCell>
												{ tempoFormat( date.date )}
											</TableCell>

											<TableCell>
												{ date.timeRange }
											</TableCell>

											<TableCell>
												{ item.isReadyToCreate ? (
													<Badge variant="default">
														<CheckCircle2 className="h-3 w-3 mr-1" />
														Lista
													</Badge>
												) : (
													<Badge variant="destructive">
														<AlertCircle className="h-3 w-3 mr-1" />
														No disponible
													</Badge>
												)}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* Botones de acción */}
			<div className="flex justify-between">
				<Button
					variant		= "outline"
					onClick		= { onBack }
					disabled	= { reserveMutation.isPending }
				>
					Atrás
				</Button>

				<Button
					onClick		= { handleReserve }
					disabled	= { !canReserve || reserveMutation.isPending }
				>
					{ reserveMutation.isPending ? "Reservando..." : "Reservar Sesiones" }
				</Button>
			</div>
		</div>
	);
}
