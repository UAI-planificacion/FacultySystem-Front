"use client"

import { JSX, useEffect, useState, useMemo, useCallback } from "react"

import {
	useMutation,
	useQuery,
	useQueryClient
}                       from "@tanstack/react-query";
import { toast }        from "sonner";
import {
	BadgeCheck,
	CircleDashed,
	Eye,
	OctagonX
}                       from "lucide-react";
import { z }            from "zod";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
}                                   from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
}                                   from "@/components/ui/form";
import {
	ToggleGroup,
	ToggleGroupItem,
}                                   from "@/components/ui/toggle-group"
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
}                                   from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
}                                   from "@/components/ui/card";
import { Input }                    from "@/components/ui/input";
import { Button }                   from "@/components/ui/button";
import { ShowDateAt }               from "@/components/shared/date-at";
import { CommentSection }           from "@/components/comment/comment-section";
import { Switch }                   from "@/components/ui/switch";
import { Textarea }                 from "@/components/ui/textarea";
import { Label }                    from "@/components/ui/label";
import { SectionSelect }            from "@/components/shared/item-select/section-select";
import { SessionDayModuleSelector } from "@/components/session/session-day-module-selector";
import { ProfessorSelect }          from "@/components/shared/item-select/professor-select";
import { SpaceSelect }              from "@/components/shared/item-select/space-select";
import { SessionName }              from "@/components/session/session-name";

import {
	CreateRequest,
	Request,
	Status,
	UpdateRequest
}                                   from "@/types/request";
import { OfferSection }             from "@/types/offer-section.model";
import { Session }                  from "@/types/section.model";
import { RequestSessionCreate }     from "@/types/request-session.model";
import { SpaceType }                from "@/types/request-detail.model";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { cn }                       from "@/lib/utils";
import LoaderMini                   from "@/icons/LoaderMini";
import { useSession }               from "@/hooks/use-session";
import { updateFacultyTotal }       from "@/app/faculties/page";
import { useSizes }                 from "@/hooks/use-sizes";


export type RequestFormValues = z.infer<typeof formSchema>;


interface SessionDayModule {
	session         : Session;
	dayModuleId     : number;
	dayId           : number;
	moduleId        : number;
}


interface CreateRequestWithSessions extends CreateRequest {
	requestSessions : RequestSessionCreate[];
}


interface Props {
	isOpen      : boolean;
	onClose     : () => void;
	onSuccess?  : () => void;
	request     : Request | null;
	facultyId   : string;
	section?    : OfferSection | null;
}


const formSchema = z.object({
	title: z.string({
		required_error: "El título es obligatorio",
		invalid_type_error: "El título debe ser un texto"
	}).min(1, { message: "El título no puede estar vacío" })
	.max(100, { message: "El título no puede tener más de 100 caracteres" }),
	status: z.nativeEnum(Status, {
		required_error: "Debe seleccionar un estado",
		invalid_type_error: "Estado no válido"
	}),
	sectionId: z.string({
		required_error: "Debe seleccionar una sección",
		invalid_type_error: "La sección debe ser un texto"
	}).min(1, { message: "Debe seleccionar una sección" }),
	description: z.string()
		.max(500, { message: "La descripción no puede tener más de 500 caracteres" })
		.nullable()
		.transform(val => val === "" ? null : val),
})


const defaultRequest = ( data : Request | null, sectionId? : string ) => ({
	title           : data?.title           || '',
	status          : data?.status          || Status.PENDING,
	sectionId       : data?.section?.id     || sectionId || '',
	description     : data?.description     || '',
});


type Tab = 'form' | 'comments';


const sessionLabels: Record<Session, string> = {
	[Session.C] : 'Cátedra',
	[Session.A] : 'Ayudantía',
	[Session.T] : 'Taller',
	[Session.L] : 'Laboratorio',
};


const sessionColors: Record<Session, string> = {
	[Session.C] : 'bg-blue-500',
	[Session.A] : 'bg-green-500',
	[Session.T] : 'bg-orange-500',
	[Session.L] : 'bg-purple-500',
};


export function RequestForm({
	isOpen,
	onClose,
	onSuccess,
	request,
	facultyId,
	section : propSection
}: Props ): JSX.Element {
	const queryClient   = useQueryClient();
	const [tab, setTab] = useState<Tab>( 'form' );
	const { staff }     = useSession();
	const { data : sizes } = useSizes();

	// Estado para la sección seleccionada
	const [selectedSectionId, setSelectedSectionId] = useState<string | null>( propSection?.id || request?.section?.id || null );

	// Estado para los dayModules seleccionados por sesión
	const [sessionDayModules, setSessionDayModules] = useState<Record<Session, SessionDayModule[]>>({
		[Session.C] : [],
		[Session.A] : [],
		[Session.T] : [],
		[Session.L] : [],
	});

	// Estado para la sesión actualmente seleccionada en el selector
	const [currentSession, setCurrentSession] = useState<Session | null>( null );

	// Estado para configuración de cada sesión
	const [sessionConfigs, setSessionConfigs] = useState<Record<Session, Partial<RequestSessionCreate>>>({
		[Session.C] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
		[Session.A] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
		[Session.T] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
		[Session.L] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
	});


	// Obtener la sección seleccionada
	const { data : selectedSection } = useQuery({
		queryKey    : [ KEY_QUERYS.SECCTIONS, 'not-planning', selectedSectionId ],
		queryFn     : () => fetchApi<OfferSection>({ url: `sections/${selectedSectionId}` }),
		enabled     : !!selectedSectionId && !propSection
	});


	const section = propSection || selectedSection;


	// Calcular sesiones disponibles basado en la sección
	const availableSessions = useMemo(() => {
		if ( !section ) return [];

		const sessions: Session[] = [];

		if ( section.lecture > 0 )          sessions.push( Session.C );
		if ( section.tutoringSession > 0 )  sessions.push( Session.A );
		if ( section.workshop > 0 )         sessions.push( Session.T );
		if ( section.laboratory > 0 )       sessions.push( Session.L );

		return sessions;
	}, [ section ]);


	// Manejar toggle de dayModule
	const handleToggleDayModule = useCallback(( session: Session, dayId: number, moduleId: number, dayModuleId: number ) => {
		setSessionDayModules( prev => {
			const sessionModules = prev[session];
			const existingIndex = sessionModules.findIndex( dm => dm.dayId === dayId && dm.moduleId === moduleId );

			if ( existingIndex >= 0 ) {
				// Remover
				return {
					...prev,
					[session]: sessionModules.filter(( _, index ) => index !== existingIndex )
				};
			} else {
				// Agregar
				return {
					...prev,
					[session]: [...sessionModules, {
						session,
						dayModuleId,
						dayId,
						moduleId
					}]
				};
			}
		});
	}, []);


	// Manejar cambio de configuración de sesión
	const handleSessionConfigChange = useCallback(( session: Session, key: keyof RequestSessionCreate, value: any ) => {
		setSessionConfigs( prev => ({
			...prev,
			[session]: {
				...prev[session],
				[key]: value
			}
		}));
	}, []);


	// API para crear request con sessions
	const createRequestWithSessionsApi = async ( payload: CreateRequestWithSessions ): Promise<Request> =>
		fetchApi<Request>({
			url     : 'requests',
			method  : Method.POST,
			body    : payload
		});


	// API para actualizar request
	const updateRequestApi = async ( updatedRequest: UpdateRequest ): Promise<Request> =>
		fetchApi<Request>({
			url     : `requests/${updatedRequest.id}`,
			method  : Method.PATCH,
			body    : updatedRequest
		});


	// Mutation para crear request
	const createRequestMutation = useMutation<Request, Error, CreateRequestWithSessions>({
		mutationFn  : createRequestWithSessionsApi,
		onSuccess   : () => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUESTS ]});
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.SECCTIONS ]});
			updateFacultyTotal( queryClient, facultyId, true, 'totalRequests' );
			handleClose();
			toast( 'Solicitud creada exitosamente', successToast );
			onSuccess?.();
		},
		onError     : ( mutationError ) => toast( `Error al crear solicitud: ${mutationError.message}`, errorToast )
	});


	// Mutation para actualizar request
	const updateRequestMutation = useMutation<Request, Error, UpdateRequest>({
		mutationFn  : updateRequestApi,
		onSuccess   : () => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUESTS ]});
			handleClose();
			toast( 'Solicitud actualizada exitosamente', successToast );
			onSuccess?.();
		},
		onError     : ( mutationError ) => toast( `Error al actualizar la solicitud: ${mutationError.message}`, errorToast )
	});


	const form = useForm<RequestFormValues>({
		resolver        : zodResolver( formSchema ),
		defaultValues   : defaultRequest( request, propSection?.id )
	});


	// Resetear form cuando cambia request o isOpen
	useEffect(() => {
		form.reset( defaultRequest( request, propSection?.id ));
		setTab( 'form' );
		setSelectedSectionId( propSection?.id || request?.section?.id || null );
	}, [request, isOpen, propSection]);


	// Manejar envío del formulario
	function handleSubmit( data: RequestFormValues ): void {
		console.log( "🚀 ~ file: request-form.tsx ~ data:", data )

		if ( !staff ) {
			toast( 'Por favor, inicie sesión para crear una solicitud', errorToast );
			return;
		}

		if ( request ) {
			// Actualizar request existente
			updateRequestMutation.mutate({
				...data,
				id              : request.id,
				staffUpdateId   : staff.id,
			});
		} else {
			// Crear nueva request con sessions
			// Construir request sessions
			const requestSessions: RequestSessionCreate[] = availableSessions.map( session => {
				const dayModuleIds = sessionDayModules[session].map( dm => dm.dayModuleId );
				const config = sessionConfigs[session];

				return {
					session         : session,
					description     : config.description || null,
					isEnglish       : config.isEnglish || false,
					isConsecutive   : config.isConsecutive || false,
					inAfternoon     : config.inAfternoon || false,
					spaceSizeId     : config.spaceSizeId || null,
					spaceType       : config.spaceType || null,
					professorId     : config.professorId || null,
					staffCreate     : staff,
					spaceId         : config.spaceId || null,
					dayModulesId    : dayModuleIds,
				};
			});

			// Validar que todas las sesiones tengan al menos un dayModule
			const invalidSessions = availableSessions.filter( session =>
				sessionDayModules[session].length === 0
			);

			if ( invalidSessions.length > 0 ) {
				toast(
					`Debe seleccionar al menos un horario para: ${invalidSessions.map( s => sessionLabels[s] ).join( ', ' )}`,
					errorToast
				);
				return;
			}

			createRequestMutation.mutate({
				...data,
				staffCreateId   : staff.id,
				requestSessions
			});
		}
	}


	// Manejar cierre del formulario
	const handleClose = useCallback(() => {
		setSessionDayModules({
			[Session.C] : [],
			[Session.A] : [],
			[Session.T] : [],
			[Session.L] : [],
		});
		setCurrentSession( null );
		setSessionConfigs({
			[Session.C] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
			[Session.A] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
			[Session.T] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
			[Session.L] : { isEnglish : false, isConsecutive : false, inAfternoon : false },
		});
		setSelectedSectionId( null );
		onClose();
	}, [ onClose ]);


	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="space-y-1">
						<DialogTitle>
							{ request ? 'Editar' : 'Crear' } Solicitud
						</DialogTitle>

						<DialogDescription>
							{ request
								? "Realice los cambios necesarios en la solicitud"
								: "Complete los campos obligatorios para crear una solicitud"
							}
						</DialogDescription>
					</div>
				</DialogHeader>

				<Tabs
					defaultValue    = { tab }
					onValueChange   = {( value ) => setTab( value as Tab )}
					className       = "w-full"
				>
					{ request &&
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="form">
								Información
							</TabsTrigger>

							<TabsTrigger value="comments">
								Comentarios
							</TabsTrigger>
						</TabsList>
					}

					<TabsContent
						value       = "form"
						className   = { cn( "space-y-4", request ? "mt-4": "" )}
					>
						<Form {...form}>
							<form onSubmit={ form.handleSubmit( handleSubmit )} className="space-y-4">
								<div className="grid grid-cols-1 gap-4">
									{/* Title */}
									<FormField
										control = { form.control }
										name    = "title"
										render  = {({ field }) => (
											<FormItem>
												<FormLabel>Título</FormLabel>

												<FormControl>
													<Input
														placeholder="Ingrese el título de la solicitud"
														{...field}
													/>
												</FormControl>

												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Section Select */}
									<FormField
										control = { form.control }
										name    = "sectionId"
										render  = {({ field }) => (
											<FormItem>
												<SectionSelect
													label               = "Sección"
													multiple            = { false }
													placeholder         = "Seleccionar sección"
													defaultValues       = { field.value }
													onSelectionChange   = {( value ) => {
														const sectionId = typeof value === 'string' ? value : undefined;
														field.onChange( sectionId );
														setSelectedSectionId( sectionId || null );
													}}
													disabled            = { !!propSection || !!request }
												/>

												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Status */}
									{ request &&
										<FormField
											control = { form.control }
											name    = "status"
											render  = {({ field }) => (
												<FormItem>
													<FormLabel>Estado</FormLabel>

													<FormControl>
														<ToggleGroup
															type            = "single"
															value           = { field.value }
															onValueChange   = {( value: Status ) => {
																if ( value ) field.onChange( value )
															}}
															className       = "w-full"
															defaultValue    = { field.value }
														>
															<ToggleGroupItem
																value       = "PENDING"
																aria-label  = "Pendiente"
																className   = "flex-1 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none border-t border-l border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-amber-400 data-[state=on]:dark:bg-amber-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-amber-500 data-[state=on]:dark:hover:bg-amber-600"
															>
																<CircleDashed className="mr-2 h-4 w-4"/>
																Pendiente
															</ToggleGroupItem>

															<ToggleGroupItem
																value       = "REVIEWING"
																aria-label  = "Revisando"
																className   = "flex-1 rounded-none border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-blue-400 data-[state=on]:dark:bg-blue-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-blue-500 data-[state=on]:dark:hover:bg-blue-600"
															>
																<Eye className="mr-2 h-4 w-4"/>
																Revisando
															</ToggleGroupItem>

															<ToggleGroupItem
																value       = "APPROVED"
																aria-label  = "Aprobado"
																className   = "flex-1 rounded-none border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-green-400 data-[state=on]:dark:bg-green-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-green-500 data-[state=on]:dark:hover:bg-green-600"
															>
																<BadgeCheck className="mr-2 h-4 w-4"/>
																Aprobado
															</ToggleGroupItem>

															<ToggleGroupItem
																value       = "REJECTED"
																aria-label  = "Rechazado"
																className   = "flex-1 rounded-tl-none rounded-bl-none rounded-tr-lg rounded-br-lg border-t border-r border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-red-400 data-[state=on]:dark:bg-red-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-red-500 data-[state=on]:dark:hover:bg-red-600"
															>
																<OctagonX className="mr-2 h-4 w-4"/>
																Rechazado
															</ToggleGroupItem>
														</ToggleGroup>
													</FormControl>

													<FormMessage />
												</FormItem>
											)}
										/>
									}

									{/* Description */}
									<FormField
										control = { form.control }
										name    = "description"
										render  = {({ field }) => (
											<FormItem>
												<FormLabel>Descripción</FormLabel>

												<FormControl>
													<Textarea
														placeholder = "Agregue una descripción (opcional)"
														className   = "min-h-[100px] max-h-[200px]"
														{...field}
														value       = { field.value || '' }
													/>
												</FormControl>

												<FormDescription className="text-xs flex justify-end">
													{field.value?.length || 0} / 500
												</FormDescription>

												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Request Sessions - Solo para creación */}
									{ !request && section && availableSessions.length > 0 && (
										<Card>
											<CardHeader>
												<CardTitle className="text-base">Configurar Sesiones</CardTitle>
											</CardHeader>

											<CardContent className="space-y-4">
												{/* Selector de sesión actual para marcar */}
												<div className="space-y-2">
													<Label>Seleccionar sesión para marcar horarios</Label>

													<div className="flex flex-wrap gap-2">
														{availableSessions.map( session => {
															const isCurrent = currentSession === session;
															const count = sessionDayModules[session].length;

															return (
																<Button
																	key         = { session }
																	variant     = { isCurrent ? "default" : "outline" }
																	size        = "sm"
																	onClick     = {() => setCurrentSession( session )}
																	className   = {`${ isCurrent ? sessionColors[session] + ' text-white hover:' + sessionColors[session] : '' }`}
																>
																	{ sessionLabels[session] } ({ count })
																</Button>
															);
														})}
													</div>
												</div>

												{/* Tabla única compartida */}
												<div>
													<SessionDayModuleSelector
														selectedSessions    = { Object.values( sessionDayModules ).flat() }
														onToggleDayModule   = { handleToggleDayModule }
														currentSession      = { currentSession }
														availableSessions   = { availableSessions }
														enabled             = { true }
													/>
												</div>

												{/* Tabs para configuración individual de cada sesión */}
												<Tabs defaultValue={ availableSessions[0] } className="w-full">
													<TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableSessions.length}, 1fr)` }}>
														{availableSessions.map( session => (
															<TabsTrigger
																key     = { session }
																value   = { session }
															>
																{ sessionLabels[session] }
															</TabsTrigger>
														))}
													</TabsList>

													{availableSessions.map( session => (
														<TabsContent key={ session } value={ session } className="space-y-4 mt-4">
															{/* Configuración de la sesión */}
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																{/* Profesor */}
																<ProfessorSelect
																	label               = "Profesor"
																	multiple            = { false }
																	placeholder         = "Seleccionar profesor"
																	defaultValues       = { sessionConfigs[session].professorId || undefined }
																	onSelectionChange   = {( value ) => {
																		const professorId = typeof value === 'string' ? value : null;
																		handleSessionConfigChange( session, 'professorId', professorId );
																	}}
																/>

																{/* Espacio */}
																<SpaceSelect
																	label               = "Espacio"
																	multiple            = { false }
																	placeholder         = "Seleccionar espacio"
																	defaultValues       = { sessionConfigs[session].spaceId || undefined }
																	onSelectionChange   = {( value ) => {
																		const spaceId = typeof value === 'string' ? value : null;
																		handleSessionConfigChange( session, 'spaceId', spaceId );
																	}}
																/>
															</div>

															{/* Switches */}
															<div className="space-y-3">
																<div className="flex items-center justify-between rounded-lg border p-3">
																	<Label htmlFor={`isEnglish-${session}`} className="cursor-pointer">
																		En inglés
																	</Label>

																	<Switch
																		id              = {`isEnglish-${session}`}
																		checked         = { sessionConfigs[session].isEnglish || false }
																		onCheckedChange = {( checked ) => handleSessionConfigChange( session, 'isEnglish', checked )}
																	/>
																</div>

																<div className="flex items-center justify-between rounded-lg border p-3">
																	<Label htmlFor={`isConsecutive-${session}`} className="cursor-pointer">
																		Consecutivo
																	</Label>

																	<Switch
																		id              = {`isConsecutive-${session}`}
																		checked         = { sessionConfigs[session].isConsecutive || false }
																		onCheckedChange = {( checked ) => handleSessionConfigChange( session, 'isConsecutive', checked )}
																	/>
																</div>

																<div className="flex items-center justify-between rounded-lg border p-3">
																	<Label htmlFor={`inAfternoon-${session}`} className="cursor-pointer">
																		En la tarde
																	</Label>

																	<Switch
																		id              = {`inAfternoon-${session}`}
																		checked         = { sessionConfigs[session].inAfternoon || false }
																		onCheckedChange = {( checked ) => handleSessionConfigChange( session, 'inAfternoon', checked )}
																	/>
																</div>
															</div>

															{/* Descripción de la sesión */}
															<div>
																<Label htmlFor={`description-${session}`}>Descripción de la sesión</Label>

																<Textarea
																	id          = {`description-${session}`}
																	placeholder = "Descripción opcional"
																	className   = "mt-2"
																	value       = { sessionConfigs[session].description || '' }
																	onChange    = {( e ) => handleSessionConfigChange( session, 'description', e.target.value )}
																/>
															</div>
														</TabsContent>
													))}
												</Tabs>
											</CardContent>
										</Card>
									)}

									{ request && <>
										{/* Staff Create - Readonly */}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="space-y-2">
												<FormLabel>Creado por</FormLabel>

												<Input
													value = { request?.staffCreate?.name || '-' }
													readOnly
													disabled
												/>
											</div>

											<div className="space-y-2">
												<FormLabel>Última actualización por</FormLabel>

												<Input
													value = { request?.staffUpdate?.name || '-' }
													readOnly
													disabled
												/>
											</div>
										</div>

										{/* Staff Update - Readonly */}
										<ShowDateAt
											createdAt = { request?.createdAt }
											updatedAt = { request?.updatedAt }
										/>
									</>
									}
								</div>

								<div className="flex justify-between space-x-4 pt-4 border-t">
									<Button
										type    = "button"
										variant = "outline"
										onClick = { handleClose }
									>
										Cancelar
									</Button>

									<Button
										type        = "submit"
										disabled    = { createRequestMutation.isPending || updateRequestMutation.isPending }
									>
										{ ( createRequestMutation.isPending || updateRequestMutation.isPending ) && <LoaderMini /> }
										{ request ? 'Guardar cambios' : 'Crear solicitud' }
									</Button>
								</div>
							</form>
						</Form>
					</TabsContent>

					{ request &&
						<TabsContent value="comments" className="mt-4">
							{ request?.id && (
								<CommentSection
									requestId   = { request.id }
									enabled     = { tab === 'comments' }
								/>
							)}
						</TabsContent>
					}
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
