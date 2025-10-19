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
}							                from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
}							                from "@/components/ui/form";
import { SpaceFilterSelector, FilterMode }  from "@/components/shared/space-filter-selector";
import { Button }			                from "@/components/ui/button";
import { Switch }			                from "@/components/ui/switch";
import { Textarea }			                from "@/components/ui/textarea";
import { Label }			                from "@/components/ui/label";
import { Input }			                from "@/components/ui/input";
import { ProfessorSelect }	                from "@/components/shared/item-select/professor-select";
import { HeadquartersSelect }               from "@/components/shared/item-select/headquarters-select";
import { MultiSelectCombobox }              from "@/components/shared/Combobox";
import { SessionInfoCard }	                from "@/components/planning-change/session-info-card";
import { RequestDetailModuleDays }          from "@/components/request-detail/request-detail-module-days";
import { sessionLabels }                    from "@/components/section/section.config";
import { ChangeStatus }                     from "@/components/shared/change-status";
import { SessionTypeSelector }              from "@/components/shared/session-type-selector";

import {
    PlanningChange,
    PlanningChangeCreate,
    PlanningChangeUpdate,
    SessionWithoutPlanningChange
}                                       from "@/types/planning-change.model";
import { Session }			            from "@/types/section.model";
import { Status }			            from "@/types/request";
import { KEY_QUERYS }		            from "@/consts/key-queries";
import { Method, fetchApi }	            from "@/services/fetch";
import { errorToast, successToast }     from "@/config/toast/toast.config";
import { tempoFormat }                  from "@/lib/utils";
import { OfferSection, OfferSession }   from "@/types/offer-section.model";


interface Props {
	planningChange?	: PlanningChange | null;
	onSuccess		: () => void;
	onCancel		: () => void;
	isOpen			: boolean;
	onClose			: () => void;
	staffId			: string;
    section         : OfferSection | null;
}

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
});


/**
 * Create dynamic schema with session validation
 */
const createPlanningChangeSchema = (
    selectedSession: SessionWithoutPlanningChange | null,
    filterMode: FilterMode
) => {
	return basePlanningChangeSchema.superRefine(( data: z.infer<typeof basePlanningChangeSchema>, ctx: z.RefinementCtx ) => {
		// Validación cuando se selecciona una SESIÓN EXISTENTE
		if ( data.sessionId && selectedSession ) {
			// Verificar si hay al menos un cambio
			const hasSessionNameChange	= data.sessionName !== null && data.sessionName !== selectedSession.name;
			const hasProfessorChange	= data.professorId !== null && data.professorId !== selectedSession.professor.id;
			const hasBuildingChange		= data.building !== null;
			const hasIsEnglishChange	= data.isEnglish !== null && data.isEnglish !== selectedSession.isEnglish;
			const hasSpaceIdChange		= data.spaceId !== null && data.spaceId !== selectedSession.spaceId;
			const hasSpaceTypeChange	= data.spaceType !== null;
			const hasSpaceSizeChange	= data.spaceSizeId !== null;
			const hasDayModulesChange	= data.dayModulesId.length > 0 && !data.dayModulesId.includes( selectedSession.dayModule.id );

			const hasAnyChange = hasSessionNameChange 
                || hasProfessorChange
                || hasBuildingChange
                || hasIsEnglishChange
                || hasSpaceIdChange
                || hasSpaceTypeChange
                || hasSpaceSizeChange
                || hasDayModulesChange;

			if ( !hasAnyChange ) {
				ctx.addIssue({
					code	: z.ZodIssueCode.custom,
					message	: "Debe realizar al menos un cambio en la sesión seleccionada",
					path	: ["title"],
				});
			}
		}

		// Validación cuando NO se selecciona una sesión (modo creación)
		if ( !data.sessionId ) {
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
    section
}: Props ): JSX.Element {
	const queryClient   = useQueryClient();
	const isEditMode    = !!planningChange;

	const [ requestDetailModule, setRequestDetailModule ]   = useState<Array<{ id?: string; day: string; moduleId: string }>>([]);
	const [ selectedSessionId, setSelectedSessionId ]       = useState<string | null>( null );
	const [ filterMode, setFilterMode ]                     = useState<FilterMode>( 'space' );

	// Fetch sessions from section
	const {
		data		: sectionSessions,
		isLoading	: isLoadingSessions,
	} = useQuery({
		queryKey	: [ KEY_QUERYS.SECCTIONS, 'sessions', section?.id ],
		queryFn		: () => fetchApi<OfferSession[]>({ url: `sessions/section/${ section?.id }` }),
		enabled		: isOpen && !!section?.id,
		staleTime	: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	// Get selected session data
	const selectedSession = useMemo(() => {
		if ( !selectedSessionId || !sectionSessions ) return null;

		const offerSession = sectionSessions.find( s => s.id === selectedSessionId );
		if ( !offerSession ) return null;

		// Convert OfferSession to SessionWithoutPlanningChange format for validation
		return {
			id			: offerSession.id,
			name		: offerSession.name,
			spaceId		: offerSession.spaceId,
			isEnglish	: offerSession.isEnglish,
			date		: offerSession.date,
			professor	: {
				id		: offerSession.professor.id,
				name	: offerSession.professor.name,
			},
			dayModule	: {
				id		: offerSession.dayModuleId,
				dayId	: offerSession.dayId,
				module	: {
					id			: parseInt( offerSession.module.id ),
					code		: offerSession.module.code,
					startHour	: offerSession.module.startHour,
					endHour		: offerSession.module.endHour,
					difference	: offerSession.module.diference || '',
				},
			},
			section: {
				id			: section?.id || '',
				code		: section?.code || 0,
				startDate	: section?.startDate || new Date(),
				endDate		: section?.endDate || new Date(),
				subject		: {
					id		: section?.subject?.id || '',
					name	: section?.subject?.name || '',
				},
			},
		} as SessionWithoutPlanningChange;
	}, [ selectedSessionId, sectionSessions, section ]);

	// Create dynamic schema with session validation
	const planningChangeSchema = useMemo(
		() => createPlanningChangeSchema( selectedSession, filterMode ),
		[ selectedSession, filterMode ]
	);

	// Prepare session options for Combobox
	const sectionSessionOptions = useMemo(() => {
		if ( !sectionSessions ) return [];

		return sectionSessions.map( session => {
			const formattedDate = tempoFormat( session.date );
			const moduleInfo = `${ session.module.startHour }-${ session.module.endHour }`;

			return {
				id		: session.id,
				value	: session.id,
				label	: `${ sessionLabels[session.name] } - ${ formattedDate } - ${ moduleInfo }`,
			};
		});
	}, [ sectionSessions ]);

	const form = useForm<PlanningChangeFormValues>({
		resolver		: zodResolver( planningChangeSchema ),
		defaultValues	: {
			title			: '',
			sessionName		: null,
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
			setFilterMode( 'space' );
			form.reset({
				title			: '',
				sessionName		: null,
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
				sectionId		: values.sessionId ? null : section?.id || null,
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
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.PLANNING_CHANGE ] });
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.SECCTIONS ] });
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
		console.log('🚀 ~ PlanningChangeForm ~ onSubmit ~ values:', values);
		
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

                        {/* Status (solo en modo edición) */}
                        { isEditMode && (
                            <FormField
                                control	= { form.control }
                                name	= "status"
                                render	= {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>

                                        <FormControl>
                                            <ChangeStatus
                                                value           = { field.value || Status.PENDING }
                                                onValueChange   = { field.onChange }
                                                defaultValue    = { field.value }
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

						{/* Selección de Sesión (solo en modo creación) */}
						{ !isEditMode && (
							<FormField
								control	= { form.control }
								name	= "sessionId"
								render	= {({ field }) => (
									<FormItem>
										<Label>Sesión (opcional - seleccionar solo para modificar)</Label>

										<MultiSelectCombobox
											options				= { sectionSessionOptions }
											defaultValues		= { field.value || undefined }
											onSelectionChange	= {( value ) => {
												const sessionId = typeof value === 'string' ? value : undefined;
												field.onChange( sessionId || null );
												setSelectedSessionId( sessionId || null );
											}}
											placeholder			= "Seleccionar sesión existente (dejar vacío para crear nueva)"
											disabled			= { isLoadingSessions }
											isLoading			= { isLoadingSessions }
											multiple			= { false }
											required			= { false }
										/>

										<FormMessage />
									</FormItem>
								)}
							/>
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
										<FormLabel>Tipo de Sesión</FormLabel>

										<FormControl>
											<SessionTypeSelector
												multiple		= { false }
												value			= { field.value }
												onValueChange	= { field.onChange }
												defaultValue	= { field.value }
												allowDeselect	= { true }
											/>
										</FormControl>

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
                                            className   = "max-h-36"
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