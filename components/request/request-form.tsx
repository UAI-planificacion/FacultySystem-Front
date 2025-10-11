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
	FormField,
	FormItem,
	FormLabel,
	FormMessage
}                                   from "@/components/ui/form";
import {
	ToggleGroup,
	ToggleGroupItem,
}                                   from "@/components/ui/toggle-group"
import { Input }                    from "@/components/ui/input";
import { Button }                   from "@/components/ui/button";
import { ShowDateAt }               from "@/components/shared/date-at";
import { SectionSelect }            from "@/components/shared/item-select/section-select";
import { RequestSessionForm }       from "@/components/request/request-session-form";

import {
	CreateRequest,
	Request,
	Status,
	UpdateRequest
}                                   from "@/types/request";
import { OfferSection }             from "@/types/offer-section.model";
import { Session }                  from "@/types/section.model";
import { RequestSessionCreate }     from "@/types/request-session.model";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import LoaderMini                   from "@/icons/LoaderMini";
import { useSession }               from "@/hooks/use-session";
import { updateFacultyTotal }       from "@/app/faculties/page";


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
})


const defaultRequest = ( data : Request | null, sectionId? : string ) => ({
	title           : data?.title           || '',
	status          : data?.status          || Status.PENDING,
	sectionId       : data?.section?.id     || sectionId || '',
});


const sessionLabels: Record<Session, string> = {
	[Session.C] : 'Cátedra',
	[Session.A] : 'Ayudantía',
	[Session.T] : 'Taller',
	[Session.L] : 'Laboratorio',
};


export function RequestForm({
	isOpen,
	onClose,
	onSuccess,
	request,
	facultyId,
	section : propSection
}: Props ): JSX.Element {
	const queryClient               = useQueryClient();
	const { staff, isLoading: isLoadingStaff }     = useSession();

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

	// Estado para el edificio seleccionado por sesión
	const [sessionBuildings, setSessionBuildings] = useState<Record<Session, string | null>>({
		[Session.C] : null,
		[Session.A] : null,
		[Session.T] : null,
		[Session.L] : null,
	});

	// Estado para el tipo de filtro seleccionado (type, size, space)
	const [sessionFilterType, setSessionFilterType] = useState<Record<Session, 'type' | 'size' | 'space'>>({
		[Session.C] : 'type',
		[Session.A] : 'type',
		[Session.T] : 'type',
		[Session.L] : 'type',
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
		setSelectedSectionId( propSection?.id || request?.section?.id || null );
	}, [request, isOpen, propSection]);


	// Manejar envío del formulario
	function handleSubmit( data: RequestFormValues ): void {

		// Esperar a que termine de cargar antes de validar
		if ( isLoadingStaff ) {
			toast( 'Cargando información del usuario...', { description: 'Por favor espere' });
			return;
		}

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
			const requestSessions: RequestSessionCreate[] = availableSessions.map( session => {
				const dayModuleIds  = sessionDayModules[session].map( dm => dm.dayModuleId );
				const config        = sessionConfigs[session];

				return {
					session         : session,
					description     : config.description    || null,
					isEnglish       : config.isEnglish      || false,
					isConsecutive   : config.isConsecutive  || false,
					inAfternoon     : config.inAfternoon    || false,
					spaceSizeId     : config.spaceSizeId    || null,
					spaceType       : config.spaceType      || null,
					professorId     : config.professorId    || null,
					building        : config.building       || '',
					spaceId         : config.spaceId        || null,
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

			const dataS = {
				...data,
				staffCreateId   : staff.id,
				requestSessions
			}
			console.log('🚀 ~ file: request-form.tsx:395 ~ dataS:', dataS)

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

        setSessionBuildings({
			[Session.C] : null,
			[Session.A] : null,
			[Session.T] : null,
			[Session.L] : null,
		});

        setSessionFilterType({
			[Session.C] : 'type',
			[Session.A] : 'type',
			[Session.T] : 'type',
			[Session.L] : 'type',
		});

        setSelectedSectionId( null );

        onClose();
	}, [ onClose ]);


	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[800px] overflow-y-auto">
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

                                {/* Request Sessions - Solo para creación */}
                                { !request && section && availableSessions.length > 0 && (
                                    <RequestSessionForm
                                        availableSessions           = { availableSessions }
                                        sessionDayModules           = { sessionDayModules }
                                        sessionConfigs              = { sessionConfigs }
                                        sessionBuildings            = { sessionBuildings }
                                        sessionFilterType           = { sessionFilterType }
                                        currentSession              = { currentSession }
                                        onSessionDayModulesChange   = { setSessionDayModules }
                                        onSessionConfigsChange      = { setSessionConfigs }
                                        onSessionBuildingsChange    = { setSessionBuildings }
                                        onSessionFilterTypeChange   = { setSessionFilterType }
                                        onCurrentSessionChange      = { setCurrentSession }
                                    />
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
                                    disabled    = { isLoadingStaff || createRequestMutation.isPending || updateRequestMutation.isPending }
                                >
                                    { ( isLoadingStaff || createRequestMutation.isPending || updateRequestMutation.isPending ) && <LoaderMini /> }
                                    { isLoadingStaff ? 'Cargando...' : ( request ? 'Guardar cambios' : 'Crear solicitud' )}
                                </Button>
                            </div>
                        </form>
                    </Form>
			</DialogContent>
		</Dialog>
	);
}
