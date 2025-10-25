"use client"

import {
	JSX,
	useEffect,
	useState
}						from "react";
import { useRouter }	from 'next/navigation';

import {
	useMutation,
	useQueryClient
}						from "@tanstack/react-query";
import { toast }		from "sonner";

import {
    Grid2x2,
    Plus,
}                       from "lucide-react";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import * as z           from "zod";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                         from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                         from "@/components/ui/form";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                           from "@/components/ui/tabs";
import { Button }           from "@/components/ui/button";
import { Input }            from "@/components/ui/input";
import { Textarea }         from "@/components/ui/textarea";
import { Switch }           from "@/components/ui/switch";
import { SubjectUpload }    from "@/components/subject/subject-upload";
import { SizeSelect }       from "@/components/shared/item-select/size-select";
import { SpaceTypeSelect }  from "@/components/shared/item-select/space-type-select";
import { GradeSelect }      from "@/components/shared/item-select/grade-select";
import { GradeForm }        from "@/components/grade/grade-form";
import { SessionButton }    from "@/components/session/session-button";

import {
	Subject,
	CreateSubject,
	UpdateSubject
}									from "@/types/subject.model";
import { Session }					from "@/types/section.model";
import { KEY_QUERYS }				from "@/consts/key-queries";
import { Method, fetchApi }			from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { updateFacultyTotal }		from "@/app/faculties/page";
import { Size, SpaceType }          from "@/types/request-detail.model";


export type SubjectFormValues = z.infer<typeof formSchema>;


interface SubjectFormProps {
	subject?	: Subject;
	facultyId	: string;
	isOpen		: boolean;
	onClose		: () => void;
}


const formSchema = z.object({
    id: z.string().min(2, {
        message: "El código de la asignatura debe tener al menos 2 caracteres.",
    }).max(30, {
        message: "El código de la asignatura debe tener como máximo 30 caracteres."
    }),
    name: z.string().min(2, {
        message: "El nombre de la asignatura debe tener al menos 2 caracteres.",
    }).max(200, {
        message: "El nombre de la asignatura debe tener como máximo 200 caracteres."
    }),
    spaceType       : z.nativeEnum( SpaceType ).optional().nullable(),
    spaceSizeId     : z.nativeEnum( Size ).nullable().optional(),
    gradeId         : z.string().nullable().optional(),
    workshop        : z.number().min( 0, "El taller debe ser mayor o igual a 0" ),
    lecture         : z.number().min( 0, "La conferencia debe ser mayor o igual a 0" ),
    tutoringSession : z.number().min( 0, "La sesión tutorial debe ser mayor o igual a 0" ),
    laboratory      : z.number().min( 0, "El laboratorio debe ser mayor o igual a 0" ),
    isActive        : z.boolean(),
}).refine(( data ) => {
    const { workshop, lecture, tutoringSession, laboratory } = data;

    return workshop > 0 || lecture > 0 || tutoringSession > 0 || laboratory > 0;
}, {
    message : "Al menos una sesión debe ser mayor que 0",
    path    : [ "workshop" ],
});


const emptySubject = ( subject: Subject | undefined ): SubjectFormValues => {
    return {
        id              : subject?.id               || "",
        name            : subject?.name             || "",
        spaceType       : subject?.spaceType        || null,
        spaceSizeId     : subject?.spaceSizeId      || null,
        gradeId         : subject?.grade?.id        || null,
        workshop        : subject?.workshop         || 0,
        lecture         : subject?.lecture          || 0,
        tutoringSession : subject?.tutoringSession  || 0,
        laboratory      : subject?.laboratory       || 0,
        isActive        : subject?.isActive         ?? true,
    };
};


export function SubjectForm({
	subject,
	facultyId,
	isOpen,
	onClose,
}: SubjectFormProps ): JSX.Element {
	const router								= useRouter();
	const queryClient							= useQueryClient();
	const [isGradeFormOpen, setIsGradeFormOpen]	= useState( false );
	const form									= useForm<SubjectFormValues>({
		resolver		: zodResolver( formSchema ),
		defaultValues	: emptySubject( subject ),
		mode			: "onChange",
	});


	useEffect(() => {
		form.reset( emptySubject( subject ));
	}, [ subject, form, isOpen ]);


	// API functions
	const createSubjectApi = async ( newSubject: CreateSubject ): Promise<Subject> =>
		fetchApi<Subject>({ url: `subjects`, method: Method.POST, body: newSubject });


	const updateSubjectApi = async ( updatedSubject: UpdateSubject ): Promise<Subject> =>
		fetchApi<Subject>({ url: `subjects/${updatedSubject.id}`, method: Method.PATCH, body: updatedSubject });


	// Success handler
	function handleSuccess( isCreated: boolean ): void {
		queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SUBJECTS, facultyId] });
		if ( isCreated ) updateFacultyTotal( queryClient, facultyId, true, 'totalSubjects' );
		onClose();
		form.reset();
		toast( `Asignatura ${isCreated ? 'creada' : 'actualizada'} exitosamente`, successToast );
	}


	// Mutations
	const createSubjectMutation = useMutation<Subject, Error, CreateSubject>({
		mutationFn	: createSubjectApi,
		onSuccess	: () => handleSuccess( true ),
		onError		: ( mutationError ) => toast( `Error al crear asignatura: ${mutationError.message}`, errorToast ),
	});


	const updateSubjectMutation = useMutation<Subject, Error, UpdateSubject>({
		mutationFn	: updateSubjectApi,
		onSuccess	: () => handleSuccess( false ),
		onError		: ( mutationError ) => toast( `Error al actualizar asignatura: ${mutationError.message}`, errorToast ),
	});


	// Form submit handler
	const handleSubmit = ( data: SubjectFormValues ) => {
		if ( subject ) {
			updateSubjectMutation.mutate({
				...data,
			} as UpdateSubject );
		} else {
			createSubjectMutation.mutate({
				...data,
				facultyId,
			} as CreateSubject );
		}
	};


	/**
	 * Get form field name for session type
	 */
	function getSessionFieldName( session: Session ): keyof SubjectFormValues {
		switch ( session ) {
			case Session.C: return 'lecture';
			case Session.A: return 'tutoringSession';
			case Session.T: return 'workshop';
			case Session.L: return 'laboratory';
			default: return 'lecture';
		}
	}


	/**
	 * Update session count by delta
	 */
	function updateSessionCount( _: string, session: Session, delta: number ): void {
		const currentValue = form.getValues( getSessionFieldName( session ));
		const newValue = Math.max( 0, (Number(currentValue) ?? 0) + delta );
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
	 * Create mock section data for SessionButton
	 */
	function createMockSection(): any {
		const watchedValues = form.watch();
		return {
			id              : 'subject-form',
			workshop        : watchedValues.workshop        || 0,
			lecture         : watchedValues.lecture         || 0,
			tutoringSession : watchedValues.tutoringSession || 0,
			laboratory      : watchedValues.laboratory      || 0,
			sessionCounts   : {
				[Session.C]     : watchedValues.lecture         || 0,
				[Session.A]     : watchedValues.tutoringSession || 0,
				[Session.T]     : watchedValues.workshop        || 0,
				[Session.L]     : watchedValues.laboratory      || 0,
			}
		};
	}


	return (
		<Dialog open={ isOpen } onOpenChange={ onClose }>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{ subject ? "Editar Asignatura" : "Crear Asignatura" }
					</DialogTitle>

					<DialogDescription>
						{ subject
							? "Modifica los datos de la asignatura."
							: "Completa los datos para crear una nueva asignatura."
						}
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="form" className="w-full">
					{ !subject &&
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="form">Formulario</TabsTrigger>
							<TabsTrigger value="file">Archivo</TabsTrigger>
						</TabsList>
					}

					<TabsContent value="form">
						<Form {...form}>
							<form onSubmit={ form.handleSubmit( handleSubmit )} className="space-y-4">
								<FormField
									control = { form.control }
									name    = "id"
									render  = {({ field }) => (
										<FormItem>
											<FormLabel>Código de la Asignatura</FormLabel>

											<FormControl>
												<Input
													placeholder = "Ej: MAT101"
													{...field}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control = { form.control }
									name    = "name"
									render  = {({ field }) => (
										<FormItem>
											<FormLabel>Nombre de la Asignatura</FormLabel>

											<FormControl>
												<Textarea
													placeholder = "Ej: Matemáticas I"
													{...field}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
									<FormField
										control = { form.control }
										name    = "gradeId"
										render  = {({ field }) => (
											<FormItem>
												<div className="flex gap-2 items-end">
													<div className="flex-1">
														<GradeSelect
															label               = "Grado"
															placeholder         = "Seleccionar grado"
															onSelectionChange   = {( value ) => {
																field.onChange( value === "none" ? null : value as string );
															}}
															defaultValues       = { field.value || "none" }
															multiple            = { false }
														/>
													</div>

													<Button
														variant = "outline"
														size    = "icon"
														onClick = {() => setIsGradeFormOpen( true )}
														type    = "button"
													>
														<Plus className="h-4 w-4" />
													</Button>
												</div>

												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control = { form.control }
										name    = "spaceType"
										render  = {({ field }) => (
											<FormItem>
												<SpaceTypeSelect
													label               = "Tipo de Espacio"
													defaultValues       = { field.value || "none" }
													onSelectionChange   = {( value ) => {
														field.onChange( value === "none" ? null : value );

														if ( value !== SpaceType.ROOM ) {
															form.setValue("spaceSizeId", null);
														}
													}}
												/>

												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control = { form.control }
										name    = "spaceSizeId"
										render  = {({ field }) => {
											const spaceType     = form.watch( 'spaceType' );
											const isDisabled    = spaceType !== SpaceType.ROOM;

											return (
												<FormItem>
													<SizeSelect
														label               = "Tamaño del Espacio"
														placeholder         = "Seleciona un tamaño"
														onSelectionChange   = {( value ) => {
															field.onChange( value === "none" ? null : value as string );
														}}
														defaultValues       = { field.value || "none" }
														multiple            = { false }
														disabled            = { isDisabled }
													/>

													<FormMessage />
												</FormItem>
											);
										}}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

								<FormField
									control = { form.control }
									name    = "workshop"
									render  = {({ fieldState }) => (
										<FormItem>
											{fieldState.error && (
												<FormMessage className="text-start">
													{fieldState.error.message}
												</FormMessage>
											)}
										</FormItem>
									)}
								/>

								{ subject && 
									<FormField
										control = { form.control }
										name    = "isActive"
										render  = {({ field }) => (
											<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
												<div className="space-y-0.5">
													<FormLabel className="text-base">
														Asignatura Activa
													</FormLabel>

													<FormDescription>
														Marcar si la asignatura está activa
													</FormDescription>
												</div>

												<FormControl>
													<Switch
														checked         = { field.value }
														onCheckedChange = { field.onChange }
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								}

								<div className="flex justify-between space-x-2">
									<Button
										type    = "button"
										variant = "outline"
										onClick = { onClose }
									>
										Cancelar
									</Button>

									<div className="flex gap-2 items-center">
										{subject &&
											<Button
												variant     = "outline"
												onClick     = { () => router.push( `/sections?subject=${subject.id}` )}
												type        = "button"
												className   = "gap-2"
											>
												<Grid2x2 className="w-5 h-5" />
												Ver Secciones
											</Button>
										}

										<Button
											type        = "submit"
											disabled    = { createSubjectMutation.isPending || updateSubjectMutation.isPending }
										>
											{ subject ? "Actualizar" : "Crear" }
										</Button>
									</div>
								</div>
							</form>
						</Form>
					</TabsContent>

					{ !subject &&
						<TabsContent value="file">
							<SubjectUpload
								isUploading = { false }
								onSuccess   = { onClose }
							/>
						</TabsContent>
					}
				</Tabs>
			</DialogContent>

			<GradeForm
				isOpen  = { isGradeFormOpen }
				onClose = {() => setIsGradeFormOpen( false )}
			/>
		</Dialog>
	);
}
