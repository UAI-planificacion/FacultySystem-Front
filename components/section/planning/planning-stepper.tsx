'use client'

import { JSX, useState, useMemo, useCallback }  from "react";
import { useRouter }                            from 'next/navigation';

import { useMutation }  from "@tanstack/react-query";
import { toast }        from "sonner";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
}							from "@/components/ui/card";
import { Skeleton }         from "@/components/ui/skeleton";
import { FirstPlanning }	from "@/components/section/planning/first-planning";
import { SecondPlanning }	from "@/components/section/planning/second-planning";
import { ThirdPlanning }	from "@/components/section/planning/third-planning";
import { FilterMode }       from "@/components/shared/space-filter-selector";

import {
    SessionAvailabilityRequest,
    SessionAvailabilityResponse
}                                           from "@/types/session-availability.model";
import { BuildingEnum, Size, SpaceType }    from "@/types/request-detail.model";
import { OfferSection }                     from "@/types/offer-section.model";
import { Session }			                from "@/types/section.model";
import { fetchApi, Method }			        from "@/services/fetch";
import { errorToast, successToast }         from "@/config/toast/toast.config";


interface SessionDayModule {
	session     : Session;
	dayModuleId : number;
	dayId       : number;
	moduleId    : number;
}


interface Props {
	section : OfferSection;
}


export function PlanningStepperComponent({ section }: Props ): JSX.Element {
    const router = useRouter();

	// Estado del paso actual
	const [currentStep, setCurrentStep] = useState( 1 );

	// Estado para los dayModules seleccionados
	const [selectedDayModules, setSelectedDayModules] = useState<SessionDayModule[]>([]);

	// Estado para la sesión actualmente seleccionada para marcar
	const [currentSession, setCurrentSession] = useState<Session | null>( null );

	// Estado para espacios por sesión (múltiples)
	const [sessionSpaces, setSessionSpaces] = useState<Record<Session, string[]>>({
		[Session.C] : [],
		[Session.A] : [],
		[Session.T] : [],
		[Session.L] : [],
	});

	// Estado para profesores por sesión (múltiples)
	const [sessionProfessors, setSessionProfessors] = useState<Record<Session, string[]>>({
		[Session.C] : section?.professor?.id ? [section.professor.id] : [],
		[Session.A] : section?.professor?.id ? [section.professor.id] : [],
		[Session.T] : section?.professor?.id ? [section.professor.id] : [],
		[Session.L] : section?.professor?.id ? [section.professor.id] : [],
	});

	// Estado para edificios por sesión
	const [sessionBuildings, setSessionBuildings] = useState<Record<Session, string | null>>({
		[Session.C] : null,
		[Session.A] : null,
		[Session.T] : null,
		[Session.L] : null,
	});

	// Estado para tipo de espacio por sesión
	const [sessionSpaceTypes, setSessionSpaceTypes] = useState<Record<Session, string | null>>({
		[Session.C] : null,
		[Session.A] : null,
		[Session.T] : null,
		[Session.L] : null,
	});

	// Estado para tamaño de espacio por sesión
	const [sessionSpaceSizes, setSessionSpaceSizes] = useState<Record<Session, string | null>>({
		[Session.C] : null,
		[Session.A] : null,
		[Session.T] : null,
		[Session.L] : null,
	});

	// Estado para modo de filtro por sesión
	const [sessionFilterModes, setSessionFilterModes] = useState<Record<Session, FilterMode>>({
		[Session.C] : 'type-size',
		[Session.A] : 'type-size',
		[Session.T] : 'type-size',
		[Session.L] : 'type-size',
	});

	// Estado para "usar mismo espacio para todas las sesiones"
	const [useSameSpace, setUseSameSpace]           = useState<boolean>( false );
	const [globalSpaceId, setGlobalSpaceId]         = useState<string[]>([]);
	const [globalBuildingId, setGlobalBuildingId]   = useState<string | null>( null );

	// Estado para "usar mismo profesor para todas las sesiones"
	const [useSameProfessor, setUseSameProfessor]   = useState<boolean>( false );
	const [globalProfessorId, setGlobalProfessorId] = useState<string[]>( section?.professor?.id ? [section.professor.id] : [] );

	// Estado para inglés por sesión
	const [sessionInEnglish, setSessionInEnglish] = useState<Record<Session, boolean>>({
		[Session.C] : false,
		[Session.A] : false,
		[Session.T] : false,
		[Session.L] : false,
	});

	// Estado para "todas las sesiones en inglés"
	const [allInEnglish, setAllInEnglish] = useState<boolean>( false );

	// Estado para la respuesta del servicio
	const [availabilityResponse, setAvailabilityResponse] = useState<SessionAvailabilityResponse[] | null>( null );

	// Calcular cuántas sesiones de cada tipo necesitamos basado en section
	const sessionRequirements = useMemo(() => {
		if ( !section ) return {};

		const requirements: Partial<Record<Session, number>> = {};

		if ( section.lecture > 0 )          requirements[Session.C] = section.lecture;
		if ( section.tutoringSession > 0 )  requirements[Session.A] = section.tutoringSession;
		if ( section.workshop > 0 )         requirements[Session.T] = section.workshop;
		if ( section.laboratory > 0 )       requirements[Session.L] = section.laboratory;

		return requirements;
	}, [ section ]);

	// Calcular las sesiones que ya están completas
	const completedSessions = useMemo(() => {
		const completed: Partial<Record<Session, number>> = {};

		Object.entries( sessionRequirements ).forEach(([ session ]) => {
			const sessionKey    = session as Session;
			const selectedCount = selectedDayModules.filter( dm => dm.session === sessionKey ).length;

            completed[sessionKey] = selectedCount;
		});

		return completed;
	}, [ selectedDayModules, sessionRequirements ]);

	// Verificar si todas las sesiones están completas
	const allSessionsComplete = useMemo(() => {
		return Object.entries( sessionRequirements ).every(([ session, required ]) => {
			const sessionKey    = session as Session;
			const completed     = completedSessions[sessionKey] || 0;
			return completed === required;
		});
	}, [ sessionRequirements, completedSessions ]);

	// Manejar toggle de dayModule
	const handleToggleDayModule = useCallback(( session: Session, dayId: number, moduleId: number, dayModuleId: number ) => {
		setSelectedDayModules( prev => {
			const existingIndex = prev.findIndex( dm => dm.dayId === dayId && dm.moduleId === moduleId );

			if ( existingIndex >= 0 ) {
				// Si ya existe, lo removemos
				return prev.filter(( _, index ) => index !== existingIndex );
			} else {
				// Verificar si ya alcanzamos el límite para esta sesión
				const currentCount = prev.filter( dm => dm.session === session ).length;
				const required = sessionRequirements[session] || 0;

				if ( currentCount >= required ) {
					// Ya alcanzamos el límite, no agregar más
					return prev;
				}

				// Agregar nuevo
				return [...prev, {
					session,
					dayModuleId,
					dayId,
					moduleId
				}];
			}
		});
	}, [ sessionRequirements ]);

	// Manejar cambio de espacios por sesión (múltiples)
	const handleSpaceChange = useCallback(( session: Session, value: string | string[] | undefined ) => {
		const spaceIds = Array.isArray( value ) ? value : ( value ? [value] : [] );
		setSessionSpaces( prev => ({
			...prev,
			[session]: spaceIds
		}));
	}, []);

	// Manejar cambio de profesores por sesión (múltiples)
	const handleProfessorChange = useCallback(( session: Session, value: string | string[] | undefined ) => {
		const professorIds = Array.isArray( value ) ? value : ( value ? [value] : [] );
		setSessionProfessors( prev => ({
			...prev,
			[session]: professorIds
		}));
	}, []);

	// Manejar cambio de espacio global (múltiples)
	// const handleGlobalSpaceChange = useCallback(( value: string | string[] | undefined ) => {
	// 	const spaceIds = Array.isArray( value ) ? value : ( value ? [value] : [] );
	// 	setGlobalSpaceId( spaceIds );

	// 	if ( useSameSpace ) {
	// 		// Actualizar todos los espacios de sesión
	// 		setSessionSpaces( prev => {
	// 			const updated = { ...prev };
	// 			Object.keys( sessionRequirements ).forEach( session => {
	// 				updated[session as Session] = spaceIds;
	// 			});
	// 			return updated;
	// 		});
	// 	}
	// }, [ useSameSpace, sessionRequirements ]);

	// Manejar cambio de edificio global
	const handleGlobalBuildingChange = useCallback(( buildingId: string | null ) => {
		setGlobalBuildingId( buildingId );

		// Actualizar el edificio en todas las sesiones
		setSessionBuildings( prev => {
			const updated = { ...prev };
			Object.keys( sessionRequirements ).forEach( session => {
				updated[session as Session] = buildingId;
			});
			return updated;
		});

		// Limpiar filtros de espacio cuando cambia el edificio
		setSessionSpaceTypes( prev => {
			const updated = { ...prev };
			Object.keys( sessionRequirements ).forEach( session => {
				updated[session as Session] = null;
			});
			return updated;
		});

        setSessionSpaceSizes( prev => {
			const updated = { ...prev };
			Object.keys( sessionRequirements ).forEach( session => {
				updated[session as Session] = null;
			});
			return updated;
		});

        setSessionSpaces( prev => {
			const updated = { ...prev };
			Object.keys( sessionRequirements ).forEach( session => {
				updated[session as Session] = [];
			});
			return updated;
		});

        setGlobalSpaceId([]);
	}, [ sessionRequirements ]);

	// Manejar cambio de profesor global (múltiples)
	const handleGlobalProfessorChange = useCallback(( value: string | string[] | undefined ) => {
		const professorIds = Array.isArray( value ) ? value : ( value ? [value] : [] );
		setGlobalProfessorId( professorIds );

		if ( useSameProfessor ) {
			// Actualizar todos los profesores de sesión
			setSessionProfessors( prev => {
				const updated = { ...prev };
				Object.keys( sessionRequirements ).forEach( session => {
					updated[session as Session] = professorIds;
				});
				return updated;
			});
		}
	}, [ useSameProfessor, sessionRequirements ]);

	// Manejar toggle de "usar mismo espacio"
	const handleUseSameSpaceToggle = useCallback(( checked: boolean ) => {
		setUseSameSpace( checked );

		if ( checked && globalSpaceId.length > 0 ) {
			// Aplicar los espacios globales a todas las sesiones
			setSessionSpaces( prev => {
				const updated = { ...prev };

                Object.keys( sessionRequirements ).forEach( session => {
					updated[session as Session] = globalSpaceId;
				});

                return updated;
			});
		}
	}, [ globalSpaceId, sessionRequirements ]);

	// Manejar toggle de "usar mismo profesor"
	const handleUseSameProfessorToggle = useCallback(( checked: boolean ) => {
		setUseSameProfessor( checked );

		if ( checked && globalProfessorId.length > 0 ) {
			// Aplicar los profesores globales a todas las sesiones
			setSessionProfessors( prev => {
				const updated = { ...prev };

                Object.keys( sessionRequirements ).forEach( session => {
					updated[session as Session] = globalProfessorId;
				});

                return updated;
			});
		}
	}, [ globalProfessorId, sessionRequirements ]);

	// Manejar cambio de edificio por sesión
	const handleBuildingChange = useCallback(( session: Session, buildingId: string | null ) => {
		setSessionBuildings( prev => ({
			...prev,
			[session]: buildingId
		}));

        // Limpiar filtros de espacio cuando cambia el edificio
		setSessionSpaceTypes( prev => ({
			...prev,
			[session]: null
		}));

        setSessionSpaceSizes( prev => ({
			...prev,
			[session]: null
		}));

        setSessionSpaces( prev => ({
			...prev,
			[session]: []
		}));
	}, []);

	// Manejar cambio de tipo de espacio por sesión
	const handleSpaceTypeChange = useCallback(( session: Session, spaceType: string | null ) => {
		setSessionSpaceTypes( prev => ({
			...prev,
			[session]: spaceType
		}));
	}, []);

	// Manejar cambio de tamaño de espacio por sesión
	const handleSpaceSizeChange = useCallback(( session: Session, spaceSizeId: string | null ) => {
		setSessionSpaceSizes( prev => ({
			...prev,
			[session]: spaceSizeId
		}));
	}, []);

	// Manejar cambio de modo de filtro por sesión
	const handleFilterModeChange = useCallback(( session: Session, filterMode: FilterMode ) => {
		setSessionFilterModes( prev => ({
			...prev,
			[session]: filterMode
		}));
	}, []);

	// Manejar cambio de inglés por sesión
	const handleInEnglishChange = useCallback(( session: Session, checked: boolean ) => {
		setSessionInEnglish( prev => ({
			...prev,
			[session]: checked
		}));
	}, []);

	// Manejar toggle de "todas las sesiones en inglés"
	const handleAllInEnglishToggle = useCallback(( checked: boolean ) => {
		setAllInEnglish( checked );

		// Aplicar a todas las sesiones
		setSessionInEnglish( prev => {
			const updated = { ...prev };

            Object.keys( sessionRequirements ).forEach( session => {
				updated[session as Session] = checked;
			});

            return updated;
		});
	}, [ sessionRequirements ]);

	// API para calcular disponibilidad de sesiones
	const calculateAvailabilityApi = async ( payload: SessionAvailabilityRequest[] ): Promise<SessionAvailabilityResponse[]> =>
        fetchApi<SessionAvailabilityResponse[]>({
            url     : `sessions/calculate-availability/${section!.id}`,
            method  : Method.POST,
            body    : payload
        })

	// Mutation para calcular disponibilidad
	const calculateAvailabilityMutation = useMutation({
		mutationFn  : calculateAvailabilityApi,
		onSuccess   : ( response ) => {
			setAvailabilityResponse( response );
			setCurrentStep( 3 ); // Ir al paso 3
			toast( 'Disponibilidad calculada exitosamente', successToast );
		},
		onError     : ( error: any ) => {
			toast( `Error al calcular disponibilidad: ${error.message}`, errorToast );
		}
	});

	// Generar payload para el servicio
	const generatePayload = useCallback((): SessionAvailabilityRequest[] => {
		// Agrupar dayModuleIds por sesión
		const sessionGroups: Record<Session, number[]> = {
			[Session.C] : [],
			[Session.A] : [],
			[Session.T] : [],
			[Session.L] : [],
		};

		selectedDayModules.forEach( dm => {
			sessionGroups[dm.session].push( dm.dayModuleId );
		});

		// Crear payload agrupado por sesión
		return Object.entries( sessionRequirements )
			.filter(([ _, required ]) => required && required > 0 )
			.map(([ session ]) => {
				const sessionKey = session as Session;
				const spaceIds = sessionSpaces[sessionKey];
				const professorIds = sessionProfessors[sessionKey];

                return {
					session         : sessionKey,
					dayModuleIds    : sessionGroups[sessionKey],
					spaceIds        : spaceIds.length > 0 ? spaceIds : null,
					professorIds    : professorIds,
					isEnglish       : allInEnglish ? true : sessionInEnglish[sessionKey],
					building        : spaceIds.length === 0 ? ( sessionBuildings[sessionKey] as BuildingEnum | null ) : null,
					spaceType       : spaceIds.length === 0 ? ( sessionSpaceTypes[sessionKey] as SpaceType | null ) : null,
					spaceSize       : spaceIds.length === 0 ? ( sessionSpaceSizes[sessionKey] as Size | null ) : null,
				};
			});
	}, [
		selectedDayModules,
		sessionSpaces,
		sessionProfessors,
		sessionBuildings,
		sessionSpaceTypes,
		sessionSpaceSizes,
		sessionInEnglish,
		allInEnglish,
		sessionRequirements
	]);

	// Manejar cálculo de disponibilidad
	const handleCalculateAvailability = useCallback(() => {
		const payload = generatePayload();

		// Por ahora solo ir al paso 3 sin llamar al servicio
		setCurrentStep( 3 );

		// Cuando esté listo, descomentar:
		calculateAvailabilityMutation.mutate( payload );
	}, [ generatePayload ]);

	// Navegación entre pasos
	const goToStep = useCallback(( step: number ) => {
		setCurrentStep( step );
	}, []);


	return (
		<Card className="h-[calc(100vh-500px)] overflow-auto">
			<CardHeader>
				<CardTitle className="text-base">
					Planificación de Sección - Paso {currentStep} de 3

                    <hr className="mt-2" />
				</CardTitle>
			</CardHeader>

			<CardContent>
				{currentStep === 1 && (
					<FirstPlanning
						// section                 = { section }
						selectedDayModules      = { selectedDayModules }
						currentSession          = { currentSession }
						sessionRequirements     = { sessionRequirements }
						completedSessions       = { completedSessions }
						allSessionsComplete     = { allSessionsComplete }
						onToggleDayModule       = { handleToggleDayModule }
						onSessionChange         = { setCurrentSession }
						onNext                  = {() => goToStep( 2 )}
					/>
				)}

				{currentStep === 2 && (
					<SecondPlanning
						section                     = { section }
						sessionRequirements         = { sessionRequirements }
						sessionSpaces               = { sessionSpaces }
						sessionProfessors           = { sessionProfessors }
						sessionBuildings            = { sessionBuildings }
						sessionSpaceTypes           = { sessionSpaceTypes }
						sessionSpaceSizes           = { sessionSpaceSizes }
						sessionFilterModes          = { sessionFilterModes }
						sessionInEnglish            = { sessionInEnglish }
						useSameSpace                = { useSameSpace }
						globalBuildingId            = { globalBuildingId }
						useSameProfessor            = { useSameProfessor }
						globalProfessorId           = { globalProfessorId }
						allInEnglish                = { allInEnglish }
						onSpaceChange               = { handleSpaceChange }
						onProfessorChange           = { handleProfessorChange }
						onGlobalBuildingChange      = { handleGlobalBuildingChange }
						onGlobalProfessorChange     = { handleGlobalProfessorChange }
						onUseSameSpaceToggle        = { handleUseSameSpaceToggle }
						onUseSameProfessorToggle    = { handleUseSameProfessorToggle }
						onBuildingChange            = { handleBuildingChange }
						onSpaceTypeChange           = { handleSpaceTypeChange }
						onSpaceSizeChange           = { handleSpaceSizeChange }
						onFilterModeChange          = { handleFilterModeChange }
						onInEnglishChange           = { handleInEnglishChange }
						onAllInEnglishToggle        = { handleAllInEnglishToggle }
						onBack                      = {() => goToStep( 1 )}
						onCalculate                 = { handleCalculateAvailability }
						isCalculating               = { calculateAvailabilityMutation.isPending }
					/>
				)}

				{currentStep === 3 && (
					<>
						{/* Skeleton mientras se calcula la disponibilidad */}
						{ calculateAvailabilityMutation.isPending ? (
							<div className="space-y-6">
								{/* Skeleton para tabs de Espacios/Profesores */}
								<Card>
									<CardContent className="mt-5 space-y-4">
										<div className="flex gap-2">
											<Skeleton className="h-10 w-full" />
											<Skeleton className="h-10 w-full" />
										</div>

										<Skeleton className="h-8 w-64" />

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<Skeleton className="h-20 w-full" />
											<Skeleton className="h-20 w-full" />
											<Skeleton className="h-20 w-full" />
											<Skeleton className="h-20 w-full" />
										</div>
									</CardContent>
								</Card>

								{/* Skeleton para tabla de Fechas Programadas */}
								<Card>
									<CardHeader>
										<Skeleton className="h-6 w-48" />
										<Skeleton className="h-4 w-64 mt-2" />
									</CardHeader>

									<CardContent>
										<div className="space-y-2">
											{ Array.from({ length: 5 }).map(( _, index ) => (
												<Skeleton key={ index } className="h-12 w-full" />
											))}
										</div>
									</CardContent>
								</Card>

								{/* Skeleton para botones */}
								<div className="flex justify-between border-t pt-4">
									<Skeleton className="h-10 w-24" />
									<Skeleton className="h-10 w-40" />
								</div>
							</div>
						) : (
							<ThirdPlanning
								response			= { availabilityResponse }
								sectionId			= { section.id }
								sessionInEnglish	= { sessionInEnglish }
								selectedDayModules	= { selectedDayModules }
								isCalculating		= { calculateAvailabilityMutation.isPending }
								onBack				= {() => goToStep( 2 )}
								onSuccess			= {( section: OfferSection ) => {
									// Resetear el stepper al paso 1 después de reservar exitosamente
									setCurrentStep( 1 );
									setSelectedDayModules([]);
									setAvailabilityResponse( null );

									router.push(`/sections?id=${section.id}`);
								}}
							/>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
