'use client'

import { JSX, useState, useMemo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import {
    useMutation,
    useQuery,
    useQueryClient
}                   from "@tanstack/react-query";
import { Plus }     from "lucide-react";
import { toast }    from "sonner";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                                       from "@/components/ui/card";
import { Label }                        from "@/components/ui/label";
import { Switch }                       from "@/components/ui/switch";
import { SessionDayModuleSelector }     from "@/components/session/session-day-module-selector";
import { ProfessorSelect }              from "@/components/shared/item-select/professor-select";
import { SpaceSelect }                  from "@/components/shared/item-select/space-select";
import { HeadquartersSelect }           from "@/components/shared/item-select/headquarters-select";
import { SpaceFilterSelector, FilterMode } from "@/components/shared/space-filter-selector";
import { SessionName }                  from "@/components/session/session-name";
import { sessionLabels, sessionColors } from "@/components/section/section.config";
import { SessionInfoRequest }           from "@/components/session/session-info-request";
import { Button }                       from "@/components/ui/button";
import { PageLayout }                   from "@/components/layout";

import { OfferSection }                         from "@/types/offer-section.model";
import { Session }                              from "@/types/section.model";
import { Building, Size, SpaceType }            from "@/types/request-detail.model";
import { SessionAvailabilityRequest, SessionAvailabilityResponse } from "@/types/session-availability.model";
import { fetchApi, Method }                     from "@/services/fetch";
import { KEY_QUERYS }                           from "@/consts/key-queries";
import { errorToast, successToast }             from "@/config/toast/toast.config";
import { tempoFormat }                          from "@/lib/utils";


interface SessionDayModule {
	session         : Session;
	dayModuleId     : number;
	dayId           : number;
	moduleId        : number;
}


interface SessionConfig {
	session         : Session;
	dayModuleIds    : number[];
	spaceIds        : string[] | null;
	professorIds    : string[];
	isEnglish       : boolean;
	building        : Building | null;
	spaceType       : SpaceType | null;
	spaceSize       : Size | null;
}


function getResponsive( section : OfferSection | null ): string {
	if ( !section ) return 'grid-cols-1';

	let sessionCount = 0;

	if ( section.lecture > 0 )          sessionCount++;
	if ( section.tutoringSession > 0 )  sessionCount++;
	if ( section.workshop > 0 )         sessionCount++;
	if ( section.laboratory > 0 )       sessionCount++;

    return {
        1 : 'grid-cols-1',
        2 : 'grid-cols-1 md:grid-cols-2',
        3 : 'grid-cols-1 md:grid-cols-3',
        4 : 'grid-cols-1 md:grid-cols-4'
    }[sessionCount] || 'grid-cols-1';
}


export default function SectionDetailPage(): JSX.Element {
    const params    = useParams();
    const sectionId = params.sectionId as string;

    const {
        data: section,
        isLoading,
        isError
    }   = useQuery({
		queryKey: [ KEY_QUERYS.SECCTIONS, sectionId ],
		queryFn : () => fetchApi<OfferSection>({ url: `sections/${sectionId}` }),
	});

    const openNewGradeForm = () => {
        console.log('openNewGradeForm')
    }

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
	const [useSameSpace, setUseSameSpace] = useState( false );
	const [globalSpaceId, setGlobalSpaceId] = useState<string | null>( null );

	// Estado para "usar mismo profesor para todas las sesiones"
	const [useSameProfessor, setUseSameProfessor] = useState( false );
	const [globalProfessorId, setGlobalProfessorId] = useState<string | null>( section?.professor?.id || null );

	// Estado para inglés por sesión
	const [sessionInEnglish, setSessionInEnglish] = useState<Record<Session, boolean>>({
		[Session.C] : false,
		[Session.A] : false,
		[Session.T] : false,
		[Session.L] : false,
	});

	// Estado para "todas las sesiones en inglés"
	const [allInEnglish, setAllInEnglish] = useState( false );

	const queryClient = useQueryClient();


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

		Object.entries( sessionRequirements ).forEach(([ session, required ]) => {
			const sessionKey = session as Session;
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
	const handleGlobalSpaceChange = useCallback(( value: string | string[] | undefined ) => {
		const spaceIds = Array.isArray( value ) ? value : ( value ? [value] : [] );
		setGlobalSpaceId( spaceIds.length > 0 ? spaceIds[0] : null ); // Mantener compatibilidad con estado global

		if ( useSameSpace ) {
			// Actualizar todos los espacios de sesión
			setSessionSpaces( prev => {
				const updated = { ...prev };
				Object.keys( sessionRequirements ).forEach( session => {
					updated[session as Session] = spaceIds;
				});
				return updated;
			});
		}
	}, [ useSameSpace, sessionRequirements ]);


	// Manejar cambio de profesor global (múltiples)
	const handleGlobalProfessorChange = useCallback(( value: string | string[] | undefined ) => {
		const professorIds = Array.isArray( value ) ? value : ( value ? [value] : [] );
		setGlobalProfessorId( professorIds.length > 0 ? professorIds[0] : null ); // Mantener compatibilidad con estado global

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

		if ( checked && globalSpaceId ) {
			// Aplicar el edificio global a todas las sesiones
			setSessionBuildings( prev => {
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

		if ( checked && globalProfessorId ) {
			// Aplicar el profesor global a todas las sesiones
			setSessionProfessors( prev => {
				const updated = { ...prev };
				Object.keys( sessionRequirements ).forEach( session => {
					updated[session as Session] = [globalProfessorId];
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
			console.log('✅ Respuesta del servicio de disponibilidad:', response);
			// TODO: Aquí se procesará la respuesta para mostrar espacios y profesores disponibles
			toast( 'Disponibilidad calculada exitosamente', successToast );
		},
		onError     : ( error: any ) => {
			console.error('❌ Error al calcular disponibilidad:', error);
			toast( `Error al calcular disponibilidad: ${error.message}`, errorToast );
		}
	});


	// Manejar envío del formulario
	const handleSubmit = useCallback(() => {
		if ( !section ) return;

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

		// Crear payload agrupado por sesión con la nueva estructura
		const payload: SessionAvailabilityRequest[] = Object.entries( sessionRequirements )
			.filter(([ _, required ]) => required && required > 0 )
			.map(([ session ]) => {
				const sessionKey = session as Session;
				const spaceIds = useSameSpace ? ( globalSpaceId ? [globalSpaceId] : [] ) : sessionSpaces[sessionKey];
				const professorIds = useSameProfessor ? ( globalProfessorId ? [globalProfessorId] : [] ) : sessionProfessors[sessionKey];

                return {
					session         : sessionKey,
					dayModuleIds    : sessionGroups[sessionKey],
					spaceIds        : spaceIds.length > 0 ? spaceIds : null,
					professorIds    : professorIds,
					isEnglish       : allInEnglish ? true : sessionInEnglish[sessionKey],
					building        : spaceIds.length === 0 ? ( sessionBuildings[sessionKey] as Building | null ) : null,
					spaceType       : spaceIds.length === 0 ? ( sessionSpaceTypes[sessionKey] as SpaceType | null ) : null,
					spaceSize       : spaceIds.length === 0 ? ( sessionSpaceSizes[sessionKey] as Size | null ) : null,
				};
			});

		console.log('📤 Payload enviado al servicio de disponibilidad:', payload);

		calculateAvailabilityMutation.mutate( payload );
	}, [ 
		section, 
		selectedDayModules, 
		sessionSpaces, 
		sessionProfessors, 
		sessionBuildings,
		sessionSpaceTypes,
		sessionSpaceSizes,
		useSameSpace, 
		globalSpaceId, 
		useSameProfessor, 
		globalProfessorId, 
		sessionInEnglish, 
		allInEnglish, 
		sessionRequirements 
	]);


	// Manejar cierre del formulario
	const handleClose = useCallback(() => {
		setSelectedDayModules([]);

        setCurrentSession( null );

        setSessionSpaces({
			[Session.C] : [],
			[Session.A] : [],
			[Session.T] : [],
			[Session.L] : [],
		});

        setSessionProfessors({
			[Session.C] : section?.professor?.id ? [section.professor.id] : [],
			[Session.A] : section?.professor?.id ? [section.professor.id] : [],
			[Session.T] : section?.professor?.id ? [section.professor.id] : [],
			[Session.L] : section?.professor?.id ? [section.professor.id] : [],
		});

		setSessionBuildings({
			[Session.C] : null,
			[Session.A] : null,
			[Session.T] : null,
			[Session.L] : null,
		});

		setSessionSpaceTypes({
			[Session.C] : null,
			[Session.A] : null,
			[Session.T] : null,
			[Session.L] : null,
		});

		setSessionSpaceSizes({
			[Session.C] : null,
			[Session.A] : null,
			[Session.T] : null,
			[Session.L] : null,
		});

		setSessionFilterModes({
			[Session.C] : 'type-size',
			[Session.A] : 'type-size',
			[Session.T] : 'type-size',
			[Session.L] : 'type-size',
		});

        setUseSameSpace( false );
		setGlobalSpaceId( null );
		setUseSameProfessor( false );
		setGlobalProfessorId( section?.professor?.id || null );

        setSessionInEnglish({
			[Session.C] : false,
			[Session.A] : false,
			[Session.T] : false,
			[Session.L] : false,
		});

        setAllInEnglish( false );
	}, [ section ]);


	if ( !section ) return <></>;


    return (
        <PageLayout 
			title   = {`Planificación de sección ${section.subject.id}-${section.code}`}
			// actions = {
			// 	<Button onClick={ openNewGradeForm }>
			// 		<Plus className="mr-2 h-4 w-4" />

			// 		Crear Grado
			// 	</Button>
			// }
		>
            <div className="space-y-4">
                {/* Información de la sección */}
                <Card>
                    {/* <CardHeader>
                        <CardTitle className="text-base">Información de la Sección</CardTitle>
                    </CardHeader> */}

                    <CardContent className="mt-4">
                        <div className="grid grid-cols-4 gap-2 text-sm">
                            <div>
                                <Label className="text-xs text-muted-foreground">Asignatura</Label>

                                <p className="font-medium">{ section.subject.id } - { section.subject.name }</p>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Período</Label>

                                <p className="font-medium">{ section.period.id } - { section.period.name } { tempoFormat( section.startDate )} - { tempoFormat( section.endDate )}</p>
                            </div>

                            { section.professor && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Profesor por Defecto</Label>

                                    <p className="font-medium">{ section.professor.id } - { section.professor.name }</p>
                                </div>
                            )}

                            <div>
                                <Label className="text-xs text-muted-foreground">Sesiones Requeridas</Label>

                                <div className="flex gap-2 mt-1">
                                    {Object.entries( sessionRequirements ).map(([ session, count ]) => (
                                        <SessionName
                                            key     = { session }
                                            session = { session as Session }
                                            count   = { count }
                                            isShort = { true }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <SessionInfoRequest
                        section = { section }
                        enabled = { !!section }
                    />

                    {/* Selector de dayModules */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="space-y-2">
                                {/* <CardTitle className="text-base">Seleccionar Sesiones</CardTitle> */}

                                <div className="flex flex-wrap gap-2">
                                    {Object.entries( sessionRequirements ).map(([ session, required ]) => {
                                        const sessionKey    = session as Session;
                                        const completed     = completedSessions[sessionKey] || 0;
                                        const isComplete    = completed === required;
                                        const isCurrent     = currentSession === sessionKey;

                                        return (
                                            <Button
                                                key         = { sessionKey }
                                                variant     = { isCurrent ? "default" : "outline" }
                                                size        = "sm"
                                                onClick     = {() => setCurrentSession( sessionKey )}
                                                className   = {`${ isCurrent ? sessionColors[sessionKey] + ' text-white hover:' + sessionColors[sessionKey] : '' }`}
                                            >
                                                { sessionLabels[sessionKey] } ({ completed }/{ required })
                                                { isComplete && " ✓" }
                                            </Button>
                                        );
                                    })}
                                </div>
                            </CardHeader>

                            <CardContent>
                                <SessionDayModuleSelector
                                    selectedSessions    = { selectedDayModules }
                                    onToggleDayModule   = { handleToggleDayModule }
                                    currentSession      = { currentSession }
                                    availableSessions   = { Object.keys( sessionRequirements ) as Session[] }
                                    enabled             = { true }
                                />
                            </CardContent>
                        </Card>

                        {/* Configuración de espacios */}
                        <Card>
                            {/* <CardHeader>
                                <CardTitle className="text-base flex gap-2 items-center">
                                    <Bolt className="h-4 w-4" />
                                    Configuración
                                </CardTitle>
                            </CardHeader> */}

                            <CardContent className="space-y-4 mt-4">
                                {/* Switch para usar mismo espacio para todas las sesiones */}
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id          = "use-same-space"
                                        checked     = { useSameSpace }
                                        onCheckedChange = { handleUseSameSpaceToggle }
                                    />

                                    <Label htmlFor="use-same-space" className="cursor-pointer text-sm">
                                        Usar el mismo espacio para todas las sesiones
                                    </Label>
                                </div>

                                {/* Configuración de espacios */}
                                {useSameSpace ? (
                                    <div className="space-y-3">
                                        {/* Edificio Global */}
                                        <HeadquartersSelect
                                            label               = "Edificio Global"
                                            multiple            = { false }
                                            placeholder         = "Seleccionar edificio"
                                            defaultValues       = { globalSpaceId || undefined }
                                            onSelectionChange   = {( value ) => {
                                                const buildingId = typeof value === 'string' ? value : null;
                                                setGlobalSpaceId( buildingId );
                                            }}
                                        />

                                        {/* Filtros de espacio globales */}
                                        { globalSpaceId && (
                                            <SpaceFilterSelector
                                                buildingId          = { globalSpaceId }
                                                filterMode          = { sessionFilterModes[Session.C] }
                                                spaceId             = { sessionSpaces[Session.C].length > 0 ? sessionSpaces[Session.C][0] : null }
                                                spaceType           = { sessionSpaceTypes[Session.C] }
                                                spaceSizeId         = { sessionSpaceSizes[Session.C] }
                                                onFilterModeChange  = {( mode ) => {
                                                    // Aplicar a todas las sesiones
                                                    Object.keys( sessionRequirements ).forEach( session => {
                                                        handleFilterModeChange( session as Session, mode );
                                                    });
                                                }}
                                                onSpaceIdChange     = {( spaceId ) => {
                                                    const spaceIds = spaceId ? [spaceId] : [];
                                                    // Aplicar a todas las sesiones
                                                    Object.keys( sessionRequirements ).forEach( session => {
                                                        handleSpaceChange( session as Session, spaceIds );
                                                    });
                                                }}
                                                onSpaceTypeChange   = {( spaceType ) => {
                                                    // Aplicar a todas las sesiones
                                                    Object.keys( sessionRequirements ).forEach( session => {
                                                        handleSpaceTypeChange( session as Session, spaceType );
                                                    });
                                                }}
                                                onSpaceSizeIdChange = {( spaceSizeId ) => {
                                                    // Aplicar a todas las sesiones
                                                    Object.keys( sessionRequirements ).forEach( session => {
                                                        handleSpaceSizeChange( session as Session, spaceSizeId );
                                                    });
                                                }}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium">Configuración de espacios por sesión</Label>
                                        
                                        {Object.entries( sessionRequirements ).map(([ session, required ]) => {
                                            const sessionKey = session as Session;

                                            return (
                                                <Card key={ sessionKey } className="p-4">
                                                    <Label className="text-sm font-semibold mb-3 block">
                                                        { sessionLabels[sessionKey] }
                                                    </Label>

                                                    <div className="space-y-3">
                                                        {/* Edificio */}
                                                        <HeadquartersSelect
                                                            label               = "Edificio"
                                                            multiple            = { false }
                                                            placeholder         = "Seleccionar edificio"
                                                            defaultValues       = { sessionBuildings[sessionKey] || undefined }
                                                            onSelectionChange   = {( value ) => {
                                                                const buildingId = typeof value === 'string' ? value : null;
                                                                handleBuildingChange( sessionKey, buildingId );
                                                            }}
                                                        />

                                                        {/* Filtros de espacio */}
                                                        { sessionBuildings[sessionKey] && (
                                                            <SpaceFilterSelector
                                                                buildingId          = { sessionBuildings[sessionKey] }
                                                                filterMode          = { sessionFilterModes[sessionKey] }
                                                                spaceId             = { sessionSpaces[sessionKey].length > 0 ? sessionSpaces[sessionKey][0] : null }
                                                                spaceType           = { sessionSpaceTypes[sessionKey] }
                                                                spaceSizeId         = { sessionSpaceSizes[sessionKey] }
                                                                onFilterModeChange  = {( mode ) => handleFilterModeChange( sessionKey, mode )}
                                                                onSpaceIdChange     = {( spaceId ) => {
                                                                    const spaceIds = spaceId ? [spaceId] : [];
                                                                    handleSpaceChange( sessionKey, spaceIds );
                                                                }}
                                                                onSpaceTypeChange   = {( spaceType ) => handleSpaceTypeChange( sessionKey, spaceType )}
                                                                onSpaceSizeIdChange = {( spaceSizeId ) => handleSpaceSizeChange( sessionKey, spaceSizeId )}
                                                            />
                                                        )}
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}

                            {/* Configuración de profesores */}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id          = "use-same-professor"
                                    checked     = { useSameProfessor }
                                    onCheckedChange = { handleUseSameProfessorToggle }
                                />

                                <Label htmlFor="use-same-professor" className="cursor-pointer text-sm">
                                    Usar el mismo profesor para todas las sesiones
                                </Label>
                            </div>

                            {useSameProfessor ? (
                                <ProfessorSelect
                                    label               = "Profesores Globales"
                                    multiple            = { true }
                                    placeholder         = "Seleccionar profesores"
                                    defaultValues       = { globalProfessorId ? [globalProfessorId] : [] }
                                    onSelectionChange   = { handleGlobalProfessorChange }
                                />
                            ) : (
                                <div className={`grid ${getResponsive(section)} gap-4`}>
                                    {Object.entries( sessionRequirements ).map(([ session, required ]) => {
                                        const sessionKey = session as Session;

                                        return (
                                            <div key={ sessionKey }>
                                                <ProfessorSelect
                                                    label               = {`Profesores para ${ sessionLabels[sessionKey] }`}
                                                    multiple            = { true }
                                                    placeholder         = "Seleccionar profesores"
                                                    defaultValues       = { sessionProfessors[sessionKey] }
                                                    onSelectionChange   = {( value ) => handleProfessorChange( sessionKey, value )}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Configuración de inglés */}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id          = "all-in-english"
                                    checked     = { allInEnglish }
                                    onCheckedChange = { handleAllInEnglishToggle }
                                />

                                <Label htmlFor="all-in-english" className="cursor-pointer text-sm">
                                    Todas las sesiones en inglés
                                </Label>
                            </div>

                            {!allInEnglish && (
                                <div className={`grid ${getResponsive(section)} gap-4`}>
                                    {Object.entries( sessionRequirements ).map(([ session, required ]) => {
                                        const sessionKey = session as Session;

                                        return (
                                            <div key={ sessionKey } className="flex items-center space-x-2">
                                                <Switch
                                                    id          = {`in-english-${sessionKey}`}
                                                    checked     = { sessionInEnglish[sessionKey] }
                                                    onCheckedChange = {( checked ) => handleInEnglishChange( sessionKey, checked )}
                                                />

                                                <Label htmlFor={`in-english-${sessionKey}`} className="cursor-pointer text-sm">
                                                    { sessionLabels[sessionKey] } en inglés
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            </CardContent>
                        </Card>

                        {/* Mensaje de validación */}
                        {!allSessionsComplete && (
                            <p className="text-sm text-amber-600 text-center">
                                ⚠ Debes completar todas las sesiones requeridas antes de enviar el formulario
                            </p>
                        )}

                        {/* Botones de acción */}
                        <div className="flex justify-end gap-4">
                            <Button
                                variant     = "outline"
                                onClick     = { handleClose }
                                disabled    = { calculateAvailabilityMutation.isPending }
                            >
                                Cancelar
                            </Button>

                            <Button
                                onClick     = { handleSubmit }
                                disabled    = { !allSessionsComplete || calculateAvailabilityMutation.isPending }
                            >
                                { calculateAvailabilityMutation.isPending ? 'Calculando...' : 'Calcular Disponibilidad' }
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
		</PageLayout>
    );
}
