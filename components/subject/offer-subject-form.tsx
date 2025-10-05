'use client'

import { JSX, useEffect, useMemo }  from "react";
import { useForm }                  from "react-hook-form";

import { useRouter } from "next/navigation";


import {
	useQuery,
	useMutation,
	useQueryClient
}                       from "@tanstack/react-query";
import { toast }        from "sonner";
import { zodResolver }  from "@hookform/resolvers/zod";
import { z }            from "zod";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
}                           from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
}                           from "@/components/ui/form";
import { Button }           from "@/components/ui/button";
import { Input }            from "@/components/ui/input";
import { CalendarSelect }   from "@/components/ui/calendar-select";
import { SubjectSelect }    from "@/components/shared/item-select/subject-select";
import { PeriodSelect }     from "@/components/shared/item-select/period-select";
import { ProfessorSelect }  from "@/components/shared/item-select/professor-select";
import { SpaceTypeSelect }  from "@/components/shared/item-select/space-type-select";
import { SizeSelect }       from "@/components/shared/item-select/size-select";
import { SessionButton }    from "@/components/session/session-button";
import { offerSubjectSchema } from "./offer-subject-schema";

import { CreateOfferSubject, Subject }  from "@/types/subject.model";
import { Period }                       from "@/types/periods.model";
import { Session }                      from "@/types/section.model";
import { KEY_QUERYS }                   from "@/consts/key-queries";
import { Method, fetchApi }             from "@/services/fetch";
import { errorToast, successToast }     from "@/config/toast/toast.config";


type OfferSubjectFormValues = z.infer<typeof offerSubjectSchema>;


interface Props {
	facultyId       : string;
	subject?        : Subject;
	onSubmit        : ( data: OfferSubjectFormValues ) => void;
	isOpen          : boolean;
	onClose         : () => void;
}

/**
 * API call to create offer subjects
 */
const createOfferSubjectApi = async ( dataFrom: CreateOfferSubject ): Promise<any[]> =>
	fetchApi<any[]>({
		url     : 'sections/offer',
		method  : Method.POST,
		body    : dataFrom
	});


const emptyOfferSubject = ( subject: Subject | undefined ): OfferSubjectFormValues => {
	return {
        periodId            : "",
		professorId         : "",
		numberOfSections    : 1,
		startDate           : new Date(),
        endDate             : new Date(),
		subjectId           : subject?.id               || "",
		spaceType           : subject?.spaceType        || "",
		spaceSizeId         : subject?.spaceSizeId      || "",
		workshop            : subject?.workshop         || 0,
		lecture             : subject?.lecture          || 0,
		tutoringSession     : subject?.tutoringSession  || 0,
		laboratory          : subject?.laboratory       || 0,
	};
};


const validString = (
    value: string | undefined | null
): string | null  => value ?? null;


export function OfferSubjectForm({
	facultyId,
	subject,
	onSubmit,
	isOpen,
	onClose,
}: Props): JSX.Element {
	const router        = useRouter();
	const queryClient   = useQueryClient();
	const form          = useForm<OfferSubjectFormValues>({
		resolver        : zodResolver( offerSubjectSchema ),
		defaultValues   : emptyOfferSubject( subject ),
	});

	// Query para obtener asignaturas de la facultad
	const { data: subjects } = useQuery<Subject[]>({
		queryKey    : [KEY_QUERYS.SUBJECTS, facultyId],
		queryFn     : () => fetchApi({ url: `subjects/all/${facultyId}` }),
		enabled     : isOpen,
	});

	// Query para obtener períodos
	const { data: periods } = useQuery<Period[]>({
		queryKey    : [KEY_QUERYS.PERIODS],
		queryFn     : () => fetchApi<Period[]>({ url: 'periods' }),
		enabled     : isOpen,
	});

	// Resetear formulario cuando cambia la asignatura prop
	useEffect(() => {
		form.reset( emptyOfferSubject( subject ));
	}, [ subject, form, isOpen ]);

	// Obtener asignatura seleccionada
	const selectedSubject = useMemo(() => {
		const subjectId = form.watch( 'subjectId' );

        return subjects?.find( s => s.id === subjectId );
	}, [subjects, form.watch( 'subjectId' )]);

	// Obtener período seleccionado
	const selectedPeriod = useMemo(() => {
		const periodId = form.watch( 'periodId' );

        return periods?.find( p => p.id === periodId );
	}, [periods, form.watch( 'periodId' )]);

	// Cargar datos de la asignatura seleccionada
	useEffect(() => {
		if ( selectedSubject ) {
			form.setValue('spaceType',          selectedSubject.spaceType || "" );
			form.setValue('spaceSizeId',        selectedSubject.spaceSizeId || "" );
			form.setValue('workshop',           selectedSubject.workshop );
			form.setValue('lecture',            selectedSubject.lecture );
			form.setValue('tutoringSession',    selectedSubject.tutoringSession );
			form.setValue('laboratory',         selectedSubject.laboratory );
		}
	}, [selectedSubject, form]);

	// Cargar fechas del período seleccionado
	useEffect(() => {
		if ( selectedPeriod ) {
            const startDate = new Date( selectedPeriod.startDate );
            const endDate   = new Date( selectedPeriod.endDate );

			form.setValue( 'startDate', startDate );
			form.setValue( 'endDate', endDate );
		}
	}, [selectedPeriod, form]);

	/**
	 * Get form field name for session type
	 */
	function getSessionFieldName( session: Session ): keyof OfferSubjectFormValues {
		switch ( session ) {
			case Session.C  : return 'lecture';
			case Session.A  : return 'tutoringSession';
			case Session.T  : return 'workshop';
			case Session.L  : return 'laboratory';
			default         : return 'lecture';
		}
	}

	/**
	 * Update session count by delta
	 */
	function updateSessionCount( _: string, session: Session, delta: number ): void {
		const currentValue  = form.getValues(getSessionFieldName( session ));
		const newValue      = Math.max( 0, ( Number( currentValue ) ?? 0 ) + delta );

        form.setValue( getSessionFieldName( session ), newValue );
	}

	/**
	 * Set session count to specific value
	 */
	function setSessionCount( _: string, session: Session, value: string ): void {
		const numValue = parseInt( value ) || 0;
		form.setValue( getSessionFieldName( session ), Math.max( 0, numValue ));
	}

	/**
	 * Mutation to create offer subjects
	 */
	const createOfferSubjectMutation = useMutation<any[], Error, CreateOfferSubject>({
		mutationFn: createOfferSubjectApi,
		onSuccess: ( createdOffers ) => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.SECCTIONS ]});
			onClose();
			form.reset();
            // TODO: mejorar el filtro
			router.push(`/sections?subject=${createdOffers[0].subjectId}`);

			toast( `${createdOffers.length} ofertas creadas exitosamente`, successToast );
		},
		onError: ( mutationError ) => {
			toast( `Error al crear ofertas: ${mutationError.message}`, errorToast );
		},
	});


	/**
	 * Create mock section data for SessionButton
	 */
	function createMockSection(): any {
		const watchedValues = form.watch();
		return {
			id              : 'offer-subject-form',
			workshop        : watchedValues.workshop || 0,
			lecture         : watchedValues.lecture || 0,
			tutoringSession : watchedValues.tutoringSession || 0,
			laboratory      : watchedValues.laboratory || 0,
			sessionCounts   : {
				[Session.C] : watchedValues.lecture || 0,
				[Session.A] : watchedValues.tutoringSession || 0,
				[Session.T] : watchedValues.workshop || 0,
				[Session.L] : watchedValues.laboratory || 0,
			}
		};
	}


    const handleSubmit = (data: OfferSubjectFormValues) => {
		const transformedData: CreateOfferSubject = {
			...data,
			professorId : validString( data.professorId ),
			spaceType   : validString( data.spaceType ),
			spaceSizeId : validString( data.spaceSizeId ),
		};

		createOfferSubjectMutation.mutate( transformedData );
	};


    const hasSelectedSubject    = !!form.watch( 'subjectId' );
	const hasSelectedPeriod     = !!form.watch( 'periodId' );
	const hasStartDate          = !!form.watch( 'startDate' );
	const hasEndDate            = !!form.watch( 'endDate' );


    return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Ofertar Asignatura</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={ form.handleSubmit( handleSubmit )} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Selección de Asignatura */}
							<FormField
								control = { form.control }
								name    = "subjectId"
								render  = {({ field }) => (
									<FormItem>
										<FormControl>
											<SubjectSelect
												label               = "Asignatura *"
												placeholder         = "Seleccionar asignatura"
												onSelectionChange   = {( value ) => field.onChange( value )}
												defaultValues       = { field.value ? [field.value] : [] }
												multiple            = { false }
												url                 = { facultyId }
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Selección de Período */}
							<FormField
								control = { form.control }
								name    = "periodId"
								render  = {({ field }) => (
									<FormItem>
										<FormControl>
											<PeriodSelect
												label               = "Período *"
												placeholder         = "Seleccionar período"
												onSelectionChange   = {( value ) => field.onChange( value )}
												defaultValues       = { field.value ? [field.value] : [] }
												multiple            = { false }
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Campos habilitados solo cuando hay asignatura seleccionada */}
						{hasSelectedSubject && (
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{/* Profesor */}
									<FormField
										control = { form.control }
										name    = "professorId"
										render  = {({ field }) => (
											<FormItem>
												<FormControl>
													<ProfessorSelect
														label               = "Profesor"
														placeholder         = "Seleccionar profesor"
														onSelectionChange   = {( value ) => field.onChange( value )}
														defaultValues       = { field.value ? [field.value] : [] }
														multiple            = { false }
													/>
												</FormControl>

												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Tipo de Espacio */}
									<FormField
										control = { form.control }
										name    = "spaceType"
										render  = {({ field }) => (
											<FormItem>
												<FormControl>
													<SpaceTypeSelect
														label               = "Tipo de Espacio"
														placeholder         = "Seleccionar tipo de espacio"
														onSelectionChange   = {( value ) => field.onChange( value )}
														defaultValues       = { field.value || '' }
														multiple            = { false }
													/>
												</FormControl>

												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Tamaño del Espacio */}
									<FormField
										control = { form.control }
										name    = "spaceSizeId"
										render  = {({ field }) => (
											<FormItem>
												<FormControl>
													<SizeSelect
														label               = "Tamaño del Espacio"
														placeholder         = "Seleccionar tamaño"
														onSelectionChange   = {( value) => field.onChange( value )}
														defaultValues       = { field.value ? [field.value] : [] }
														multiple            = { false }
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Sesiones */}
                                <div className="space-y-1">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                            <FormField
                                                control = { form.control }
                                                name    = "numberOfSections"
                                                render  = {({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>N° Secciones *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type        = "number"
                                                                min         = "1"
                                                                max         = "100"
                                                                placeholder = "Número de Secciones"
                                                                {...field}
                                                                onChange    = {(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <SessionButton
                                                session             = { Session.C }
                                                updateSessionCount  = { updateSessionCount }
                                                setSessionCount     = { setSessionCount }
                                                section             = { createMockSection() }
                                                showLabel           = { true }
                                            />

                                            <SessionButton
                                                session             = { Session.T }
                                                updateSessionCount  = { updateSessionCount }
                                                setSessionCount     = { setSessionCount }
                                                section             = { createMockSection() }
                                                showLabel           = { true }
                                            />

                                            <SessionButton
                                                session             = { Session.A }
                                                updateSessionCount  = { updateSessionCount }
                                                setSessionCount     = { setSessionCount }
                                                section             = { createMockSection() }
                                                showLabel           = { true }
                                            />

                                            <SessionButton
                                                session             = { Session.L }
                                                updateSessionCount  = { updateSessionCount }
                                                setSessionCount     = { setSessionCount }
                                                section             = { createMockSection() }
                                                showLabel           = { true }
                                            />
                                        </div>
                                    </div>

                                    <FormField
                                        control = { form.control }
                                        name    = "workshop"
                                        render  = {({ fieldState }) => (
                                            <FormItem>
                                                { fieldState.error && (
                                                    <FormMessage className="text-start">
                                                        { fieldState.error.message }
                                                    </FormMessage>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
						)}

						{/* Campos habilitados solo cuando hay período seleccionado */}
						{hasSelectedPeriod && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Fecha de Inicio */}
								<FormField
									control = { form.control }
									name    = "startDate"
									render  = {({ field }) => (
										<FormItem>
											<FormLabel>Fecha de Inicio *</FormLabel>

											<FormControl>
												<CalendarSelect
													value       = { field.value }
													onSelect    = { field.onChange }
													placeholder = "Seleccionar fecha de inicio"
													className   = "w-full"
													disabled    = {( date ) => {
														if ( !selectedPeriod ) return true;

														const periodStart   = new Date( selectedPeriod.startDate );
														const periodEnd     = new Date( selectedPeriod.endDate );
														// const periodStart   = selectedPeriod.startDate ? new Date( selectedPeriod.startDate ) : null;
														// const periodEnd     = selectedPeriod.endDate ? new Date( selectedPeriod.endDate ) : null;
														if ( periodStart && date < periodStart )    return true;
														if ( periodEnd && date > periodEnd )        return true;

														return false;
													}}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Fecha de Fin */}
								<FormField
									control = { form.control }
									name    = "endDate"
									render  = {({ field }) => (
										<FormItem>
											<FormLabel>Fecha de Fin *</FormLabel>

											<FormControl>
												<CalendarSelect
													value       = { field.value }
													onSelect    = { field.onChange }
													placeholder = "Seleccionar fecha de fin"
													className   = "w-full"
													disabled    = {( date ) => {
														if ( !selectedPeriod ) return true;

														const periodStart   = new Date( selectedPeriod.startDate );
														const periodEnd     = new Date( selectedPeriod.endDate );
														// const periodStart   = selectedPeriod.startDate ? new Date( selectedPeriod.startDate ) : null;
														// const periodEnd     = selectedPeriod.endDate ? new Date( selectedPeriod.endDate ) : null;
														const startDate     = form.getValues( 'startDate' );

														// Deshabilitar fechas fuera del rango del período
														if ( periodStart && date < periodStart )    return true;
														if ( periodEnd && date > periodEnd )        return true;
														// Deshabilitar fechas anteriores a la fecha de inicio seleccionada
														if ( startDate && date < startDate ) return true;

														return false;
													}}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						)}

						{/* Botones */}
                        <DialogFooter className="flex justify-between gap-4 border-t pt-4">
							<Button
                                type    = "button"
                                variant = "outline"
                                onClick = { onClose }
                            >
								Cancelar
							</Button>

							<Button
								type        = "submit"
								disabled    = { !hasSelectedSubject || !hasSelectedPeriod || !hasStartDate || !hasEndDate || createOfferSubjectMutation.isPending }
							>
								{ createOfferSubjectMutation.isPending
									? 'Creando Ofertas...'
									: 'Crear Ofertas'
								}
							</Button>
                        </DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
    );
}
