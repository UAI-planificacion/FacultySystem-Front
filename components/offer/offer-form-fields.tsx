'use client'

import { JSX, useEffect, useMemo, useState }        from "react";
import { Control, UseFormSetValue, UseFormWatch }   from "react-hook-form";

import { useQuery }	from "@tanstack/react-query";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
}                               from "@/components/ui/form";
import { Input }				from "@/components/ui/input";
import { CalendarSelect }		from "@/components/ui/calendar-select";
import { SubjectSelect }		from "@/components/shared/item-select/subject-select";
import { PeriodSelect }			from "@/components/shared/item-select/period-select";
import { ProfessorSelect }		from "@/components/shared/item-select/professor-select";
import { BuildingSelect }		from "@/components/shared/item-select/building-select";
import { SessionButton }		from "@/components/session/session-button";
import { SpaceFilterSelector }  from "@/components/shared/space-filter-selector";

import { Subject }		from "@/types/subject.model";
import { Period }		from "@/types/periods.model";
import { Session }		from "@/types/section.model";
import { KEY_QUERYS }	from "@/consts/key-queries";
import { fetchApi }		from "@/services/fetch";


interface Props {
	facultyId?		: string | null;
	index			: number;
	fieldPrefix		: string;
	control			: Control<any>;
	watch			: UseFormWatch<any>;
	setValue		: UseFormSetValue<any>;
	getValues		: any;
	isEnabled?		: boolean;
	subjectId?		: string | null;
	periodId?		: string | null;
}

/**
 * Reusable form fields component for offer subject
 * Can be used in both single (dialog) and bulk (array) modes
 */
export function OfferFormFields({
	facultyId,
	index,
	fieldPrefix,
	control,
	watch,
	setValue,
	getValues,
	isEnabled = true,
	subjectId,
	periodId,
}: Props ): JSX.Element {
	const [filterMode] = useState<'type-size'>( 'type-size' );
    const facultyIdUrl =  `${KEY_QUERYS.SUBJECTS}${ facultyId ? `/all/${facultyId}` : '' }`;
	const { data: subjects = [] } = useQuery<Subject[]>({
		queryKey	: [KEY_QUERYS.SUBJECTS, facultyId],
		queryFn		: () => fetchApi({ url: facultyIdUrl }),
		enabled		: isEnabled,
	});


    const { data: periods } = useQuery<Period[]>({
		queryKey	: [KEY_QUERYS.PERIODS],
		queryFn		: () => fetchApi<Period[]>({ url: 'periods' }),
		enabled		: isEnabled,
	});


    const selectedSubject = useMemo(() => {
		const subjectId = watch( `${fieldPrefix}.subjectId` );

		return subjects?.find( s => s.id === subjectId );
	}, [subjects, watch( `${fieldPrefix}.subjectId` )]);


    const selectedPeriod = useMemo(() => {
		const periodId = watch( `${fieldPrefix}.periodId` );

		return periods?.find( p => p.id === periodId );
	}, [periods, watch( `${fieldPrefix}.periodId` )]);

	/**
	 * Set default values for subjectId and periodId on mount
	 */
	useEffect(() => {
		if ( subjectId ) {
			setValue( `${fieldPrefix}.subjectId`, subjectId );
		}
		if ( periodId ) {
			setValue( `${fieldPrefix}.periodId`, periodId );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);


    useEffect(() => {
		if ( selectedSubject ) {
			setValue( `${fieldPrefix}.spaceType`,			selectedSubject.spaceType || "" );
			setValue( `${fieldPrefix}.spaceSizeId`,			selectedSubject.spaceSizeId || "" );
			setValue( `${fieldPrefix}.building`,			null );
			setValue( `${fieldPrefix}.workshop`,			selectedSubject.workshop );
			setValue( `${fieldPrefix}.lecture`,				selectedSubject.lecture );
			setValue( `${fieldPrefix}.tutoringSession`,		selectedSubject.tutoringSession );
			setValue( `${fieldPrefix}.laboratory`,			selectedSubject.laboratory );
            setValue( `${fieldPrefix}.quota`,				selectedSubject.quota );
		}
	}, [selectedSubject, setValue, fieldPrefix]);


    useEffect(() => {
		if ( selectedPeriod ) {
			const startDate	= new Date( selectedPeriod.startDate );
			const endDate	= new Date( selectedPeriod.endDate );

			setValue( `${fieldPrefix}.startDate`,	startDate );
			setValue( `${fieldPrefix}.endDate`,		endDate );
		}
	}, [selectedPeriod, setValue, fieldPrefix]);

	/**
	 * Get form field name for session type
	 */
	function getSessionFieldName( session: Session ): string {
		switch ( session ) {
			case Session.C	: return 'lecture';
			case Session.A	: return 'tutoringSession';
			case Session.T	: return 'workshop';
			case Session.L	: return 'laboratory';
			default			: return 'lecture';
		}
	}

	/**
	 * Update session count by delta
	 */
	function updateSessionCount( _: string, session: Session, delta: number ): void {
		const fieldName		= `${fieldPrefix}.${getSessionFieldName( session )}`;
		const currentValue	= getValues( fieldName );
		const newValue		= Math.max( 0, ( Number( currentValue ) ?? 0 ) + delta );

		setValue( fieldName, newValue );
	}

	/**
	 * Set session count to specific value
	 */
	function setSessionCount( _: string, session: Session, value: string ): void {
		const fieldName	= `${fieldPrefix}.${getSessionFieldName( session )}`;
		const numValue	= parseInt( value ) || 0;

		setValue( fieldName, Math.max( 0, numValue ));
	}

	/**
	 * Create mock section data for SessionButton
	 */
	function createMockSection(): any {
		const workshop			= watch( `${fieldPrefix}.workshop` ) || 0;
		const lecture			= watch( `${fieldPrefix}.lecture` ) || 0;
		const tutoringSession	= watch( `${fieldPrefix}.tutoringSession` ) || 0;
		const laboratory		= watch( `${fieldPrefix}.laboratory` ) || 0;

		return {
			id				: `offer-${index}`,
			workshop,
			lecture,
			tutoringSession,
			laboratory,
			sessionCounts	: {
				[Session.C]	: lecture,
				[Session.A]	: tutoringSession,
				[Session.T]	: workshop,
				[Session.L]	: laboratory,
			}
		};
	}

	const hasSelectedSubject	= !!watch( `${fieldPrefix}.subjectId` );
	const hasSelectedPeriod		= !!watch( `${fieldPrefix}.periodId` );


	return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selección de Asignatura */}
                <FormField
                    control	= { control }
                    name	= {`${fieldPrefix}.subjectId`}
                    render	= {({ field }) => (
                        <FormItem>
                            <FormControl>
                                <SubjectSelect
                                    label				= "Asignatura *"
                                    placeholder			= "Seleccionar asignatura"
                                    onSelectionChange   = {( value ) => field.onChange( value )}
                                    defaultValues		= { field.value ? [field.value] : [] }
                                    multiple			= { false }
                                    url					= { facultyId ?? undefined }
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Selección de Período */}
                <FormField
                    control	= { control }
                    name	= {`${fieldPrefix}.periodId`}
                    render	= {({ field }) => (
                        <FormItem>
                            <FormControl>
                                <PeriodSelect
                                    label				= "Período *"
                                    placeholder			= "Seleccionar período"
                                    onSelectionChange	= {( value ) => field.onChange( value )}
                                    defaultValues		= { field.value ? [field.value] : [] }
                                    multiple			= { false }
                                />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Campos habilitados solo cuando hay asignatura seleccionada */}
            {hasSelectedSubject && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Profesor */}
                        <FormField
                            control	= { control }
                            name	= {`${fieldPrefix}.professorId`}
                            render	= {({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <ProfessorSelect
                                            label				= "Profesor"
                                            placeholder			= "Seleccionar profesor"
                                            onSelectionChange	= {( value ) => field.onChange( value )}
                                            defaultValues		= { field.value ? [field.value] : [] }
                                            multiple			= { false }
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Edificio */}
                        <FormField
                            control	= { control }
                            name	= {`${fieldPrefix}.building`}
                            render	= {({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <BuildingSelect
                                            label				= "Edificio (Opcional)"
                                            placeholder			= "Seleccionar edificio"
                                            onSelectionChange	= {( value ) => field.onChange( value === 'none' ? null : value )}
                                            defaultValues		= { field.value || 'none' }
                                            multiple			= { false }
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* SpaceFilterSelector - Tipo y Tamaño de Espacio */}
                    <SpaceFilterSelector
                        buildingId			= { watch( `${fieldPrefix}.building` ) || null }
                        filterMode			= { filterMode }
                        spaceId				= { null }
                        spaceType			= { watch( `${fieldPrefix}.spaceType` ) || null }
                        spaceSizeId			= { watch( `${fieldPrefix}.spaceSizeId` ) || null }
                        onFilterModeChange	= {() => {}}
                        onSpaceIdChange		= {() => {}}
                        onSpaceTypeChange	= {( value ) => setValue( `${fieldPrefix}.spaceType`, value || '' )}
                        onSpaceSizeIdChange	= {( value ) => setValue( `${fieldPrefix}.spaceSizeId`, value || '' )}
                        typeFilter			= "type"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control	= { control }
                            name	= {`${fieldPrefix}.numberOfSections`}
                            render	= {({ field }) => (
                                <FormItem>
                                    <FormLabel>N° Secciones *</FormLabel>

                                    <FormControl>
                                        <Input
                                            type		= "number"
                                            min			= "1"
                                            max			= "100"
                                            placeholder	= "Número de Secciones"
                                            {...field}
                                            onChange	= {(e) => field.onChange(parseInt(e.target.value) || 1)}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control	= { control }
                            name	= {`${fieldPrefix}.quota`}
                            render	= {({ field }) => (
                                <FormItem>
                                    <FormLabel>Cupo *</FormLabel>

                                    <FormControl>
                                        <Input
                                            type		= "number"
                                            min			= "1"
                                            max			= "999"
                                            placeholder	= "Cupo"
                                            {...field}
                                            onChange	= {(e) => field.onChange(parseInt(e.target.value) || 1)}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Sesiones */}
                    <div className="space-y-1">
                        {/* <div className="space-y-3"> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                                {/* <FormField
                                    control	= { control }
                                    name	= {`${fieldPrefix}.numberOfSections`}
                                    render	= {({ field }) => (
                                        <FormItem>
                                            <FormLabel>N° Secciones *</FormLabel>

                                            <FormControl>
                                                <Input
                                                    type		= "number"
                                                    min			= "1"
                                                    max			= "100"
                                                    placeholder	= "Número de Secciones"
                                                    {...field}
                                                    onChange	= {(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}

                                <SessionButton
                                    session				= { Session.C }
                                    updateSessionCount	= { updateSessionCount }
                                    setSessionCount		= { setSessionCount }
                                    section				= { createMockSection() }
                                    showLabel			= { true }
                                />

                                <SessionButton
                                    session				= { Session.T }
                                    updateSessionCount	= { updateSessionCount }
                                    setSessionCount		= { setSessionCount }
                                    section				= { createMockSection() }
                                    showLabel			= { true }
                                />

                                <SessionButton
                                    session				= { Session.A }
                                    updateSessionCount	= { updateSessionCount }
                                    setSessionCount		= { setSessionCount }
                                    section				= { createMockSection() }
                                    showLabel			= { true }
                                />

                                <SessionButton
                                    session				= { Session.L }
                                    updateSessionCount	= { updateSessionCount }
                                    setSessionCount		= { setSessionCount }
                                    section				= { createMockSection() }
                                    showLabel			= { true }
                                />
                            </div>
                        {/* </div> */}

                        <FormField
                            control	= { control }
                            name	= {`${fieldPrefix}.workshop`}
                            render	= {({ fieldState }) => (
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
                </>
            )}

            {/* Campos habilitados solo cuando hay período seleccionado */}
            {hasSelectedPeriod && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fecha de Inicio */}
                    <FormField
                        control	= { control }
                        name	= {`${fieldPrefix}.startDate`}
                        render	= {({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de Inicio *</FormLabel>

                                <FormControl>
                                    <CalendarSelect
                                        value		= { field.value }
                                        onSelect	= { field.onChange }
                                        placeholder	= "Seleccionar fecha de inicio"
                                        className	= "w-full"
                                        disabled	= {( date ) => {
                                            if ( !selectedPeriod ) return true;

                                            const periodStart	= new Date( selectedPeriod.startDate );
                                            const periodEnd		= new Date( selectedPeriod.endDate );

                                            if ( periodStart && date < periodStart )	return true;
                                            if ( periodEnd && date > periodEnd )		return true;

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
                        control	= { control }
                        name	= {`${fieldPrefix}.endDate`}
                        render	= {({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de Fin *</FormLabel>

                                <FormControl>
                                    <CalendarSelect
                                        value		= { field.value }
                                        onSelect	= { field.onChange }
                                        placeholder	= "Seleccionar fecha de fin"
                                        className	= "w-full"
                                        disabled	= {( date ) => {
                                            if ( !selectedPeriod ) return true;

                                            const periodStart	= new Date( selectedPeriod.startDate );
                                            const periodEnd		= new Date( selectedPeriod.endDate );
                                            const startDate		= getValues( `${fieldPrefix}.startDate` );

                                            // Deshabilitar fechas fuera del rango del período
                                            if ( periodStart && date < periodStart )	return true;
                                            if ( periodEnd && date > periodEnd )		return true;
                                            // Deshabilitar fechas anteriores a la fecha de inicio seleccionada
                                            if ( startDate && date < startDate )		return true;

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
        </div>
	);
}
