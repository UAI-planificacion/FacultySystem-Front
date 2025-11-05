'use client'

import { JSX, useState, useMemo } from "react";

import { AlertCircle, CheckCircle2 }    from "lucide-react";
import { useMutation, useQueryClient }  from "@tanstack/react-query";
import { toast }						from "sonner";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
}					                from "@/components/ui/card";
import {
    MultiSelectCombobox,
    Option
}                                   from "@/components/shared/Combobox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}					                from "@/components/ui/table";
import {
    Tabs,
	TabsContent,
	TabsList,
	TabsTrigger
}					                from "@/components/ui/tabs";
import { ScrollArea }               from "@/components/ui/scroll-area";
import { SessionType }              from "@/components/session/session-type";
import { Button }					from "@/components/ui/button";
import { Alert, AlertDescription }	from "@/components/ui/alert";
import { Label }                    from "@/components/ui/label";
import { Badge }                    from "@/components/ui/badge";
import { Switch }                   from "@/components/ui/switch";

import {
    getBuildingName,
    getSpaceType,
    SPACE_TYPES_WITH_SIZE_FILTER,
    tempoFormat
}                                       from "@/lib/utils";
import { SessionAvailabilityResponse }	from "@/types/session-availability.model";
import { SessionMassiveCreate }			from "@/types/session-massive-create.model";
import { Session }						from "@/types/section.model";
import { fetchApi, Method }				from "@/services/fetch";
import { errorToast, successToast }     from "@/config/toast/toast.config";
import { OfferSection }                 from "@/types/offer-section.model";
import { KEY_QUERYS }                   from "@/consts/key-queries";

/**
 * Extract unique groupIds from sections array
 */
const getUniqueGroupIds = ( sections: OfferSection[] ): string => {
	const uniqueIds = Array.from( new Set( sections.map( section => section.groupId )));
	return uniqueIds.join( ',' );
};


interface SessionDayModule {
	session			: Session;
	dayModuleId		: number;
	dayId			: number;
	moduleId		: number;
}


interface Props {
	response			: SessionAvailabilityResponse[] | null;
	sectionId			: string;
	sessionInEnglish	: Record<string, boolean>;
	selectedDayModules	: SessionDayModule[];
	onBack				: () => void;
	onSuccess			: ( section: OfferSection ) => void;
}


interface SessionSelection {
	spaceId		: string | null;
	professorId : string | null;
}


export function ThirdPlanning({
    response,
    sectionId,
    sessionInEnglish,
    selectedDayModules,
    onBack,
    onSuccess
}: Props ): JSX.Element {
	// Estado para las selecciones de cada sesión
	const queryClient = useQueryClient();

	const [ selections, setSelections ]                 = useState<Record<string, SessionSelection>>({});
	const [ activeTab, setActiveTab ]                   = useState<string>( "spaces" );
	const [ useSameSpace, setUseSameSpace ]             = useState<boolean>( false );
	const [ useSameProfessor, setUseSameProfessor ]     = useState<boolean>( false );
	const [ globalSpaceId, setGlobalSpaceId ]           = useState<string | undefined>( undefined );
	const [ globalProfessorId, setGlobalProfessorId ]   = useState<string | undefined>( undefined );

	// Verificar si hay sesiones no disponibles
	const hasUnavailableSessions = useMemo(() => {
		return response?.some(( item ) => !item.isReadyToCreate ) ?? false;
	}, [ response ]);

	// Verificar si hay sesiones sin fechas programadas
	const sessionsWithoutDates = useMemo(() => {
		if ( !response ) return [];
		return response.filter(( item ) => item.scheduledDates.length === 0 );
	}, [ response ]);

	const hasSessionsWithoutDates = sessionsWithoutDates.length > 0;

	// Verificar si todas las sesiones tienen espacio asignado
	const allSessionsHaveSpace = useMemo(() => {
		if ( !response ) return false;
		
		return response.every(( item ) => {
			const selection = selections[ item.session ];
			return selection?.spaceId != null;
		});
	}, [ response, selections ]);

	// Verificar si se puede reservar
	const canReserve = !hasUnavailableSessions && !hasSessionsWithoutDates && allSessionsHaveSpace;
	// Mutación para reservar sesiones
	const reserveMutation = useMutation<OfferSection, Error, SessionMassiveCreate[]>({
		mutationFn: async ( payload: SessionMassiveCreate[] ): Promise<OfferSection> => {
			return fetchApi<OfferSection>({
				url		: `sessions/massive/${sectionId}`,
				method	: Method.POST,
				body	: payload
			});
		},
		onSuccess: ( section: OfferSection ) => {
			toast( "Sesiones reservadas exitosamente", successToast );
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECTIONS] });
            onSuccess( section );
		},
		onError: ( error: Error ) => {
			toast( `Error al reservar sesiones: intenta con otra combinación de espacios, profesores y/o módulos`, errorToast );
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

	// Manejar toggle de espacios globales
	const handleUseSameSpaceToggle = ( checked: boolean ) => {
		setUseSameSpace( checked );
		if ( !checked ) {
			setGlobalSpaceId( undefined );
		}
	};

	// Manejar toggle de profesores globales
	const handleUseSameProfessorToggle = ( checked: boolean ) => {
		setUseSameProfessor( checked );
		if ( !checked ) {
			setGlobalProfessorId( undefined );
		}
	};

	// Manejar cambio de espacio global
	const handleGlobalSpaceChange = ( value: string | string[] | undefined ) => {
		const spaceId = typeof value === 'string' ? value : undefined;
		setGlobalSpaceId( spaceId );

		// Aplicar a todas las sesiones
		if ( spaceId && response ) {
			response.forEach(( item ) => {
				handleSpaceChange( item.session, spaceId );
			});
		}
	};

	// Manejar cambio de profesor global
	const handleGlobalProfessorChange = ( value: string | string[] | undefined ) => {
		const professorId = typeof value === 'string' ? value : undefined;
		setGlobalProfessorId( professorId );

		// Aplicar a todas las sesiones
		if ( professorId && response ) {
			response.forEach(( item ) => {
				handleProfessorChange( item.session, professorId );
			});
		} else if ( !professorId && response ) {
			// Si se deselecciona, aplicar "none" a todas las sesiones
			response.forEach(( item ) => {
				handleProfessorChange( item.session, "none" );
			});
		}
	};

	// Manejar reserva
	const handleReserve = () => {
		if ( !response ) return;

		const payload: SessionMassiveCreate[] = response.map(( item ) => {
			// Obtener los dayModuleIds originales del paso 1 para esta sesión
			const originalDayModuleIds = selectedDayModules
				.filter( dm => dm.session === item.session )
				.map( dm => dm.dayModuleId );

			return {
				session			: item.session,
				dayModuleIds	: originalDayModuleIds,
				spaceId			: selections[ item.session ]?.spaceId ?? "",
				professorId		: selections[ item.session ]?.professorId ?? null,
				isEnglish		: sessionInEnglish[ item.session ] ?? false
			};
		});

		console.log('🚀 ~ file: third-planning.tsx ~ payload:', payload)
		reserveMutation.mutate( payload );
	};

	// Memoizar opciones de espacios por sesión
	const spaceOptionsBySession = useMemo(() => {
		if ( !response ) return {};

		const options: Record<string, Option[]> = {};

		response.forEach(( item ) => {
			options[ item.session ] = item.availableSpaces.map(( space ) => ({
				value	: space.id,
				label	: `${ space.id } - ${ getBuildingName( space.building ) } - ${
					SPACE_TYPES_WITH_SIZE_FILTER.includes( space.type )
						? `${getSpaceType( space.type )} ${space.size}`
						: getSpaceType( space.type )
				}`
			}));
		});

		return options;
	}, [ response ]);

	// Memoizar opciones de profesores por sesión
	const professorOptionsBySession = useMemo(() => {
		if ( !response ) return {};

		const options: Record<string, Option[]> = {};

		response.forEach(( item ) => {
			options[ item.session ] = item.availableProfessors
				.filter(( prof ) => prof.available )
				.map(( professor ) => ({
					value	: professor.id,
					label	: `${ professor.id } - ${ professor.name }`
				}));
		});

		return options;
	}, [ response ]);

	// Memoizar valores por defecto de espacios
	const spaceDefaultValues = useMemo(() => {
		const defaults: Record<string, string | undefined> = {};

		Object.keys( selections ).forEach(( session ) => {
			defaults[ session ] = selections[ session ]?.spaceId ?? undefined;
		});

		return defaults;
	}, [ selections ]);

	// Memoizar valores por defecto de profesores
	const professorDefaultValues = useMemo(() => {
		const defaults: Record<string, string | undefined> = {};

		Object.keys( selections ).forEach(( session ) => {
			const professorId = selections[ session ]?.professorId;
			defaults[ session ] = ( professorId && professorId !== "none" ) ? professorId : undefined;
		});

		return defaults;
	}, [ selections ]);

	// Calcular espacios comunes entre todas las sesiones (intersección)
	const commonSpaces = useMemo(() => {
		if ( !response || response.length === 0 ) return [];

		// Obtener los IDs de espacios de la primera sesión
		const firstSessionSpaces = response[0].availableSpaces.map( space => space.id );

		// Filtrar solo los espacios que están en TODAS las sesiones
		const common = firstSessionSpaces.filter( spaceId => {
			return response.every( item => 
				item.availableSpaces.some( space => space.id === spaceId )
			);
		});

		// Retornar las opciones completas de los espacios comunes
		return response[0].availableSpaces
			.filter( space => common.includes( space.id ) )
			.map( space => ({
				value	: space.id,
				label	: `${ space.id } - ${ getBuildingName( space.building ) } - ${
					SPACE_TYPES_WITH_SIZE_FILTER.includes( space.type )
						? `${getSpaceType( space.type )} ${space.size}`
						: getSpaceType( space.type )
				}`
			}));
	}, [ response ]);

	// Calcular profesores comunes entre todas las sesiones (intersección)
	const commonProfessors = useMemo(() => {
		if ( !response || response.length === 0 ) return [];

		// Obtener los IDs de profesores disponibles de la primera sesión
		const firstSessionProfessors = response[0].availableProfessors
			.filter( prof => prof.available )
			.map( prof => prof.id );

		// Filtrar solo los profesores que están disponibles en TODAS las sesiones
		const common = firstSessionProfessors.filter( professorId => {
			return response.every( item => 
				item.availableProfessors.some( prof => prof.id === professorId && prof.available )
			);
		});

		// Retornar las opciones completas de los profesores comunes
		return response[0].availableProfessors
			.filter( prof => common.includes( prof.id ) && prof.available )
			.map( prof => ({
				value	: prof.id,
				label	: `${ prof.id } - ${ prof.name }`
			}));
	}, [ response ]);

	// Verificar si se puede habilitar el switch de espacios globales
	const canUseGlobalSpaces = commonSpaces.length > 0;

	// Verificar si se puede habilitar el switch de profesores globales
	const canUseGlobalProfessors = commonProfessors.length > 0;


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
		<div className="space-y-4">
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

			{/* Alerta si hay sesiones sin fechas programadas */}
			{ hasSessionsWithoutDates && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />

					<AlertDescription>
						{ sessionsWithoutDates.length === 1 ? (
							<>
								La sesión <strong>{ sessionsWithoutDates[0].session }</strong> no tiene fechas disponibles según los parámetros ingresados. 
								Debe volver a los pasos anteriores para seleccionar otros módulos o ajustar la configuración.
							</>
						) : (
							<>
								Las sesiones <strong>{ sessionsWithoutDates.map( s => s.session ).join( ', ' ) }</strong> no tienen fechas disponibles según los parámetros ingresados. 
								Debe volver a los pasos anteriores para seleccionar otros módulos o ajustar la configuración.
							</>
						)}
					</AlertDescription>
				</Alert>
			)}

			{/* Tabs para Espacios y Profesores */}
			<Card>
				<CardContent className="mt-5">
					<Tabs value={ activeTab } onValueChange={ setActiveTab }>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="spaces">Espacios</TabsTrigger>
							<TabsTrigger value="professors">Profesores</TabsTrigger>
						</TabsList>

						{/* Tab de Espacios */}
						<TabsContent value="spaces" className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold">Espacios disponibles por Sesión</h3>

								<div 
									className="flex items-center space-x-2" 
									title={ !canUseGlobalSpaces ? "No hay espacios disponibles en común para todas las sesiones" : "Usar el mismo espacio para todas las sesiones" }
								>
									<Label 
										htmlFor="use-same-space" 
										className={ `cursor-pointer text-sm ${ !canUseGlobalSpaces ? 'text-muted-foreground' : '' }` }
									>
										Espacios Globales
									</Label>

									<Switch
										id				= "use-same-space"
										checked			= { useSameSpace }
										onCheckedChange	= { handleUseSameSpaceToggle }
										disabled		= { !canUseGlobalSpaces }
									/>
								</div>
							</div>

							{ useSameSpace ? (
								<div className="space-y-3">
									<Label className="text-sm font-medium">Espacio Global</Label>
									<MultiSelectCombobox
										multiple			= { false }
										required			= { true }
										placeholder			= "Seleccione un espacio"
										searchPlaceholder	= "Buscar espacio..."
										defaultValues		= { globalSpaceId }
										options				= { commonSpaces }
										onSelectionChange	= { handleGlobalSpaceChange }
									/>
									<p className="text-xs text-muted-foreground">
										Este espacio se aplicará a todas las sesiones
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
									{ response.map(( item ) => (
										<div key={ item.session } className="space-y-2">
											<Label htmlFor={`space-${item.session}`} className="flex items-center gap-2">
												<SessionType session={ item.session } />

												<span className="text-destructive">*</span>
												{ !item.isReadyToCreate && (
													<Badge variant="destructive" className="ml-auto">
														<AlertCircle className="h-3 w-3 mr-1" />
														No disponible
													</Badge>
												)}
											</Label>

											<MultiSelectCombobox
												multiple			= { false }
												required			= { true }
												placeholder			= "Seleccione un espacio"
												searchPlaceholder	= "Buscar espacio..."
												defaultValues		= { spaceDefaultValues[ item.session ] }
												disabled			= { !item.isReadyToCreate }
												options				= { spaceOptionsBySession[ item.session ] ?? [] }
												onSelectionChange	= {( value ) => {
													const spaceId = typeof value === 'string' ? value : undefined;
													if ( spaceId ) {
														handleSpaceChange( item.session, spaceId );
													}
												}}
											/>

											{ !selections[ item.session ]?.spaceId && (
												<p className="text-xs text-muted-foreground">
													Debe seleccionar un espacio
												</p>
											)}
										</div>
									))}
								</div>
							)}
						</TabsContent>

						{/* Tab de Profesores */}
						<TabsContent value="professors" className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold">Profesores disponibles por Sesión</h3>

								<div 
									className="flex items-center space-x-2" 
									title={ !canUseGlobalProfessors ? "No hay profesores disponibles en común para todas las sesiones" : "Usar el mismo profesor para todas las sesiones" }
								>
									<Label 
										htmlFor="use-same-professor" 
										className={ `cursor-pointer text-sm ${ !canUseGlobalProfessors ? 'text-muted-foreground' : '' }` }
									>
										Profesores Globales
									</Label>

									<Switch
										id				= "use-same-professor"
										checked			= { useSameProfessor }
										onCheckedChange	= { handleUseSameProfessorToggle }
										disabled		= { !canUseGlobalProfessors }
									/>
								</div>
							</div>

							{ useSameProfessor ? (
								<div className="space-y-3">
									<Label className="text-sm font-medium">Profesor Global <span className="text-muted-foreground text-xs">(Opcional)</span></Label>
									<MultiSelectCombobox
										multiple			= { false }
										required			= { false }
										placeholder			= "Sin profesor asignado"
										searchPlaceholder	= "Buscar profesor..."
										defaultValues		= { globalProfessorId }
										options				= { commonProfessors }
										onSelectionChange	= { handleGlobalProfessorChange }
									/>
									<p className="text-xs text-muted-foreground">
										Este profesor se aplicará a todas las sesiones
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{ response.map(( item ) => (
										<div key={ item.session } className="space-y-2">
											<Label htmlFor={`professor-${item.session}`} className="flex items-center gap-2">
												<SessionType session={ item.session } />

												<span className="text-muted-foreground text-xs">(Opcional)</span>
											</Label>

											<MultiSelectCombobox
												multiple			= { false }
												required			= { false }
												placeholder			= "Sin profesor asignado"
												searchPlaceholder	= "Buscar profesor..."
												defaultValues		= { professorDefaultValues[ item.session ] }
												disabled			= { !item.isReadyToCreate }
												options				= { professorOptionsBySession[ item.session ] ?? [] }
												onSelectionChange	= {( value ) => {
													const professorId = typeof value === 'string' ? value : "none";
													handleProfessorChange( item.session, professorId );
												}}
											/>
										</div>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Tabla Unificada de Todas las Sesiones */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Fechas Programadas</CardTitle>
					<CardDescription>
						Todas las sesiones que serán reservadas
					</CardDescription>
				</CardHeader>

				<CardContent>
					<ScrollArea className="h-[400px] w-full border rounded-lg">
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
                                                <SessionType session={ item.session } />
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
					</ScrollArea>
				</CardContent>
			</Card>

			{/* Botones de acción */}
			<div className="flex justify-between border-t pt-4">
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
