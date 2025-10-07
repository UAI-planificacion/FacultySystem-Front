'use client'

import { JSX, useState, useMemo, useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast }                       from "sonner";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
}                                       from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                                       from "@/components/ui/card";
import { Button }                       from "@/components/ui/button";
import { Label }                        from "@/components/ui/label";
import { Switch }                       from "@/components/ui/switch";
import { SessionDayModuleSelector }     from "@/components/session/session-day-module-selector";
import { ProfessorSelect }              from "@/components/shared/item-select/professor-select";
import { SpaceSelect }                  from "@/components/shared/item-select/space-select";
import { SessionName }                  from "@/components/session/session-name";
import { sessionLabels, sessionColors } from "@/components/section/section.config";

import { OfferSection }             from "@/types/offer-section.model";
import { Session }                  from "@/types/section.model";
import { fetchApi, Method }         from "@/services/fetch";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { tempoFormat }              from "@/lib/utils";


interface SessionDayModule {
	session         : Session;
	dayModuleId     : number;
	dayId           : number;
	moduleId        : number;
}


interface SessionConfig {
	session         : Session;
	dayModuleIds    : number[];
	spaceId         : string | null;
	professorId     : string | null;
	isEnglish       : boolean;
}


interface Props {
	section     : OfferSection | null;
	isOpen      : boolean;
	onClose     : () => void;
	onSuccess?  : () => void;
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


export function CreateSessionForm({ section, isOpen, onClose, onSuccess }: Props ): JSX.Element {
	// Estado para los dayModules seleccionados
	const [selectedDayModules, setSelectedDayModules] = useState<SessionDayModule[]>([]);

	// Estado para la sesión actualmente seleccionada para marcar
	const [currentSession, setCurrentSession] = useState<Session | null>( null );

	// Estado para espacios por sesión
	const [sessionSpaces, setSessionSpaces] = useState<Record<Session, string | null>>({
		[Session.C] : null,
		[Session.A] : null,
		[Session.T] : null,
		[Session.L] : null,
	});

	// Estado para profesores por sesión
	const [sessionProfessors, setSessionProfessors] = useState<Record<Session, string | null>>({
		[Session.C] : section?.professor?.id || null,
		[Session.A] : section?.professor?.id || null,
		[Session.T] : section?.professor?.id || null,
		[Session.L] : section?.professor?.id || null,
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
			const sessionKey = session as Session;
			const completed = completedSessions[sessionKey] || 0;
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


	// Manejar cambio de espacio por sesión
	const handleSpaceChange = useCallback(( session: Session, value: string | string[] | undefined ) => {
		const spaceId = typeof value === 'string' ? value : null;
		setSessionSpaces( prev => ({
			...prev,
			[session]: spaceId
		}));
	}, []);


	// Manejar cambio de profesor por sesión
	const handleProfessorChange = useCallback(( session: Session, value: string | string[] | undefined ) => {
		const professorId = typeof value === 'string' ? value : null;
		setSessionProfessors( prev => ({
			...prev,
			[session]: professorId
		}));
	}, []);


	// Manejar cambio de espacio global
	const handleGlobalSpaceChange = useCallback(( value: string | string[] | undefined ) => {
		const spaceId = typeof value === 'string' ? value : null;
		setGlobalSpaceId( spaceId );

		if ( useSameSpace ) {
			// Actualizar todos los espacios de sesión
			setSessionSpaces( prev => {
				const updated = { ...prev };
				Object.keys( sessionRequirements ).forEach( session => {
					updated[session as Session] = spaceId;
				});
				return updated;
			});
		}
	}, [ useSameSpace, sessionRequirements ]);


	// Manejar cambio de profesor global
	const handleGlobalProfessorChange = useCallback(( value: string | string[] | undefined ) => {
		const professorId = typeof value === 'string' ? value : null;
		setGlobalProfessorId( professorId );

		if ( useSameProfessor ) {
			// Actualizar todos los profesores de sesión
			setSessionProfessors( prev => {
				const updated = { ...prev };
				Object.keys( sessionRequirements ).forEach( session => {
					updated[session as Session] = professorId;
				});
				return updated;
			});
		}
	}, [ useSameProfessor, sessionRequirements ]);


	// Manejar toggle de "usar mismo espacio"
	const handleUseSameSpaceToggle = useCallback(( checked: boolean ) => {
		setUseSameSpace( checked );

		if ( checked && globalSpaceId ) {
			// Aplicar el espacio global a todas las sesiones
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

		if ( checked && globalProfessorId ) {
			// Aplicar el profesor global a todas las sesiones
			setSessionProfessors( prev => {
				const updated = { ...prev };
				Object.keys( sessionRequirements ).forEach( session => {
					updated[session as Session] = globalProfessorId;
				});
				return updated;
			});
		}
	}, [ globalProfessorId, sessionRequirements ]);


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


	// API para crear sesiones
	const createSessionsApi = async ( payload: SessionConfig[] ): Promise<OfferSection> =>
        fetchApi<OfferSection>({
            url     : `sessions/massive/${section!.id}`,
            method  : Method.POST,
            body    : payload
        })


	// Mutation para crear sesiones
	const createSessionsMutation = useMutation({
		mutationFn  : createSessionsApi,
		onSuccess   : () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECCTIONS] });
			toast( 'Sesiones creadas exitosamente', successToast );
			handleClose();
			onSuccess?.();
		},
		onError     : ( error: any ) => {
			toast( `Error al crear las sesiones: ${error.message}`, errorToast );
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

		// Crear payload agrupado por sesión
		const payload: SessionConfig[] = Object.entries( sessionRequirements )
			.filter(([ session, required ]) => required && required > 0 )
			.map(([ session ]) => {
				const sessionKey = session as Session;
				return {
					session         : sessionKey,
					dayModuleIds    : sessionGroups[sessionKey],
					spaceId         : useSameSpace ? globalSpaceId : sessionSpaces[sessionKey],
					professorId     : useSameProfessor ? globalProfessorId : sessionProfessors[sessionKey],
					isEnglish       : allInEnglish ? true : sessionInEnglish[sessionKey]
				};
			});

		console.log('🚀 ~ file: create-session-form.tsx:254 ~ payload:', payload)

		createSessionsMutation.mutate( payload );
	}, [ section, selectedDayModules, sessionSpaces, sessionProfessors, useSameSpace, globalSpaceId, useSameProfessor, globalProfessorId, sessionInEnglish, allInEnglish, sessionRequirements ]);


	// Manejar cierre del formulario
	const handleClose = useCallback(() => {
		setSelectedDayModules([]);
		setCurrentSession( null );
		setSessionSpaces({
			[Session.C] : null,
			[Session.A] : null,
			[Session.T] : null,
			[Session.L] : null,
		});
		setSessionProfessors({
			[Session.C] : section?.professor?.id || null,
			[Session.A] : section?.professor?.id || null,
			[Session.T] : section?.professor?.id || null,
			[Session.L] : section?.professor?.id || null,
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
		onClose();
	}, [ section, onClose ]);


	if ( !section ) return <></>;


	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						Crear Sesiones para Sección {section.subject.id}-{ section.code }
					</DialogTitle>

					<DialogDescription>
						Selecciona los horarios, salas y profesores para cada sesión
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Información de la sección */}
					<Card>
						{/* <CardHeader>
							<CardTitle className="text-base">Información de la Sección</CardTitle>
						</CardHeader> */}

						<CardContent className="mt-4">
							<div className="grid grid-cols-2 gap-2 text-sm">
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


					{/* Selector de dayModules */}
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

							{useSameSpace ? (
								<SpaceSelect
									label               = "Espacio Global"
									multiple            = { false }
									placeholder         = "Seleccionar espacio"
									defaultValues       = { globalSpaceId ? [globalSpaceId] : [] }
									onSelectionChange   = { handleGlobalSpaceChange }
								/>
							) : (
								<div className={`grid ${getResponsive(section)} gap-4`}>
									{Object.entries( sessionRequirements ).map(([ session, required ]) => {
										const sessionKey = session as Session;

										return (
											<div key={ sessionKey }>
												<SpaceSelect
													label               = {`Espacio para ${ sessionLabels[sessionKey] }`}
													multiple            = { false }
													placeholder         = "Seleccionar espacio"
													defaultValues       = { sessionSpaces[sessionKey] ? [sessionSpaces[sessionKey]!] : [] }
													onSelectionChange   = {( value ) => handleSpaceChange( sessionKey, value )}
												/>
											</div>
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
								label               = "Profesor Global"
								multiple            = { false }
								placeholder         = "Seleccionar profesor"
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
												label               = {`Profesor para ${ sessionLabels[sessionKey] }`}
												multiple            = { false }
												placeholder         = "Seleccionar profesor"
												defaultValues       = { sessionProfessors[sessionKey] ? [sessionProfessors[sessionKey]!] : [] }
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
							disabled    = { createSessionsMutation.isPending }
						>
							Cancelar
						</Button>

						<Button
							onClick     = { handleSubmit }
							disabled    = { !allSessionsComplete || createSessionsMutation.isPending }
						>
							{ createSessionsMutation.isPending ? 'Creando...' : 'Crear Sesiones' }
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
