"use client"

import { JSX, useEffect, useState } from "react"

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
}									from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
}									from "@/components/ui/form";
import { Button }					from "@/components/ui/button";
import { Switch }					from "@/components/ui/switch";
import { Textarea }					from "@/components/ui/textarea";
import { Label }					from "@/components/ui/label";
import { ProfessorSelect }			from "@/components/shared/item-select/professor-select";
import { SpaceSelect }				from "@/components/shared/item-select/space-select";
import { HeadquartersSelect }		from "@/components/shared/item-select/headquarters-select";
import { SizeSelect }				from "@/components/shared/item-select/size-select";
import { SpaceTypeSelect }			from "@/components/shared/item-select/space-type-select";
import { Checkbox }					from "@/components/ui/checkbox";

import { RequestSession }			from "@/types/request-session.model";
import { Session }					from "@/types/section.model";
import { KEY_QUERYS }				from "@/consts/key-queries";
import { Method, fetchApi }			from "@/services/fetch";
import { errorToast, successToast }	from "@/config/toast/toast.config";


interface Props {
	requestSession	: RequestSession | undefined;
	onSuccess		: () => void;
	onCancel		: () => void;
	isOpen			: boolean;
	onClose			: () => void;
	requestId		: string;
}


const sessionLabels: Record<Session, string> = {
	[Session.C]	: 'Cátedra',
	[Session.A]	: 'Ayudantía',
	[Session.T]	: 'Taller',
	[Session.L]	: 'Laboratorio',
};


// Zod schema for request session edit validation
const requestSessionEditSchema = z.object({
	professorId		: z.string().nullable(),
	building		: z.string().nullable(),
	spaceId			: z.string().nullable(),
	spaceType		: z.string().nullable(),
	spaceSizeId		: z.string().nullable(),
	isEnglish		: z.boolean(),
	isConsecutive	: z.boolean(),
	inAfternoon		: z.boolean(),
	description		: z.string().nullable(),
}).refine(
	( data ) => data.spaceId !== null || data.spaceType !== null || data.spaceSizeId !== null,
	{
		message	: "Debe seleccionar al menos un filtro: Espacio específico, Tipo de espacio o Tamaño",
		path	: ["spaceId"],
	}
);


type RequestSessionEditFormValues = z.infer<typeof requestSessionEditSchema>;


export function RequestSessionEditForm({
	requestSession,
	onSuccess,
	onCancel,
	isOpen,
	onClose,
	requestId,
}: Props ): JSX.Element {
	const queryClient							= useQueryClient();
	const [filterType, setFilterType]			= useState<'type' | 'size' | 'space'>( 'space' );
	const [selectedBuilding, setSelectedBuilding] = useState<string | null>( null );


	const form = useForm<RequestSessionEditFormValues>({
		resolver	: zodResolver( requestSessionEditSchema ),
		defaultValues: {
			professorId		: null,
			building		: null,
			spaceId			: null,
			spaceType		: null,
			spaceSizeId		: null,
			isEnglish		: false,
			isConsecutive	: false,
			inAfternoon		: false,
			description		: null,
		},
	});


	// Update form when requestSession changes
	useEffect(() => {
		if ( requestSession ) {
			// Set building first
			const building = requestSession.building || null;
			setSelectedBuilding( building );

			form.reset({
				professorId		: requestSession.professor?.id || null,
				building		: building,
				spaceId			: requestSession.spaceId,
				spaceType		: requestSession.spaceType,
				spaceSizeId		: requestSession.spaceSize?.id || null,
				isEnglish		: requestSession.isEnglish,
				isConsecutive	: requestSession.isConsecutive,
				inAfternoon		: requestSession.inAfternoon,
				description		: requestSession.description,
			});

			// Determine filter type
			if ( requestSession.spaceId ) {
				setFilterType( 'space' );
			} else if ( requestSession.spaceType ) {
				setFilterType( 'type' );
			} else if ( requestSession.spaceSize ) {
				setFilterType( 'size' );
			}
		}
	}, [ requestSession, form ]);


	// Update mutation
	const updateRequestSessionMutation = useMutation({
		mutationFn: async ( values: RequestSessionEditFormValues ) => {
			return fetchApi({
				url		: `request-sessions/${requestSession?.id}`,
				method	: Method.PATCH,
				body	: {
					professorId		: values.professorId,
					spaceId			: values.spaceId,
					spaceType		: values.spaceType,
					spaceSizeId		: values.spaceSizeId,
					isEnglish		: values.isEnglish,
					isConsecutive	: values.isConsecutive,
					inAfternoon		: values.inAfternoon,
					description		: values.description,
				},
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUEST_SESSION, requestId ] });
			toast( 'Sesión actualizada exitosamente', successToast );
			onSuccess();
		},
		onError: ( error: Error ) => {
			toast( `Error al actualizar sesión: ${error.message}`, errorToast );
		},
	});


	const onSubmit = ( values: RequestSessionEditFormValues ) => {
		updateRequestSessionMutation.mutate( values );
	};


	const handleFilterTypeChange = ( newFilterType: 'type' | 'size' | 'space' ) => {
		setFilterType( newFilterType );

		// Clear other options
		if ( newFilterType === 'space' ) {
			form.setValue( 'spaceType', null );
			form.setValue( 'spaceSizeId', null );
		} else if ( newFilterType === 'type' ) {
			form.setValue( 'spaceId', null );
			form.setValue( 'spaceSizeId', null );
		} else if ( newFilterType === 'size' ) {
			form.setValue( 'spaceType', null );
			form.setValue( 'spaceId', null );
		}
	};


	const handleBuildingChange = ( buildingId: string | null ) => {
		setSelectedBuilding( buildingId );
		form.setValue( 'building', buildingId );

		// Clear space filters when building changes
		form.setValue( 'spaceType', null );
		form.setValue( 'spaceSizeId', null );
		form.setValue( 'spaceId', null );

		// Reset filter type to space
		setFilterType( 'space' );
	};


	return (
		<Dialog open={ isOpen } onOpenChange={ onClose }>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						Editar Sesión - { requestSession ? sessionLabels[requestSession.session] : '' }
					</DialogTitle>

					<DialogDescription>
						Modifica los datos de la sesión de solicitud
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={ form.handleSubmit( onSubmit ) } className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

						{/* Selector de tipo de filtro (Type, Size, Space) */}
						{selectedBuilding && (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
								{/* Espacio Específico */}
								<div className="flex gap-2 items-end">
									<Checkbox
										className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center mb-2"
										checked			= { filterType === 'space' }
										onCheckedChange	= {( checked ) => {
											if ( checked ) {
												handleFilterTypeChange( 'space' );
											}
										}}
									/>

									<div className="w-full">
										<FormField
											control	= { form.control }
											name	= "spaceId"
											render	= {({ field }) => (
												<FormItem>
													<FormLabel>Espacio Específico</FormLabel>

													<FormControl>
														<SpaceSelect
															multiple			= { false }
															placeholder			= "Seleccionar espacio"
															defaultValues		= { field.value || undefined }
															onSelectionChange	= {( value ) => {
																const spaceId = typeof value === 'string' ? value : null;
																field.onChange( spaceId );
															}}
															buildingFilter		= { selectedBuilding || undefined }
															disabled			= { filterType !== 'space' }
														/>
													</FormControl>

													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								{/* Tipo de Espacio */}
								<div className="flex gap-2 items-end">
									<Checkbox
										className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center mb-2"
										checked			= { filterType === 'type' }
										onCheckedChange	= {( checked ) => {
											if ( checked ) {
												handleFilterTypeChange( 'type' );
											}
										}}
									/>

									<div className="w-full">
										<FormField
											control	= { form.control }
											name	= "spaceType"
											render	= {({ field }) => (
												<FormItem>
													<FormLabel>Tipo de Espacio</FormLabel>

													<FormControl>
														<SpaceTypeSelect
															multiple			= { false }
															placeholder			= "Seleccionar tipo"
															defaultValues		= { field.value || undefined }
															onSelectionChange	= {( value ) => {
																const spaceType = ( typeof value === 'string' && value !== 'none' ) ? value : null;
																field.onChange( spaceType );
															}}
															buildingFilter		= { selectedBuilding || undefined }
															disabled			= { filterType !== 'type' }
														/>
													</FormControl>

													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								{/* Tamaño */}
								<div className="flex gap-2 items-end">
									<Checkbox
										className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center mb-2"
										checked			= { filterType === 'size' }
										onCheckedChange	= {( checked ) => {
											if ( checked ) {
												handleFilterTypeChange( 'size' );
											}
										}}
									/>

									<div className="w-full">
										<FormField
											control	= { form.control }
											name	= "spaceSizeId"
											render	= {({ field }) => (
												<FormItem>
													<FormLabel>Tamaño</FormLabel>

													<FormControl>
														<SizeSelect
															multiple			= { false }
															placeholder			= "Seleccionar tamaño"
															defaultValues		= { field.value || undefined }
															onSelectionChange	= {( value ) => {
																const sizeId = typeof value === 'string' ? value : null;
																field.onChange( sizeId );
															}}
															buildingFilter		= { selectedBuilding || undefined }
															disabled			= { filterType !== 'size' }
														/>
													</FormControl>

													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
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
													checked			= { field.value }
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
													checked			= { field.value }
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
													checked			= { field.value }
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
									<FormLabel>Descripción de la sesión</FormLabel>

									<FormControl>
										<Textarea
											placeholder	= "Descripción opcional"
											value		= { field.value || '' }
											onChange	= { field.onChange }
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="flex justify-between border-t pt-4">
							<Button
								type		= "button"
								variant		= "outline"
								onClick		= { onCancel }
								disabled	= { updateRequestSessionMutation.isPending }
							>
								Cancelar
							</Button>

							<Button
								type		= "submit"
								disabled	= { updateRequestSessionMutation.isPending }
							>
								{ updateRequestSessionMutation.isPending ? 'Guardando...' : 'Guardar Cambios' }
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
