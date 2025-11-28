'use client'

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Day } from "@/types/day.model";
import { KEY_QUERYS } from "@/consts/key-queries";
import { Method, fetchApi } from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";


const endpoint = 'days';


/**
 * Schema de validación para el formulario de día
 */
const daySchema = z.object({
	id         : z.string().min( 1, "El ID es requerido" ),
	name       : z.string().min( 1, "El nombre es requerido" ),
	shortName  : z.string().optional(),
	mediumName : z.string().optional(),
});


type DayFormData = z.infer<typeof daySchema>;


interface DayFormProps {
	day     ?: Day;
	isOpen   : boolean;
	onClose  : () => void;
}


/**
 * Formulario para editar días (solo edición, no creación)
 */
export function DayForm( { day, isOpen, onClose }: DayFormProps ) {
	const queryClient = useQueryClient();

	const form = useForm<DayFormData>({
		resolver      : zodResolver( daySchema ),
		defaultValues : {
			id         : '',
			name       : '',
			shortName  : '',
			mediumName : '',
		},
	});


	/**
	 * Resetea el formulario cuando se abre/cierra o cambia el día
	 */
	useEffect( () => {
		if ( isOpen && day ) {
			form.reset({
				id         : String( day.id ),
				name       : day.name,
				shortName  : day.shortName || '',
				mediumName : day.mediumName || '',
			});
		}
	}, [isOpen, day, form] );


	/**
	 * API call para actualizar un día
	 */
	const updateDayApi = async ( data: DayFormData ): Promise<Day> =>
		fetchApi<Day>({
			url    : `${endpoint}/${data.id}`,
			method : Method.PATCH,
			body   : data,
		});


	/**
	 * Mutación para actualizar día
	 */
	const updateDayMutation = useMutation<Day, Error, DayFormData>({
		mutationFn : updateDayApi,
		onSuccess  : () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.DAYS] });
			toast( 'Día actualizado exitosamente', successToast );
			onClose();
		},
		onError: ( mutationError ) => {
			toast( `Error al actualizar día: ${mutationError.message}`, errorToast );
		},
	});


	/**
	 * Maneja el envío del formulario
	 */
	const onSubmit = ( data: DayFormData ) => {
		updateDayMutation.mutate( data );
	};


	return (
		<Dialog open={ isOpen } onOpenChange={ onClose }>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Editar Día</DialogTitle>
					<DialogDescription>
						Modifica los datos del día seleccionado.
					</DialogDescription>
				</DialogHeader>

				<Form { ...form }>
					<form onSubmit={ form.handleSubmit( onSubmit ) } className="space-y-4">
						{/* ID - Solo lectura */}
						<FormField
							control={ form.control }
							name="id"
							render={ ({ field }) => (
								<FormItem>
									<FormLabel>ID</FormLabel>
									<FormControl>
										<Input
											placeholder="ID del día"
											disabled={ true }
											{ ...field }
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							) }
						/>

						{/* Nombre */}
						<FormField
							control={ form.control }
							name="name"
							render={ ({ field }) => (
								<FormItem>
									<FormLabel>Nombre *</FormLabel>
									<FormControl>
										<Input
											placeholder="Ingresa el nombre del día"
											{ ...field }
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							) }
						/>

						{/* Nombre Corto */}
						<FormField
							control={ form.control }
							name="shortName"
							render={ ({ field }) => (
								<FormItem>
									<FormLabel>Nombre Corto</FormLabel>
									<FormControl>
										<Input
											placeholder="Ingresa el nombre corto"
											{ ...field }
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							) }
						/>

						{/* Nombre Mediano */}
						<FormField
							control={ form.control }
							name="mediumName"
							render={ ({ field }) => (
								<FormItem>
									<FormLabel>Nombre Mediano</FormLabel>
									<FormControl>
										<Input
											placeholder="Ingresa el nombre mediano"
											{ ...field }
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							) }
						/>

						<DialogFooter className="flex items-center justify-between gap-4">
							<Button
								type        = "button"
								variant     = "outline"
								onClick     = { onClose }
								disabled    = { updateDayMutation.isPending }
							>
								Cancelar
							</Button>

							<Button
								type        = "submit"
								disabled    = { updateDayMutation.isPending }
							>
								{ updateDayMutation.isPending ? 'Actualizando...' : 'Actualizar' }
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
