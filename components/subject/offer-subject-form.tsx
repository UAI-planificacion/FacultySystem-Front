'use client'

import { JSX, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

import {
	Dialog,
	DialogContent,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { SubjectSelect } from "@/components/shared/item-select/subject-select";
import { PeriodSelect } from "@/components/shared/item-select/period-select";
import { SpaceTypeSelect } from "@/components/shared/item-select/space-type-select";
import { SizeSelect } from "@/components/shared/item-select/size-select";
import { CostCenterSelect } from "@/components/shared/item-select/cost-center";
import { SessionButton } from "@/components/section/session-button";

import { Subject } from "@/types/subject.model";
import { Period } from "@/types/periods.model";
import { SpaceType, Size } from "@/types/request-detail.model";
import { Session } from "@/types/section.model";
import { KEY_QUERYS } from "@/consts/key-queries";
import { fetchApi } from "@/services/fetch";
// Schema de validación
const offerSubjectSchema = z.object({
	subjectId       : z.string().min(1, "Debe seleccionar una asignatura"),
	periodId        : z.string().min(1, "Debe seleccionar un período"),
	numberOfSections: z.number().min(1, "El número de secciones debe ser mayor o igual a 1").max(100, "El número de secciones no puede ser mayor a 100"),
	costCenterId    : z.string().optional().nullable(),
	spaceType       : z.nativeEnum(SpaceType).optional().nullable(),
	spaceSizeId     : z.nativeEnum(Size).nullable().optional(),
	workshop        : z.number().min(0, "El taller debe ser mayor o igual a 0"),
	lecture         : z.number().min(0, "La conferencia debe ser mayor o igual a 0"),
	tutoringSession : z.number().min(0, "La sesión tutorial debe ser mayor o igual a 0"),
	laboratory      : z.number().min(0, "El laboratorio debe ser mayor o igual a 0"),
	startDate       : z.string().min(1, "La fecha de inicio es requerida"),
	endDate         : z.string().min(1, "La fecha de fin es requerida"),
});

type OfferSubjectFormValues = z.infer<typeof offerSubjectSchema>;

interface Props {
	facultyId       : string;
	subject?        : Subject;
	onSubmit        : (data: OfferSubjectFormValues) => void;
	isOpen          : boolean;
	onClose         : () => void;
}

const emptyOfferSubject = (subject: Subject | undefined): OfferSubjectFormValues => {
	return {
		subjectId       : subject?.id || "",
		periodId        : "",
		numberOfSections: 1,
		costCenterId    : "",
		spaceType       : subject?.spaceType || null,
		spaceSizeId     : subject?.spaceSizeId || null,
		workshop        : subject?.workshop || 0,
		lecture         : subject?.lecture || 0,
		tutoringSession : subject?.tutoringSession || 0,
		laboratory      : subject?.laboratory || 0,
		startDate       : "",
		endDate         : "",
	};
};

export function OfferSubjectForm({
	facultyId,
	subject,
	onSubmit,
	isOpen,
	onClose,
}: Props): JSX.Element {
	const form = useForm<OfferSubjectFormValues>({
		resolver: zodResolver(offerSubjectSchema),
		defaultValues: emptyOfferSubject(subject),
	});

	// Query para obtener asignaturas de la facultad
	const { data: subjects } = useQuery<Subject[]>({
		queryKey: [KEY_QUERYS.SUBJECTS, facultyId],
		queryFn: () => fetchApi({ url: `subjects/all/${facultyId}` }),
		enabled: isOpen,
	});

	// Query para obtener períodos
	const { data: periods } = useQuery<Period[]>({
		queryKey: [KEY_QUERYS.PERIODS],
		queryFn: () => fetchApi<Period[]>({ url: 'periods' }),
		enabled: isOpen,
	});

	// Resetear formulario cuando cambia la asignatura prop
	useEffect(() => {
		form.reset(emptyOfferSubject(subject));
	}, [subject, form, isOpen]);

	// Obtener asignatura seleccionada
	const selectedSubject = useMemo(() => {
		const subjectId = form.watch('subjectId');
		return subjects?.find(s => s.id === subjectId);
	}, [subjects, form.watch('subjectId')]);

	// Obtener período seleccionado
	const selectedPeriod = useMemo(() => {
		const periodId = form.watch('periodId');
		return periods?.find(p => p.id === periodId);
	}, [periods, form.watch('periodId')]);

	// Cargar datos de la asignatura seleccionada
	useEffect(() => {
		if (selectedSubject) {
			form.setValue('spaceType', selectedSubject.spaceType);
			form.setValue('spaceSizeId', selectedSubject.spaceSizeId);
			form.setValue('workshop', selectedSubject.workshop);
			form.setValue('lecture', selectedSubject.lecture);
			form.setValue('tutoringSession', selectedSubject.tutoringSession);
			form.setValue('laboratory', selectedSubject.laboratory);
		}
	}, [selectedSubject, form]);

	// Cargar fechas y centro de costo del período seleccionado
	useEffect(() => {
		if (selectedPeriod) {
			const startDate = selectedPeriod.startDate ? 
				new Date(selectedPeriod.startDate).toISOString().split('T')[0] : '';
			const endDate = selectedPeriod.endDate ? 
				new Date(selectedPeriod.endDate).toISOString().split('T')[0] : '';
			
			form.setValue('startDate', startDate);
			form.setValue('endDate', endDate);
			
			// Cargar centro de costo del período si existe
			if (selectedPeriod.costCenterId) {
				form.setValue('costCenterId', selectedPeriod.costCenterId);
			}
		}
	}, [selectedPeriod, form]);

	/**
	 * Get form field name for session type
	 */
	function getSessionFieldName(session: Session): keyof OfferSubjectFormValues {
		switch (session) {
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
	function updateSessionCount(_: string, session: Session, delta: number): void {
		const currentValue = form.getValues(getSessionFieldName(session));
		const newValue = Math.max(0, (Number(currentValue) ?? 0) + delta);
		form.setValue(getSessionFieldName(session), newValue);
	}

	/**
	 * Set session count to specific value
	 */
	function setSessionCount(_: string, session: Session, value: string): void {
		const numValue = parseInt(value) || 0;
		form.setValue(getSessionFieldName(session), Math.max(0, numValue));
	}

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
		onSubmit(data);
		form.reset();
	};

	const hasSelectedSubject = !!form.watch('subjectId');
	const hasSelectedPeriod = !!form.watch('periodId');

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Ofertar Asignatura</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Selección de Asignatura */}
							<FormField
								control={form.control}
								name="subjectId"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<SubjectSelect
												label="Asignatura *"
												placeholder="Seleccionar asignatura"
												onSelectionChange={(value) => field.onChange(value)}
												defaultValues={field.value ? [field.value] : []}
												multiple={false}
												url={facultyId}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Selección de Período */}
							<FormField
								control={form.control}
								name="periodId"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<PeriodSelect
												label="Período *"
												placeholder="Seleccionar período"
												onSelectionChange={(value) => field.onChange(value)}
												defaultValues={field.value ? [field.value] : []}
												multiple={false}
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
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
								{/* <Label>Sesiones</Label> */}
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
                            </div>

						)}

						{/* Campos habilitados solo cuando hay período seleccionado */}
						{hasSelectedPeriod && (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{/* Fecha de Inicio */}
								<FormField
									control = { form.control }
									name    = "startDate"
									render  = {({ field }) => (
										<FormItem>
											<FormLabel>Fecha de Inicio *</FormLabel>

											<FormControl>
												<Input
													type="date"
													{...field}
													className="w-full"
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
												<Input
													type="date"
													{...field}
													className="w-full"
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Centro de Costo */}
								<FormField
									control = { form.control }
									name    = "costCenterId"
									render  = {({ field }) => (
										<FormItem>
											<FormControl>
												<CostCenterSelect
													label               = "Centro de Costo"
													placeholder         = "Seleccionar centro de costo"
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
								disabled    = { !hasSelectedSubject || !hasSelectedPeriod }
							>
								Crear Oferta
							</Button>
                        </DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
