'use client'

import { useEffect } from "react";

import { useMutation, useQueryClient }  from "@tanstack/react-query";
import { zodResolver }                  from "@hookform/resolvers/zod";
import { useForm }                      from "react-hook-form";
import { toast }                        from "sonner";
import { z }                            from "zod";

import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
}                           from "@/components/ui/select";
import { CalendarSelect }   from "@/components/ui/calendar-select";
import { CostCenterSelect } from "@/components/shared/item-select/cost-center";
import { Button }           from "@/components/ui/button";
import { Input }            from "@/components/ui/input";


import {
    Period,
    PeriodStatus,
    PeriodType
}                                   from "@/types/periods.model";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";


const endpoint = 'periods';

/**
 * Schema de validación para el formulario de período
 */
const periodSchema = z.object({
	id            : z.string().min( 1, "El ID es requerido" ),
	name          : z.string().min( 1, "El nombre es requerido" ),
	startDate     : z.date({ required_error: "La fecha de inicio es requerida" }),
	costCenterId  : z.string().min( 1, "El centro de costos es requerido" ),
	endDate       : z.date({ required_error: "La fecha de fin es requerida" }),
	openingDate   : z.date().optional(),
	closingDate   : z.date().optional(),
	status        : z.nativeEnum( PeriodStatus ).optional(),
	type          : z.nativeEnum( PeriodType, { required_error: "El tipo es requerido" }),
}).refine( ( data ) => {
	// Validar que la fecha de fin sea posterior a la fecha de inicio
	if ( data.startDate && data.endDate ) {
		return data.startDate < data.endDate;
	}
	return true;
}, {
	message : "La fecha de fin debe ser posterior a la fecha de inicio",
	path    : ["endDate"],
}).refine( ( data ) => {
	// Validar que la fecha de cierre sea posterior a la fecha de apertura si ambas están presentes
	if ( data.openingDate && data.closingDate ) {
		return data.openingDate < data.closingDate;
	}
	return true;
}, {
	message : "La fecha de cierre debe ser posterior a la fecha de apertura",
	path    : ["closingDate"],
});


type PeriodFormData = z.infer<typeof periodSchema>;


interface PeriodFormProps {
	period  ?: Period;
	isOpen   : boolean;
	onClose  : () => void;
}

/**
 * Formulario para crear y editar períodos
 */
export function PeriodForm( { period, isOpen, onClose }: PeriodFormProps ) {
	const queryClient = useQueryClient();
	const isEditing   = !!period;

	const form = useForm<PeriodFormData>({
		resolver      : zodResolver( periodSchema ),
		defaultValues : {
			id            : '',
			name          : '',
			startDate     : undefined,
			costCenterId  : '',
			endDate       : undefined,
			openingDate   : undefined,
			closingDate   : undefined,
			status        : PeriodStatus.Opened,
			type          : undefined,
		},
	});

	/**
	 * Resetea el formulario cuando se abre/cierra o cambia el período
	 */
	useEffect( () => {
		if ( isOpen ) {
			if ( period ) {
				// Formatear fechas para inputs de tipo date
				const parseDate = ( dateString: Date | string | null ): Date | undefined => {
					if ( !dateString ) return undefined;
					return dateString instanceof Date ? dateString : new Date( dateString );
				};

				form.reset({
					id            : period.id,
					name          : period.name,
					startDate     : parseDate( period.startDate ),
					costCenterId  : period.costCenterId,
					endDate       : parseDate( period.endDate ),
					openingDate   : parseDate( period.openingDate ),
					closingDate   : parseDate( period.closingDate ),
					status        : period.status,
					type          : period.type,
				});
			} else {
				form.reset({
					id            : '',
					name          : '',
					startDate     : undefined,
					costCenterId  : '',
					endDate       : undefined,
					openingDate   : undefined,
					closingDate   : undefined,
					status        : PeriodStatus.Opened,
					type          : undefined,
				});
			}
		}
	}, [isOpen, period, form] );

	/**
	 * API call para crear un período
	 */
	const createPeriodApi = async ( data: PeriodFormData ): Promise<Period> => {
		const { status, ...periodData } = data;
		return fetchApi<Period>({
			url    : endpoint,
			method : Method.POST,
			body   : {
				...periodData,
				startDate     : periodData.startDate.toISOString(),
				costCenterId  : periodData.costCenterId,
				endDate       : periodData.endDate.toISOString(),
				openingDate   : periodData.openingDate?.toISOString() || null,
				closingDate   : periodData.closingDate?.toISOString() || null,
				status        : PeriodStatus.Opened, // Siempre crear como Opened
				type          : periodData.type,
			},
		});
	};

	/**
	 * API call para actualizar un período
	 */
	const updatePeriodApi = async ( data: PeriodFormData ): Promise<Period> =>
		fetchApi<Period>({
			url    : `${endpoint}/${data.id}`,
			method : Method.PATCH,
			body   : {
				...data,
				startDate     : data.startDate.toISOString(),
				costCenterId  : data.costCenterId,
				endDate       : data.endDate.toISOString(),
				openingDate   : data.openingDate?.toISOString() || null,
				closingDate   : data.closingDate?.toISOString() || null,
			},
		});

	/**
	 * Mutación para crear período
	 */
	const createPeriodMutation = useMutation<Period, Error, PeriodFormData>({
		mutationFn : createPeriodApi,
		onSuccess  : () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.PERIODS] });
			toast( 'Período creado exitosamente', successToast );
			onClose();
		},
		onError: ( mutationError ) => {
			toast( `Error al crear período: ${mutationError.message}`, errorToast );
		},
	});

	/**
	 * Mutación para actualizar período
	 */
	const updatePeriodMutation = useMutation<Period, Error, PeriodFormData>({
		mutationFn : updatePeriodApi,
		onSuccess  : () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.PERIODS] });
			toast( 'Período actualizado exitosamente', successToast );
			onClose();
		},
		onError: ( mutationError ) => {
			toast( `Error al actualizar período: ${mutationError.message}`, errorToast );
		},
	});

	/**
	 * Maneja el envío del formulario
	 */
	const onSubmit = ( data: PeriodFormData ) => {
		if ( isEditing ) {
			updatePeriodMutation.mutate( data );
		} else {
			createPeriodMutation.mutate( data );
		}
	};

	/**
	 * Obtiene las opciones de estado para el select
	 */
    const getStatusOptions = () => [
        { value: PeriodStatus.Pending,      label: 'Pendiente' },
        { value: PeriodStatus.Opened,       label: 'Abierto' },
		{ value: PeriodStatus.InProgress,   label: 'En Progreso' },
		{ value: PeriodStatus.Closed,       label: 'Cerrado' },
	];

	/**
	 * Obtiene las opciones de tipo para el select
	 */
	const getTypeOptions = () => [
		{ value: PeriodType.ANUAL,      label: 'Anual' },
		{ value: PeriodType.SEMESTRAL,  label: 'Semestral' },
		{ value: PeriodType.TRIMESTRAL, label: 'Trimestral' },
		{ value: PeriodType.VERANO,     label: 'Verano' },
	];


	return (
		<Dialog open={ isOpen } onOpenChange={ onClose }>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						{ isEditing ? 'Editar Período' : 'Crear Nuevo Período' }
					</DialogTitle>

					<DialogDescription>
						{ isEditing 
							? 'Modifica los datos del período seleccionado.' 
							: 'Completa los datos para crear un nuevo período.' 
						}
					</DialogDescription>
				</DialogHeader>

				<Form { ...form }>
					<form onSubmit={ form.handleSubmit( onSubmit ) } className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* ID */}
							<FormField
								control = { form.control }
								name    = "id"
								render  = { ({ field }) => (
									<FormItem>
										<FormLabel>ID *</FormLabel>

										<FormControl>
											<Input
												placeholder = "Ingresa el ID del período"
												disabled    = { isEditing }
												{ ...field }
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								) }
							/>

							{/* Nombre */}
							<FormField
								control = { form.control }
								name    = "name"
								render  = { ({ field }) => (
									<FormItem>
										<FormLabel>Nombre *</FormLabel>

										<FormControl>
											<Input
												placeholder="Ingresa el nombre del período"
												{ ...field }
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								) }
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Tipo */}
							<FormField
								control = { form.control }
								name    = "type"
								render  = {({ field }) => (
									<FormItem>
										<FormLabel>Tipo *</FormLabel>

										<Select onValueChange={ field.onChange } value={ field.value }>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona el tipo de período" />
												</SelectTrigger>
											</FormControl>

											<SelectContent>
												{ getTypeOptions().map(( option ) => (
													<SelectItem key={ option.value } value={ option.value }>
														{ option.label }
													</SelectItem>
												))}
											</SelectContent>
										</Select>

										<FormMessage />
									</FormItem>
								) }
							/>

							{/* Centro de Costos */}
							<FormField
								control = { form.control }
								name    = "costCenterId"
								render  = { ({ field }) => (
									<FormItem>
										<FormLabel>Centro de Costos *</FormLabel>

										<FormControl>
											<CostCenterSelect
												defaultValues       = { field.value }
												onSelectionChange   = { field.onChange }
												multiple            = { false }
												placeholder         = "Selecciona el centro de costos"
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								) }
							/>
						</div>

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
                                                disabled    = {( date ) => {
                                                    const endDate = form.watch( 'endDate' );

                                                    return date < new Date() || ( endDate ? date > endDate : false );
                                                }}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								) }
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
												disabled    = {( date ) => {
													const startDate = form.watch( 'startDate' );
													return date < new Date() || ( startDate ? date <= startDate : false );
												}}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								) }
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Fecha de Apertura */}
							<FormField
								control = { form.control }
								name    = "openingDate"
								render  = {({ field }) => (
									<FormItem>
										<FormLabel>Fecha de Apertura</FormLabel>

										<FormControl>
											<CalendarSelect
												value       = { field.value }
												onSelect    = { field.onChange }
												placeholder = "Seleccionar fecha de apertura"
                                                disabled    = {( date ) => {  
                                                    const startDate = form.watch( 'startDate' );
                                                    const endDate   = form.watch( 'endDate' );

                                                    if ( !startDate || !endDate ) {
                                                        return true;
                                                    }

                                                    return date < startDate || date > endDate;
                                                }}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								) }
							/>

							{/* Fecha de Cierre */}
							<FormField
								control={ form.control }
								name="closingDate"
								render={ ({ field }) => (
									<FormItem>
										<FormLabel>Fecha de Cierre</FormLabel>
										<FormControl>
											<CalendarSelect
												value       = { field.value }
												onSelect    = { field.onChange }
												placeholder = "Seleccionar fecha de cierre"
                                                disabled    = {( date ) => {
                                                    const openingDate   = form.watch( 'openingDate' );
                                                    const endDate       = form.watch( 'endDate' );

                                                    if ( !openingDate || !endDate ) {
                                                        return true;
                                                    }

                                                    return date <= openingDate || date > endDate;
                                                }}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								) }
							/>
						</div>

						{/* Estado - Solo mostrar en edición */}
						{ isEditing && (
							<FormField
								control={ form.control }
								name="status"
								render={ ({ field }) => (
									<FormItem>
										<FormLabel>Estado</FormLabel>

										<Select onValueChange={ field.onChange } value={ field.value }>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Selecciona el estado" />
												</SelectTrigger>
											</FormControl>

											<SelectContent>
												{ getStatusOptions().map( ( option ) => (
													<SelectItem key={ option.value } value={ option.value }>
														{ option.label }
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								) }
							/>
						) }

						<DialogFooter className="flex justify-between items-center gap-4">
							<Button
								type        = "button"
								variant     = "outline"
								onClick     = { onClose }
								disabled    = { createPeriodMutation.isPending || updatePeriodMutation.isPending }
							>
								Cancelar
							</Button>

							<Button
								type        = "submit"
								disabled    = { createPeriodMutation.isPending || updatePeriodMutation.isPending }
							>
								{ createPeriodMutation.isPending || updatePeriodMutation.isPending
									? ( isEditing ? 'Actualizando...' : 'Creando...' )
									: ( isEditing ? 'Actualizar' : 'Crear' )
								}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
