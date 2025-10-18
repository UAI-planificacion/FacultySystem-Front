'use client'

import { JSX, useEffect, useState, useCallback, useMemo } from "react"

import {
    useMutation,
    useQuery,
    useQueryClient
}                       from "@tanstack/react-query";
import { z }			from "zod";
import { useForm }		from "react-hook-form";
import { zodResolver }	from "@hookform/resolvers/zod";
import { toast }		from "sonner";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
}							                    from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
}							                    from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
}							                    from "@/components/ui/select";
import { SpaceFilterSelector, FilterMode }      from "@/components/shared/space-filter-selector";
import { Button }			                    from "@/components/ui/button";
import { Switch }			                    from "@/components/ui/switch";
import { Textarea }			                    from "@/components/ui/textarea";
import { Label }			                    from "@/components/ui/label";
import { Input }			                    from "@/components/ui/input";
import { Checkbox }			                    from "@/components/ui/checkbox";
import { ProfessorSelect }	                    from "@/components/shared/item-select/professor-select";
import { HeadquartersSelect }                   from "@/components/shared/item-select/headquarters-select";
import { SessionWithoutPlanningChangeSelect }   from "@/components/shared/item-select/session-without-planning-change-select";
import { SectionSelect }	                    from "@/components/shared/item-select/section-select";
import { SessionInfoCard }	                    from "@/components/planning-change/session-info-card";
import { RequestDetailModuleDays }              from "@/components/request-detail/request-detail-module-days";

import {
    PlanningChange,
    PlanningChangeCreate,
    PlanningChangeUpdate,
    SessionWithoutPlanningChange
}                                   from "@/types/planning-change.model";
import { Session }			        from "@/types/section.model";
import { Status }			        from "@/types/request";
import { KEY_QUERYS }		        from "@/consts/key-queries";
import { Method, fetchApi }	        from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { getStatusName }	        from "@/lib/utils";


interface Props {
	planningChange?	: PlanningChange | null;
	onSuccess		: () => void;
	onCancel		: () => void;
	isOpen			: boolean;
	onClose			: () => void;
	staffId			: string;
}


const sessionLabels: Record<Session, string> = {
	[Session.C]	: 'Cátedra',
	[Session.A]	: 'Ayudantía',
	[Session.T]	: 'Taller',
	[Session.L]	: 'Laboratorio',
};


export type SessionSelectionMode = 'session' | 'section';


// Base Zod schema for planning change validation
const basePlanningChangeSchema = z.object({
	title			: z.string().min( 1, "Título requerido" ),
	sessionName		: z.nativeEnum( Session ).nullable(),
	sessionId		: z.string().nullable(),
	sectionId		: z.string().nullable(),
	professorId		: z.string().nullable(),
	building		: z.string().nullable(),
	spaceId			: z.string().nullable(),
	spaceType		: z.string().nullable(),
	spaceSizeId		: z.string().nullable(),
	isEnglish		: z.boolean().nullable(),
	isConsecutive	: z.boolean().nullable(),
	inAfternoon		: z.boolean().nullable(),
	description		: z.string().nullable(),
	dayModulesId	: z.array( z.number() ).min( 0 ),
	status			: z.nativeEnum( Status ).optional(),
}).refine(
	( data ) => {
		// Si no hay sessionId, debe haber sectionId
		if ( !data.sessionId && !data.sectionId ) {
			return false;
		}
		// No pueden estar ambos presentes
		if ( data.sessionId && data.sectionId ) {
			return false;
		}
		return true;
	},
	{
		message	: "Debe seleccionar una sesión existente O una sección para crear nueva sesión",
		path	: ["sessionId"],
	}
);


/**
 * Create dynamic schema with session validation
 */
const createPlanningChangeSchema = ( selectedSession: SessionWithoutPlanningChange | null, filterMode: FilterMode ) => {
	return basePlanningChangeSchema.superRefine(( data: z.infer<typeof basePlanningChangeSchema>, ctx: z.RefinementCtx ) => {
		// Validación cuando se selecciona una SESIÓN EXISTENTE
		if ( data.sessionId && selectedSession ) {
			// Verificar cambios en campos disponibles
			const changes = {
				sessionName	: data.sessionName !== null && data.sessionName !== selectedSession.name,
				professorId	: data.professorId !== null && data.professorId !== selectedSession.professor.id,
				building	: data.building !== null, // Building no está en session, siempre es cambio si se selecciona
				isEnglish	: data.isEnglish !== null && data.isEnglish !== selectedSession.isEnglish,
				spaceId		: data.spaceId !== null && data.spaceId !== selectedSession.spaceId,
				spaceType	: data.spaceType !== null, // spaceType no está en session, siempre es cambio
				spaceSizeId	: data.spaceSizeId !== null, // spaceSizeId no está en session, siempre es cambio
				dayModules	: data.dayModulesId.length > 0 && !data.dayModulesId.includes( selectedSession.dayModule.id ),
			};

			// Verificar si hay al menos un cambio
			const hasChanges = Object.values( changes ).some( changed => changed );

			if ( !hasChanges ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "Debe realizar al menos un cambio en la sesión seleccionada",
					path	: ["title"],
				});
			}

			// Validar campos específicos que son iguales
			if ( data.sessionName !== null && data.sessionName === selectedSession.name ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "El tipo de sesión seleccionado ya está asignado a esta sesión",
					path	: ["sessionName"],
				});
			}

			if ( data.professorId !== null && data.professorId === selectedSession.professor.id ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "El profesor seleccionado ya está asignado a esta sesión",
					path	: ["professorId"],
				});
			}

			if ( data.isEnglish !== null && data.isEnglish === selectedSession.isEnglish ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "El valor de 'En Inglés' seleccionado ya está asignado a esta sesión",
					path	: ["isEnglish"],
				});
			}

			if ( data.spaceId !== null && data.spaceId === selectedSession.spaceId ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "El espacio seleccionado ya está asignado a esta sesión",
					path	: ["spaceId"],
				});
			}

			if ( data.dayModulesId.length > 0 && data.dayModulesId.includes( selectedSession.dayModule.id )) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "El módulo seleccionado ya está asignado a esta sesión",
					path	: ["dayModulesId"],
				});
			}
		}

		// Validación cuando se selecciona una SECCIÓN
		if ( data.sectionId ) {
			// sessionName es requerido
			if ( !data.sessionName ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "El tipo de sesión es requerido cuando se crea una nueva sesión",
					path	: ["sessionName"],
				});
			}

			// building es requerido
			if ( !data.building ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "El edificio es requerido cuando se crea una nueva sesión",
					path	: ["building"],
				});
			}

			// dayModulesId debe tener al menos 1
			if ( data.dayModulesId.length === 0 ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "Debe seleccionar al menos un módulo cuando se crea una nueva sesión",
					path	: ["dayModulesId"],
				});
			}

			// Espacios: Validar según filterMode
			if ( filterMode === 'space' ) {
				// Modo espacio específico: spaceId es requerido
				if ( !data.spaceId ) {
					ctx.addIssue({
						code	: z.ZodIssueCode.custom,
						message	: "Debe seleccionar un espacio específico",
						path	: ["spaceId"],
					});
				}
			} else {
				// Modo tipo/tamaño: al menos uno debe estar seleccionado
				const hasSpaceTypeOrSize = data.spaceType !== null || data.spaceSizeId !== null;
				if ( !hasSpaceTypeOrSize ) {
					ctx.addIssue({
						code	: z.ZodIssueCode.custom,
						message	: "Debe seleccionar un tipo de espacio y/o tamaño",
						path	: ["spaceType"],
					});
				}
			}
		}
	});
}



type PlanningChangeFormValues = z.infer<typeof basePlanningChangeSchema>;


export function PlanningChangeForm({
	planningChange,
	onSuccess,
	onCancel,
	isOpen,
	onClose,
	staffId,
}: Props ): JSX.Element {
	const queryClient = useQueryClient();
	const isEditMode = !!planningChange;

	const [ requestDetailModule, setRequestDetailModule ] = useState<Array<{ id?: string; day: string; moduleId: string }>>([]);
	const [ selectedSessionId, setSelectedSessionId ] = useState<string | null>( null );
	const [ sessionSelectionMode, setSessionSelectionMode ] = useState<SessionSelectionMode>( 'session' );
	const [ filterMode, setFilterMode ] = useState<FilterMode>( 'space' );

	// Fetch sessions for validation
	const {
		data		: sessions,
		isLoading	: isLoadingSessions,
	} = useQuery({
		queryKey	: [ KEY_QUERYS.PLANNING_CHANGE, 'session-without' ],
		queryFn		: () => fetchApi<SessionWithoutPlanningChange[]>({ url: 'planning-change/without/session' }),
		enabled		: !!selectedSessionId,
		staleTime	: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	// Get selected session data
	const selectedSession = sessions?.find( s => s.id === selectedSessionId ) || null;

	// Create dynamic schema with session validation
	const planningChangeSchema = useMemo(
		() => createPlanningChangeSchema( selectedSession, filterMode ),
		[ selectedSession, filterMode ]
	);


	const form = useForm<PlanningChangeFormValues>({
		resolver		: zodResolver( planningChangeSchema ),
		defaultValues	: {
			title			: '',
			sessionName		: Session.C,
			sessionId		: null,
			sectionId		: null,
			professorId		: null,
			building		: null,
			spaceId			: null,
			spaceType		: null,
			spaceSizeId		: null,
			isEnglish		: false,
			isConsecutive	: false,
			inAfternoon		: false,
			description		: null,
			dayModulesId	: [],
			status			: Status.PENDING,
		},
	});


	// Update form when planningChange changes
	useEffect(() => {
		if ( planningChange ) {
			// Determine filter mode and set state
			const determinedFilterMode: FilterMode = planningChange.spaceId ? 'space' : 'type-size';
			setFilterMode( determinedFilterMode );

			// Convert dayModulesId to requestDetailModule format
			const modules = planningChange.dayModulesId.map( id => ({
				day			: id.toString(),
				moduleId	: id.toString()
			}));

			setRequestDetailModule( modules );
			setSelectedSessionId( null );

			form.reset({
				title			: planningChange.title,
				sessionName		: planningChange.sessionName,
				sessionId		: null,
				sectionId		: null,
				professorId		: planningChange.professor?.id || null,
				building		: planningChange.building || null,
				spaceId			: planningChange.spaceId,
				spaceType		: planningChange.spaceType,
				spaceSizeId		: planningChange.spaceSize as any,
				isEnglish		: planningChange.isEnglish,
				isConsecutive	: planningChange.isConsecutive,
				inAfternoon		: planningChange.inAfternoon,
				description		: planningChange.description,
				dayModulesId	: planningChange.dayModulesId,
				status			: planningChange.status,
			});
		} else {
			setRequestDetailModule([]);
			setSelectedSessionId( null );
			setSessionSelectionMode( 'session' );
			setFilterMode( 'space' );
			form.reset({
				title			: '',
				sessionName		: Session.C,
				sessionId		: null,
				sectionId		: null,
				professorId		: null,
				building		: null,
				spaceId			: null,
				spaceType		: null,
				spaceSizeId		: null,
				isEnglish		: false,
				isConsecutive	: false,
				inAfternoon		: false,
				description		: null,
				dayModulesId	: [],
				status			: Status.PENDING,
			});
		}
	}, [ planningChange, form, isOpen ]);

	// Create mutation
	const createPlanningChangeMutation = useMutation({
		mutationFn: async ( values: PlanningChangeFormValues ) => {
			const body: PlanningChangeCreate = {
				title			: values.title,
				sessionName		: values.sessionName,
				sessionId		: values.sessionId,
				sectionId		: values.sectionId,
				professorId		: values.professorId,
				spaceSizeId		: values.spaceSizeId as any,
				spaceType		: values.spaceType as any,
				spaceId			: values.spaceId,
				isEnglish		: values.isEnglish,
				isConsecutive	: values.isConsecutive,
				inAfternoon		: values.inAfternoon,
				description		: values.description,
				building		: values.building as any,
				status			: null,
				dayModulesId	: values.dayModulesId,
				staffCreateId	: staffId,
			};

			return fetchApi({
				url		: 'planning-change',
				method	: Method.POST,
				body,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.PLANNING_CHANGE, 'session-without' ] });
			toast( 'Cambio de planificación creado exitosamente', successToast );
			onSuccess();
		},
		onError: ( error: Error ) => {
			toast( `Error al crear cambio de planificación: ${error.message}`, errorToast );
		},
	});


	// Update mutation
	const updatePlanningChangeMutation = useMutation({
		mutationFn: async ( values: PlanningChangeFormValues ) => {
			const body: PlanningChangeUpdate = {
				id				: planningChange!.id,
				title			: values.title,
				sessionName		: values.sessionName,
				sessionId		: values.sessionId,
				professorId		: values.professorId,
				spaceSizeId		: values.spaceSizeId as any,
				spaceType		: values.spaceType as any,
				spaceId			: values.spaceId,
				isEnglish		: values.isEnglish,
				isConsecutive	: values.isConsecutive,
				inAfternoon		: values.inAfternoon,
				description		: values.description,
				building		: values.building as any,
				dayModulesId	: values.dayModulesId,
				status			: values.status || null,
				staffUpdateId	: staffId,
			};

			return fetchApi({
				url		: `planning-change/${planningChange!.id}`,
				method	: Method.PATCH,
				body,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.PLANNING_CHANGE ] });
			toast( 'Cambio de planificación actualizado exitosamente', successToast );
			onSuccess();
		},
		onError: ( error: Error ) => {
			toast( `Error al actualizar cambio de planificación: ${error.message}`, errorToast );
		},
	});


	const onSubmit = ( values: PlanningChangeFormValues ) => {
		console.log('🚀 ~ file: planning-change-form.tsx:312 ~ values:', values)
		// if ( isEditMode ) {
		// 	updatePlanningChangeMutation.mutate( values );
		// } else {
		// 	createPlanningChangeMutation.mutate( values );
		// }
	};


	const handleBuildingChange = ( buildingId: string | null ) => {
		form.setValue( 'building', buildingId );

		// Clear space filters when building changes
		form.setValue( 'spaceType', null );
		form.setValue( 'spaceSizeId', null );
		form.setValue( 'spaceId', null );
	};


	const handleSessionSelectionModeChange = ( mode: SessionSelectionMode ) => {
		setSessionSelectionMode( mode );

		// Clear fields based on mode
		if ( mode === 'session' ) {
			form.setValue( 'sectionId', null );
		} else {
			form.setValue( 'sessionId', null );
			setSelectedSessionId( null );
		}
	};


	const handleModuleToggle = useCallback(( day: string, moduleId: string, isChecked: boolean ) => {
		setRequestDetailModule( prev => {
			if ( isChecked ) {
				return [...prev, { day, moduleId }];
			} else {
				return prev.filter( item => !( item.day === day && item.moduleId === moduleId ));
			}
		});
	}, []);


	// Update dayModulesId when requestDetailModule changes
	useEffect(() => {
		const dayModuleIds = requestDetailModule.map( item => parseInt( item.moduleId ));
		form.setValue( 'dayModulesId', dayModuleIds );
	}, [ requestDetailModule, form ]);




	return (
		<Dialog open={ isOpen } onOpenChange={ onClose }>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{ isEditMode ? 'Editar Cambio de Planificación' : 'Crear Cambio de Planificación' }
					</DialogTitle>

					<DialogDescription>
						{ isEditMode 
							? 'Modifica los datos del cambio de planificación'
							: 'Crea un nuevo cambio de planificación para modificar una sesión existente o crear una nueva'
						}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={ form.handleSubmit( onSubmit ) } className="space-y-4">
						{/* Título */}
						<FormField
							control	= { form.control }
							name	= "title"
							render	= {({ field }) => (
								<FormItem>
									<FormLabel>Título *</FormLabel>

									<FormControl>
										<Input
											placeholder	= "Título del cambio de planificación"
											{...field}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
							{/* Status (solo en modo edición) */}
							{ isEditMode && (
								<FormField
									control	= { form.control }
									name	= "status"
									render	= {({ field }) => (
										<FormItem>
											<FormLabel>Estado</FormLabel>

											<Select
												onValueChange	= { field.onChange }
												defaultValue	= { field.value }
												value			= { field.value }
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Seleccionar estado" />
													</SelectTrigger>
												</FormControl>

												<SelectContent>
													{ Object.values( Status ).map( status => (
														<SelectItem key={ status } value={ status }>
															{ getStatusName( status ) }
														</SelectItem>
													))}
												</SelectContent>
											</Select>

											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						{/* </div> */}

						{/* Selección de Sesión o Sección (solo en modo creación) */}
						{ !isEditMode && (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{/* Sesión Existente */}
								<div className="flex gap-2 items-end">
									<Checkbox
										className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center mb-2"
										checked			= { sessionSelectionMode === 'session' }
										onCheckedChange	= {( checked ) => { if ( checked ) handleSessionSelectionModeChange( 'session' )}}
									/>

									<FormField
										control	= { form.control }
										name	= "sessionId"
										render	= {({ field }) => (
											<FormItem className="w-full">
												<SessionWithoutPlanningChangeSelect
													label				= "Sesión Existente (para modificar)"
													placeholder			= "Seleccionar sesión existente"
													defaultValues		= { field.value || undefined }
													disabled			= { sessionSelectionMode !== 'session' }
													onSelectionChange	= {( value ) => {
														const sessionId = typeof value === 'string' ? value : null;
														field.onChange( sessionId );
														setSelectedSessionId( sessionId );
													}}
												/>

												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Sección (para crear nueva sesión) */}
								<div className="flex gap-2 items-end">
									<Checkbox
										className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center mb-2"
										checked			= { sessionSelectionMode === 'section' }
										onCheckedChange	= {( checked ) => { if ( checked ) handleSessionSelectionModeChange( 'section' )}}
									/>

									<FormField
										control	= { form.control }
										name	= "sectionId"
										render	= {({ field }) => (
											<FormItem className="w-full">
												<SectionSelect
													label				= "Sección (para crear nueva sesión)"
													placeholder			= "Seleccionar sección"
													defaultValues		= { field.value || undefined }
													queryKey			= {[ KEY_QUERYS.SECCTIONS, 'planning' ]}
													url					= "sections/planning"
													disabled			= { sessionSelectionMode !== 'section' }
													onSelectionChange	= {( value ) => {
														const sectionId = typeof value === 'string' ? value : null;
														field.onChange( sectionId );
													}}
												/>

												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						)}

						{/* Mostrar información de la sesión seleccionada */}
						{ selectedSessionId && (
							<SessionInfoCard 
								sessionData	= { selectedSession }
								isLoading	= { isLoadingSessions }
							/>
						)}

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Tipo de Sesión */}
							<FormField
								control	= { form.control }
								name	= "sessionName"
								render	= {({ field }) => (
									<FormItem>
										<FormLabel>Tipo de Sesión *</FormLabel>

										<Select
											onValueChange	= { field.onChange }
											defaultValue	= { field.value || undefined }
											value			= { field.value || undefined }
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Seleccionar tipo" />
												</SelectTrigger>
											</FormControl>

											<SelectContent>
												{ Object.entries( sessionLabels ).map(([ key, label ]) => (
													<SelectItem key={ key } value={ key }>
														{ label }
													</SelectItem>
												))}
											</SelectContent>
										</Select>

										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Profesor */}
							<FormField
								control	= { form.control }
								name	= "professorId"
								render	= {({ field }) => (
									<FormItem>
										<FormLabel>Profesor</FormLabel>

										<FormControl>
											<ProfessorSelect
												multiple			= { false }
												placeholder			= "Seleccionar profesor"
												defaultValues		= { field.value || undefined }
												onSelectionChange	= {( value ) => {
													const professorId = typeof value === 'string' ? value : null;
													field.onChange( professorId );
												}}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Edificio */}
							<FormField
								control	= { form.control }
								name	= "building"
								render	= {({ field }) => (
									<FormItem>
										<FormLabel>Edificio</FormLabel>

										<FormControl>
											<HeadquartersSelect
												multiple			= { false }
												placeholder			= "Seleccionar edificio"
												defaultValues		= { field.value || undefined }
												onSelectionChange	= {( value ) => {
													const buildingId = typeof value === 'string' ? value : null;
													field.onChange( buildingId );
													handleBuildingChange( buildingId );
												}}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Selector de filtros de espacio */}
						{ form.watch( 'building' ) && (
							<div className="space-y-2">
								<SpaceFilterSelector
									buildingId			= { form.watch( 'building' ) }
									filterMode			= { filterMode }
									spaceId				= { form.watch( 'spaceId' ) }
									spaceType			= { form.watch( 'spaceType' ) }
									spaceSizeId			= { form.watch( 'spaceSizeId' ) }
									onFilterModeChange	= {( mode ) => setFilterMode( mode )}
									onSpaceIdChange		= {( spaceId ) => form.setValue( 'spaceId', typeof spaceId === 'string' ? spaceId : null )}
									onSpaceTypeChange	= {( spaceType ) => form.setValue( 'spaceType', spaceType )}
									onSpaceSizeIdChange	= {( spaceSizeId ) => form.setValue( 'spaceSizeId', spaceSizeId )}
								/>
								
								{/* Mostrar errores de espacios */}
								{ ( form.formState.errors.spaceId || form.formState.errors.spaceType ) && (
									<p className="text-sm font-medium text-destructive">
										{ String( form.formState.errors.spaceId?.message || form.formState.errors.spaceType?.message || '' ) }
									</p>
								)}
							</div>
						)}

						{/* Switches */}
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
							<FormField
								control	= { form.control }
								name	= "isEnglish"
								render	= {({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between rounded-lg border p-3">
											<Label htmlFor="isEnglish" className="cursor-pointer">
												En inglés
											</Label>

											<FormControl>
												<Switch
													id				= "isEnglish"
													checked			= { field.value || false }
													onCheckedChange	= { field.onChange }
												/>
											</FormControl>
										</div>
									</FormItem>
								)}
							/>

							<FormField
								control	= { form.control }
								name	= "isConsecutive"
								render	= {({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between rounded-lg border p-3">
											<Label htmlFor="isConsecutive" className="cursor-pointer">
												Consecutivo
											</Label>

											<FormControl>
												<Switch
													id				= "isConsecutive"
													checked			= { field.value || false }
													onCheckedChange	= { field.onChange }
												/>
											</FormControl>
										</div>
									</FormItem>
								)}
							/>

							<FormField
								control	= { form.control }
								name	= "inAfternoon"
								render	= {({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between rounded-lg border p-3">
											<Label htmlFor="inAfternoon" className="cursor-pointer">
												En la tarde
											</Label>

											<FormControl>
												<Switch
													id				= "inAfternoon"
													checked			= { field.value || false }
													onCheckedChange	= { field.onChange }
												/>
											</FormControl>
										</div>
									</FormItem>
								)}
							/>
						</div>

						{/* Descripción */}
						<FormField
							control	= { form.control }
							name	= "description"
							render	= {({ field }) => (
								<FormItem>
									<FormLabel>Descripción</FormLabel>

									<FormControl>
										<Textarea
											placeholder	= "Descripción opcional del cambio"
											value		= { field.value || '' }
											onChange	= { field.onChange }
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Módulos y Días */}
						<div className="space-y-2">
							<Label>Módulos y Días *</Label>

							<RequestDetailModuleDays
								requestDetailModule	= { requestDetailModule }
								onModuleToggle		= { handleModuleToggle }
								enabled				= { true }
								multiple			= { true }
							/>

							{ form.formState.errors.dayModulesId && (
								<p className="text-sm font-medium text-destructive">
									{ String( form.formState.errors.dayModulesId.message || '' ) }
								</p>
							)}
						</div>

						<DialogFooter className="flex justify-between border-t pt-4">
							<Button
								type		= "button"
								variant		= "outline"
								onClick		= { onCancel }
								disabled	= { createPlanningChangeMutation.isPending || updatePlanningChangeMutation.isPending }
							>
								Cancelar
							</Button>

							<Button
								type		= "submit"
								disabled	= { createPlanningChangeMutation.isPending || updatePlanningChangeMutation.isPending }
							>
								{ ( createPlanningChangeMutation.isPending || updatePlanningChangeMutation.isPending ) 
									? 'Guardando...' 
									: isEditMode ? 'Actualizar' : 'Crear'
								}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}