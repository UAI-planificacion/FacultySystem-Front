'use client'

import React, { useCallback, useEffect, useState } from 'react';

import { useForm }      from 'react-hook-form';
import { zodResolver }  from '@hookform/resolvers/zod';
import * as z           from 'zod';

import {
    useMutation,
    useQuery,
    useQueryClient
}                               from '@tanstack/react-query';
import { toast }                from 'sonner';
import { BookCopy, Calendar, ExternalLinkIcon, Plus, RefreshCcw } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
}                                   from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                                   from '@/components/ui/form';
import { Input }                    from '@/components/ui/input';
import { Button }                   from '@/components/ui/button';
import { SpaceSelect }              from '@/components/shared/item-select/space-select';
import { ProfessorSelect }          from '@/components/shared/item-select/professor-select';
import { SessionSelect }            from '@/components/shared/item-select/session-select';
import { RequestDetailModuleDays }  from '@/components/request-detail/request-detail-module-days';
import { CalendarSelect }           from '@/components/ui/calendar-select';
import { Switch }                   from '@/components/ui/switch';
import { Card, CardContent }        from '@/components/ui/card';

import {
    CreateSessionRequest,
    UpdateSessionRequest,
    UpdateMassiveSessionRequest
}                                       from '@/types/session-request.model';
import { fetchApi, Method }             from '@/services/fetch';
import { KEY_QUERYS }                   from '@/consts/key-queries';
import { errorToast, successToast }     from '@/config/toast/toast.config';
import { tempoFormat }                  from '@/lib/utils';
import { useAvailableDates }            from '@/hooks/use-available-dates';
import { Session }                      from '@/types/section.model';
import { DayModule }                    from '@/types/day-module.model';
import { OfferSection, OfferSession }   from '@/types/offer-section.model';
import { SessionInfoRequest }           from './session-info-request';


interface Props {
    isOpen      : boolean;
    onClose     : () => void;
    session     : OfferSession | null;
    section     : OfferSection | null;
    onSave      : ( updatedSession: OfferSession ) => void;
    onSuccess?  : () => void;
    ids?        : string[] | null;
}


const formSchema = z.object({
    name                    : z.nativeEnum( Session ).nullable().optional(),
    spaceId                 : z.string().nullable().optional(),
    isEnglish               : z.boolean().nullable().optional(),
    chairsAvailable         : z.number().nullable().optional(),
    correctedRegistrants    : z.number().nullable().optional(),
    realRegistrants         : z.number().nullable().optional(),
    plannedBuilding         : z.string().nullable().optional(),
    professorId             : z.string().nullable().optional(),
    moduleId                : z.number().nullable().optional(),
    date                    : z.date().nullable().optional(),
    day                     : z.number().min(1).max(7).nullable().optional(),
}).refine(( data ) => {
    const hasDaySelected    = data.day      !== null && data.day        !== undefined;
    const hasModuleSelected = data.moduleId !== null && data.moduleId   !== undefined;

    return hasDaySelected === hasModuleSelected;
}, {
    message : 'Debe seleccionar tanto el día como el módulo, o ninguno de los dos',
    path    : ['day']
});


type FormData = z.infer<typeof formSchema>;


export function SessionForm({
    isOpen,
    onClose,
    session,
    section,
    onSave,
    onSuccess,
    ids
}: Props ) {
    const queryClient                                       = useQueryClient();
    const [ sessionRequired, setSessionRequired ]           = useState<boolean>( false );
    const [ selectedDayModuleId, setSelectedDayModuleId ]   = useState<number | null>( null );
    const [ showCalendar, setShowCalendar ]                 = useState<boolean>( false );
    const [ moduleDaySelections, setModuleDaySelections ]   = useState<{ day: string; moduleId: string }[]>([]);
    const [ shouldFetchDates, setShouldFetchDates ]         = useState<boolean>( false );
    const [ isUpdateDateSpace, setIsUpdateDateSpace  ]      = useState<boolean>( false );
    const [ englishForAll, setEnglishForAll ]               = useState<boolean>( false );


    const form = useForm<FormData>({
        resolver    : zodResolver( formSchema ),
        defaultValues: {
            name                    : session?.name                 || null,
            spaceId                 : session?.spaceId              || null,
            isEnglish               : session?.isEnglish            || false,
            correctedRegistrants    : session?.correctedRegistrants || null,
            realRegistrants         : session?.realRegistrants      || null,
            plannedBuilding         : session?.plannedBuilding      || null,
            chairsAvailable         : session?.chairsAvailable      || null,
            professorId             : session?.professor?.id        || null,
            day                     : session?.dayId                || null,
            date                    : session?.date ? new Date( session.date ) : null,
            moduleId                : session?.module ? Number( session.module.id ) : null,
        }
    });


    useEffect(() => {
        if ( session ) {
            form.reset({
                name                    : session.name,
                spaceId                 : session.spaceId,
                isEnglish               : session.isEnglish,
                correctedRegistrants    : session.correctedRegistrants,
                realRegistrants         : session.realRegistrants,
                plannedBuilding         : session.plannedBuilding,
                chairsAvailable         : session.chairsAvailable,
                professorId             : session.professor?.id,
                day                     : session.dayId,
                moduleId                : session.module ? Number( session.module.id ) : null,
                date                    : session.date ? new Date( session.date ) : null
            });

            // Marcar el módulo-día por defecto si existe
            if ( session.dayId && session.module?.id ) {
                setModuleDaySelections([{
                    day         : session.dayId.toString(),
                    moduleId    : session.module.id.toString()
                }]);
                setSelectedDayModuleId( session.dayModuleId );
            } else {
                setModuleDaySelections([]);
                setSelectedDayModuleId( null );
            }
        } else {
            setModuleDaySelections([]);
            setSelectedDayModuleId( null );
        }

        setSessionRequired( false );
        setShowCalendar( false );
        setShouldFetchDates( false );
        setEnglishForAll( false );

        const isShowDayModules = ids ? false : !session;

        setIsUpdateDateSpace( isShowDayModules );
    }, [ session, form, isOpen, ids ]);


    const {
        data : dayModulesData,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.MODULES, 'dayModule' ],
        queryFn     : () => fetchApi<DayModule[]>({ url: 'modules/dayModule' }),
        enabled     : isOpen
    });


    // TanStack Query para obtener fechas disponibles
    const spaceId = form.watch( 'spaceId' );


    const {
        data            : availableDates = [],
        isLoading       : isLoadingDates,
        isError         : isErrorDates,
        error           : errorDates
    } = useAvailableDates({
        // sessionId,
        sectionId : section?.id || null,
        dayModuleId : selectedDayModuleId,
        spaceId,
        enabled     : shouldFetchDates
    });


    // Efecto para manejar el resultado de la query
    useEffect(() => {
        if ( !shouldFetchDates ) return;

        if ( isErrorDates ) {
            toast( `Error al obtener fechas disponibles: ${( errorDates as any )?.message || 'Error desconocido'}`, errorToast );
            setShowCalendar( false );
            setShouldFetchDates( false );
            return;
        }

        if ( !isLoadingDates && availableDates ) {
            if ( availableDates.length === 0 ) {
                toast( 'No hay fechas disponibles. Prueba con otra sala.', errorToast );
                setShowCalendar( false );
            } else {
                setShowCalendar( true );
            }

            setShouldFetchDates( false );
        }
    }, [ shouldFetchDates, isLoadingDates, isErrorDates, errorDates, availableDates ]);


    const createSessionApi = async ( newSession: CreateSessionRequest ): Promise<OfferSession> =>
        fetchApi({
            url     : 'sessions',
            method  : Method.POST,
            body    : newSession
        });


    const updateSessionApi = async ( updatedSession: UpdateMassiveSessionRequest | UpdateSessionRequest ): Promise<OfferSession> =>
        fetchApi({
            url     : `sessions/${ ids ? 'update/massive' : ( updatedSession as UpdateSessionRequest ).id }`,
            method  : Method.PATCH,
            body    : updatedSession
        });


    // Mutations
    const createSessionMutation = useMutation({
        mutationFn: createSessionApi,
        onSuccess: ( createdSession ) => {
            queryClient.setQueryData<OfferSection[]>(
                [ KEY_QUERYS.SECCTIONS ],
                ( oldData ) => {
                    if ( !oldData || !section ) return oldData;

                    return oldData.map( sec => {
                        if ( sec.id === section.id ) {
                            return {
                                ...sec,
                                sessions: [ ...sec.sessions, createdSession ]
                            };
                        }

                        return sec;
                    });
                }
            );

            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.OFFERS] });
            onSave( createdSession );
            onClose();
            toast( 'Sesión creada exitosamente', successToast );
            onSuccess?.();
        },
        onError: ( mutationError: any ) => toast( `Error al crear la sesión: ${mutationError.message}`, errorToast )
    });


    const updateSessionMutation = useMutation({
        mutationFn: updateSessionApi,
        onSuccess: ( updatedSession ) => {
            queryClient.setQueryData<OfferSection[]>(
                [ KEY_QUERYS.SECCTIONS ],
                ( oldData ) => {
                    if ( !oldData ) return oldData;

                    return oldData.map( section => {
                        const sessionIndex = section.sessions.findIndex( s => s.id === updatedSession.id );

                        if ( sessionIndex !== -1 ) {
                            return {
                                ...section,
                                sessions: section.sessions.map( s =>
                                    s.id === updatedSession.id ? updatedSession : s
                                )
                            };
                        }

                        return section;
                    });
                }
            );

            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECCTIONS] });
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.OFFERS] });

            onSave( updatedSession );
            onClose();

            const isMassive = ids ? 'Sesiones actualizadas' : 'Sesión actualizada';

            toast( `${isMassive} exitosamente`, successToast );
            onSuccess?.();
        },
        onError: ( mutationError: any ) => {
            const isMassive = ids ? 'Sesiones' : 'Sesión';
            toast( `Error al actualizar la ${isMassive}: ${mutationError.message}`, errorToast )
        }
    });


    const handleModuleToggle = useCallback(( day: string, moduleId: string, isChecked: boolean ) => {
        setModuleDaySelections( prev => {
            if ( isChecked ) {
                return [{ day, moduleId }];
            }
            return prev.filter( item => !( item.day === day && item.moduleId === moduleId ));
        });
    }, []);


    const handleDayModuleSelect = useCallback(( dayModuleId: number | null ) => {
        setSelectedDayModuleId( dayModuleId );
        setShouldFetchDates( false );

        if ( !dayModuleId ) {
            setShowCalendar( false );
            form.setValue( 'date', null );
        }
    }, [ form ]);


    const handleFetchAvailableDates = () => {
        if ( !section?.id || !selectedDayModuleId || !spaceId ) {
            toast( 'Debe seleccionar un módulo-día y un espacio', errorToast );
            return;
        }

        form.setValue( 'date', null );
        setShouldFetchDates( true );
    };


    function onSubmit( data: FormData ): void {
        let dayModuleId : number | null = null;

        if ( !ids && !data.name ) {
            setSessionRequired( true );
            return;
        }

        if ( isLoading ) return;

        if ( isError ) {
            toast( 'Error al cargar los días y los módulos. No seleccione el día y el módulo por ahora', errorToast );
            return;
        }

        if ( data.day && data.moduleId && (dayModulesData?.length ?? 0) > 0 ) {
            dayModuleId = dayModulesData!
            .find(( dayModule ) => dayModule.dayId === data.day && dayModule.moduleId === Number(data.moduleId ))?.id || null;

            if ( !dayModuleId ) {
                toast( 'Esta combinación de día y módulo no existe, selecciona otro.', errorToast );
                return;
            }
        }

        const {
            name,
            spaceId,
            isEnglish,
            correctedRegistrants,
            realRegistrants,
            plannedBuilding,
            chairsAvailable,
            professorId,
            date
        } = data;

        const sessionData = {
            // name,
            // dayModuleId : selectedDayModuleId,
            // ...(spaceId && { spaceId }),
            // ...(isEnglish !== null && isEnglish !== undefined && { isEnglish }),
            ...(correctedRegistrants && { correctedRegistrants }),
            ...(realRegistrants && { realRegistrants }),
            ...(plannedBuilding && { plannedBuilding }),
            ...(chairsAvailable && { chairsAvailable }),
            ...(professorId && { professorId }),
            // ...(dayModuleId && { dayModuleId }),
            ...(date && { date }),
        };

        console.log('🚀 ~ file: session-form.tsx:377 ~ sessionData:', sessionData)

        if ( ids  ) {
            const updateMassiveSession : UpdateMassiveSessionRequest = {
                ...sessionData,
                ...(name && { name }),
                ...( englishForAll && { isEnglish } ),
                ids
            }
            console.log("🚀 ~ file: session-form.tsx ~ updateMassiveSession:", updateMassiveSession)

            if ( Object.keys( updateMassiveSession ).length === 1 && "ids" in updateMassiveSession ) {
                toast( 'Debe seleccionar al menos un valor para actualizar', errorToast );
                return;
            }

            updateSessionMutation.mutate( updateMassiveSession );
            return;
        }

        if ( session ) {
            const updatedSession: UpdateSessionRequest = {
                ...sessionData,
                dayModuleId : selectedDayModuleId,
                ...( spaceId && { spaceId }),
                ...( name && { name }),
                ...( isEnglish !== null && isEnglish !== undefined && { isEnglish }),
                id: session.id,
            };

            console.log("🚀 ~ file: session-form.tsx ~ updatedSession:", updatedSession)

            updateSessionMutation.mutate( updatedSession );
        } else {
            const createSession : CreateSessionRequest = {
                ...sessionData,
                name        : data.name!,
                sectionId   : section?.id!,
                ...(spaceId && { spaceId }),
                dayModuleId : selectedDayModuleId,
                ...( isEnglish !== null && isEnglish !== undefined && { isEnglish }),
            }

            console.log("🚀 ~ file: session-form.tsx ~ createSession:", createSession)

            createSessionMutation.mutate( createSession );
        }
    };


    function handleClose(): void {
        form.reset({});
        // setSelectedDayModuleId( null );
        // setShowCalendar( false );
        // setModuleDaySelections( [] );
        // setShouldFetchDates( false );
        onClose();
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        { ids
                            ? 'Editar Sesiones'
                            : session
                                ? 'Editar Sesión'
                                : 'Crear Nueva Sesión'
                        }
                    </DialogTitle>

                    <DialogDescription>
                        { ids
                            ? 'Modifica los datos de todas las sesiones seleccionadas, modifica un valor y se aplicará para todas.'
                            : session
                                ? 'Modifica los datos de la sesión individual.'
                                : 'Completa los datos para crear una nueva sesión.'
                        }
                    </DialogDescription>

                    { !ids 
                        ? 
                        <>
                        <Card>
                            <CardContent className="mt-4">
                                <div className="grid grid-cols-4 gap-4">
                                    <span className="font-medium">SSEC</span>
                                    <span className="font-medium">Periodo</span>
                                    <span className="font-medium">Fecha Inicio</span>
                                    <span className="font-medium">Fecha Fin</span>
                                </div>

                                <hr className="my-2" />

                                <div className="grid grid-cols-4 gap-4">
                                    <span>{ section?.subject.id }-{ section?.code }</span>
                                    <span>{ section?.period?.name }</span>
                                    <span>{ section?.startDate && tempoFormat( section.startDate )}</span>
                                    <span>{ section?.endDate && tempoFormat( section.endDate )}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mostrar info de la solicitud */}
                        {/* { session && <SessionInfoRequest /> } */}
                        </>
                        : <Card>
                            <CardContent className="mt-5">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium w-48">Sessiones seleccionadas:</span>
                                    <span className="">{ids.length}</span>
                                </div>
                            </CardContent>
                        </Card>
                    }

                    {  !!ids || !isUpdateDateSpace &&
                        <Card>
                            <CardContent className="mt-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <span className="font-medium">Espacio</span>

                                    <span className="font-medium">Fecha</span>

                                    <div className="flex items-center gap-2 justify-between">
                                        <span className="font-medium">Módulo</span>

                                        <Button
                                            size    = "icon"
                                            onClick = {() => setIsUpdateDateSpace( true )}
                                            title   = "Actualizar fecha y espacio"
                                        >
                                            <RefreshCcw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <hr className="my-2" />

                                <div className="grid grid-cols-3 gap-4">
                                    <span>{ session?.spaceId }</span>
                                    <span>{ session?.date && tempoFormat( session?.date )  }</span>
                                    <span>{ session?.module.name }</span>
                                </div>
                            </CardContent>
                        </Card>
                    }
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit( onSubmit )} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Session Name Field */}
                            <FormField
                                control = { form.control }
                                name    = "name"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <SessionSelect
                                                label               = "Tipo de Sesión"
                                                placeholder         = "Seleccionar tipo"
                                                defaultValues       = { field.value ? [field.value] : [] }
                                                multiple            = { false }
                                                onSelectionChange   = {( values ) => {
                                                    field.onChange( values as string as Session );
                                                    setSessionRequired( false );
                                                }}
                                            />
                                        </FormControl>

                                        { sessionRequired && <span className='text-red-700'>Debe seleccionar un tipo de sesión</span>  }
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Professor Field */}
                            <FormField
                                control = { form.control }
                                name    = "professorId"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <ProfessorSelect
                                                label               = "Profesor"
                                                defaultValues       = { field.value ? [field.value] : [] }
                                                onSelectionChange   = {( values ) => field.onChange( values as string || null )}
                                                multiple            = { false }
                                                placeholder         = "Seleccionar profesor"
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Corrected Registrants Field */}
                            <FormField
                                control = { form.control }
                                name    = "correctedRegistrants"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Inscritos Corregidos</FormLabel>

                                        <FormControl>
                                            <Input
                                                type        = "number"
                                                placeholder = "Número de inscritos corregidos"
                                                {...field}
                                                value       = { field.value || '' }
                                                onChange    = {( e ) => field.onChange( e.target.value ? parseInt( e.target.value ) : null )}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Real Registrants Field */}
                            <FormField
                                control = { form.control }
                                name    = "realRegistrants"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Inscritos Reales</FormLabel>

                                        <FormControl>
                                            <Input
                                                type        = "number"
                                                placeholder = "Número de inscritos reales"
                                                {...field}
                                                value       = { field.value || '' }
                                                onChange    = {( e ) => field.onChange( e.target.value ? parseInt( e.target.value ) : null )}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Planned Building Field */}
                            <FormField
                                control = { form.control }
                                name    = "plannedBuilding"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Edificio Planificado</FormLabel>

                                        <FormControl>
                                            <Input
                                                placeholder = "Edificio planificado"
                                                {...field}
                                                value       = { field.value || '' }
                                                onChange    = {( e ) => field.onChange( e.target.value || null )}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Chairs Available Field */}
                            <FormField
                                control = { form.control }
                                name    = "chairsAvailable"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sillas Disponibles</FormLabel>

                                        <FormControl>
                                            <Input
                                                type        = "number"
                                                placeholder = "Número de sillas disponibles"
                                                {...field}
                                                value       = { field.value || '' }
                                                onChange    = {( e ) => field.onChange( e.target.value ? parseInt( e.target.value ) : null )}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Is English Field */}
                        <FormField
                            control = { form.control }
                            name    = "isEnglish"
                            render  = {({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    { ids  && <>
                                        <FormLabel
                                            className="text-base items-center flex gap-2"
                                            title="Si se selecciona, se aplicará o se quitará el inglés para todas las sesiones seleccionadas"
                                        >
                                            Aplicar para todos
                                        </FormLabel>

                                            <Switch
                                                checked         = { englishForAll || false }
                                                onCheckedChange = { setEnglishForAll }
                                            />
                                        </>
                                    }

                                    <FormLabel className="text-base items-center flex gap-2">
                                        Sección en Inglés
                                    </FormLabel>

                                    <FormControl>
                                        <Switch
                                            checked         = { field.value || false }
                                            onCheckedChange = { field.onChange }
                                            disabled        = { !!ids && !englishForAll }
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        { isUpdateDateSpace && <>
                            <RequestDetailModuleDays
                                requestDetailModule = { moduleDaySelections.map( item => ({ day: item.day, moduleId: item.moduleId })) }
                                enabled             = { isOpen }
                                onModuleToggle      = { handleModuleToggle }
                                multiple            = { false }
                                onDayModuleSelect   = { handleDayModuleSelect }
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {/* Space Field */}
                                <FormField
                                    control = { form.control }
                                    name    = "spaceId"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <SpaceSelect 
                                                    label               = "Espacio"
                                                    defaultValues       = { field.value ? [field.value] : [] }
                                                    onSelectionChange   = {( values ) => field.onChange( values as string || null )}
                                                    multiple            = { false }
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Calendar Select */}
                                <FormField
                                    control = { form.control }
                                    name    = "date"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha</FormLabel>
                                            <FormControl>
                                                <CalendarSelect
                                                    disabledButton  = { !showCalendar }
                                                    value           = { field.value }
                                                    onSelect        = {( date ) => field.onChange( date )}
                                                    placeholder     = "Seleccionar fecha"
                                                    disabled        = {( date ) => {
                                                        const dateStr = date.toISOString().split( 'T' )[0];
                                                        return !availableDates.some( d => d.toISOString().split( 'T' )[0] === dateStr );
                                                    }}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex gap-2">
                                { !!session &&
                                    <Button
                                        type        = "button"
                                        variant     = "outline"
                                        onClick     = { () => setIsUpdateDateSpace( false ) }
                                        className   = "w-full gap-2"
                                    >
                                        Cancelar
                                    </Button>
                                }

                                <Button
                                    type        = "button"
                                    onClick     = { handleFetchAvailableDates }
                                    className   = "w-full gap-2"
                                    disabled    = { !selectedDayModuleId || !spaceId || isLoadingDates }
                                >
                                    <Calendar className="h-4 w-4" />
                                    { isLoadingDates ? 'Buscando...' : 'Buscar fechas disponibles' }
                                </Button>

                                <Button
                                    onClick = {() => setIsUpdateDateSpace( true )}
                                    title   = "Abrir solicitud"
                                    className="w-full gap-2"
                                >
                                    <BookCopy className="h-4 w-4" />
                                    Crear Solicitud
                                </Button>
                            </div>
                        </>
                        }

                        {/* Action Buttons */}
                        <DialogFooter className="flex items-center justify-between border-t pt-4">
                            <Button
                                type        = "button"
                                variant     = "outline"
                                onClick     = { handleClose }
                                disabled    = { createSessionMutation.isPending || updateSessionMutation.isPending }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type        = "submit"
                                disabled    = { 
                                    createSessionMutation.isPending || 
                                    updateSessionMutation.isPending || 
                                    ( selectedDayModuleId !== null && !form.watch( 'date' )) 
                                }
                            >
                                {( createSessionMutation.isPending || updateSessionMutation.isPending )
                                    ? 'Guardando...' 
                                    : ( 
                                        ids
                                            ? 'Actualizar Sesiones'
                                            : session
                                                ? 'Guardar Cambios'
                                                : 'Crear Sesión'
                                    )
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
