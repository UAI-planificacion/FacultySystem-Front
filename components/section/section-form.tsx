'use client'

import React, { useEffect, useState } from 'react';

import { useForm }      from 'react-hook-form';
import { zodResolver }  from '@hookform/resolvers/zod';
import * as z           from 'zod';

import {
    useMutation,
    useQuery,
    useQueryClient
}                   from '@tanstack/react-query';
import { toast }    from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                               from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                           from '@/components/ui/form';
import { Input }            from '@/components/ui/input';
import { Button }           from '@/components/ui/button';
import { SizeSelect }       from '@/components/shared/item-select/size-select';
import { SpaceSelect }      from '@/components/shared/item-select/space-select';
import { ModuleSelect }     from '@/components/shared/item-select/module-select';
import { ProfessorSelect }  from '@/components/shared/item-select/professor-select';
import { SessionSelect }    from '@/components/shared/item-select/session-select';
import { DaySelect }        from '@/components/shared/item-select/days-select';
import { SectionGroup }     from '@/components/section/types';
import { SectionInfo }      from '@/components/section/section-info';

import { fetchApi, Method } from '@/services/fetch';
import { KEY_QUERYS }       from '@/consts/key-queries';

import { errorToast, successToast } from '@/config/toast/toast.config';
import { ENV }                      from '@/config/envs/env';

import {
    CreateSectionRequest,
    Section,
    Session,
    UpdateMassiveSectionRequest,
    UpdateSectionRequest
}                       from '@/types/section.model';
import { Size }         from '@/types/request-detail.model';
import { DayModule }    from '@/types/day-module.model';


interface Props {
    isOpen      : boolean;
    onClose     : () => void;
    section     : Section | null;
    onSave      : ( updatedSection: Section ) => void;
    onSuccess?  : () => void;
    group?      : SectionGroup | null;
    ids?        : string[] | null;
}


const formSchema = z.object({
    session                 : z.nativeEnum( Session ).nullable().optional(),
    size                    : z.nativeEnum( Size ).nullable().optional(),
    correctedRegistrants    : z.number().nullable().optional(),
    realRegistrants         : z.number().nullable().optional(),
    plannedBuilding         : z.string().nullable().optional(),
    chairsAvailable         : z.number().nullable().optional(),
    room                    : z.string().nullable().optional(),
    professorId             : z.string().nullable().optional(),
    day                     : z.number().min(1).max(7).nullable().optional(),
    moduleId                : z.number().nullable().optional()
}).refine(( data ) => {
    const hasDaySelected    = data.day      !== null && data.day        !== undefined;
    const hasModuleSelected = data.moduleId !== null && data.moduleId   !== undefined;

    return hasDaySelected === hasModuleSelected;
}, {
    message : 'Debe seleccionar tanto el día como el módulo, o ninguno de los dos',
    path    : ['day']
});


type FormData = z.infer<typeof formSchema>;


export function SectionForm({
    isOpen,
    onClose,
    section,
    onSave,
    onSuccess,
    group,
    ids
}: Props ) {
    const queryClient = useQueryClient();
    const [ sessionRequired, setSessionRequired ] = useState<boolean>( false );


    const {
        data : dayModulesData,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.MODULES, 'dayModule' ],
        queryFn     : () => fetchApi<DayModule[]>({
            url         : `${ENV.ACADEMIC_SECTION}modules/dayModule`,
            isApi       : false
        }),
    });


    const createSectionApi = async ( newSection: CreateSectionRequest ): Promise<Section> =>
        fetchApi({
            isApi   : false,
            url     : `${ENV.ACADEMIC_SECTION}Sections`,
            method  : Method.POST,
            body    : newSection
        });


    const updateSectionApi = async ( updatedSection: UpdateMassiveSectionRequest | UpdateSectionRequest ): Promise<Section> =>
        fetchApi({
            isApi   : false,
            url     : `${ENV.ACADEMIC_SECTION}Sections/${ ids ? `massive/${ids.join(',')}` :  (updatedSection  as UpdateSectionRequest).id }`,
            method  : Method.PATCH,
            body    : updatedSection
        });


    // Mutations
    const createSectionMutation = useMutation({
        mutationFn: createSectionApi,
        onSuccess: ( createdSection ) => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECCTIONS] });
            onSave( createdSection );
            onClose();
            toast( 'Sección creada exitosamente', successToast );
            onSuccess?.();
        },
        onError: ( mutationError: any ) => toast( `Error al crear la sección: ${mutationError.message}`, errorToast )
    });


    const updateSectionMutation = useMutation({
        mutationFn: updateSectionApi,
        onSuccess: ( updatedSection ) => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECCTIONS] });
            onSave( updatedSection );
            onClose();

            const isMassive = ids ? 'Secciones actualizadas' : 'Sección actualizada';

            toast( `${isMassive} exitosamente`, successToast );
            onSuccess?.();
        },
        onError: ( mutationError: any ) => {
            const isMassive = ids ? 'Secciones' : 'Sección';
            toast( `Error al actualizar la ${isMassive}: ${mutationError.message}`, errorToast )
        }
    });


    const form = useForm<FormData>({
        resolver    : zodResolver( formSchema ),
        defaultValues: {
            session                 : section?.session              || null,
            size                    : section?.size                 || null,
            correctedRegistrants    : section?.correctedRegistrants || null,
            realRegistrants         : section?.realRegistrants      || null,
            plannedBuilding         : section?.plannedBuilding      || null,
            chairsAvailable         : section?.chairsAvailable      || null,
            room                    : section?.room                 || null,
            professorId             : section?.professor?.id        || null,
            day                     : section?.day?.id              || null,
            moduleId                : section?.module?.id           || null
        }
    });


    useEffect(() => {
        if ( section ) {
            form.reset({
                session                 : section.session,
                size                    : section.size,
                correctedRegistrants    : section.correctedRegistrants,
                realRegistrants         : section.realRegistrants,
                plannedBuilding         : section.plannedBuilding,
                chairsAvailable         : section.chairsAvailable,
                room                    : section.room,
                professorId             : section.professor?.id,
                day                     : section.day?.id,
                moduleId                : section.module?.id
            });
        }

        setSessionRequired( false )
    }, [ section, form, isOpen ]);


    function onSubmit( data: FormData ): void {
        let dayModuleId : number | null = null;

        if ( !ids && !data.session ) {
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
            session,
            size,
            correctedRegistrants,
            realRegistrants,
            plannedBuilding,
            chairsAvailable,
            room,
            professorId,
        } = data;

        const sectionData = {
            ...(size && { size }),
            ...(correctedRegistrants && { correctedRegistrants }),
            ...(realRegistrants && { realRegistrants }),
            ...(plannedBuilding && { plannedBuilding }),
            ...(chairsAvailable && { chairsAvailable }),
            ...(room && { roomId: room }),
            ...(professorId && { professorId }),
            ...(dayModuleId && { dayModuleId }),
        };

        if ( ids  ) {
            const updateMassiveSection : UpdateMassiveSectionRequest = {
                ...sectionData,
                ...(session && { session }),
            }

            console.log("🚀 ~ file: section-form.tsx:284 ~ updateMassiveSection:", updateMassiveSection)

            updateSectionMutation.mutate( updateMassiveSection );
            return;
        }

        if ( section ) {
            const updatedSection: UpdateSectionRequest = {
                ...sectionData,
                session: data.session!,
                id: section.id,
            };

            console.log("🚀 ~ file: section-form.tsx:217 ~ updatedSection:", updatedSection)

            updateSectionMutation.mutate( updatedSection );
        } else {
            if ( !group ) return;

            const createSection : CreateSectionRequest = {
                ...sectionData,
                code        : group.code,
                periodId    : group.period.split( '-' )[0],
                groupId     : group.groupId,
                subjectId   : group.subjectId,
                session     : data.session!,
            }

            console.log("🚀 ~ file: section-form.tsx:227 ~ createSection:", createSection)

            createSectionMutation.mutate( createSection );
        }
    };


    function handleClose(): void {
        form.reset();
        onClose();
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        { ids
                            ? 'Editar Secciones'
                            : section
                                ? 'Editar Sección'
                                : 'Crear Nueva Sección'
                        }
                    </DialogTitle>

                    <DialogDescription>
                        { ids
                            ? 'Modifica los datos de todas las secciones selecciondas.'
                            : section
                                ? 'Modifica los datos de la sección individual.'
                                : 'Completa los datos para crear una nueva sección.'
                        }
                    </DialogDescription>

                    {/* Section Info */}
                    { !ids && <SectionInfo section={section} group={group} /> }
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit( onSubmit )} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Session Field */}
                            <FormField
                                control = { form.control }
                                name    = "session"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <SessionSelect
                                                label               = "Sesión"
                                                placeholder         = "Seleccionar sesión"
                                                defaultValues       = { field.value ? [field.value] : [] }
                                                multiple            = { false }
                                                onSelectionChange   = {( values ) => {
                                                    field.onChange( values as string as Session );
                                                    setSessionRequired( false );
                                                }}
                                            />
                                        </FormControl>

                                        { sessionRequired && <span className='text-red-700'>Debe seleccionar una sesión</span>  }
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Size Field */}
                            <FormField
                                control = { form.control }
                                name    = "size"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <SizeSelect
                                                label               = "Tamaño"
                                                defaultValues       = { field.value ? [field.value] : [] }
                                                onSelectionChange   = {( values ) => field.onChange( values as string || null )}
                                                multiple            = { false }
                                                placeholder         = "Seleccionar tamaño"
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

                            {/* Room Field */}
                            <FormField
                                control = { form.control }
                                name    = "room"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <SpaceSelect 
                                                label               = "Sala"
                                                defaultValues       = { field.value ? [field.value] : [] }
                                                onSelectionChange   = {( values ) => field.onChange( values as string || null )}
                                                multiple            = { false }
                                            />
                                        </FormControl>

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

                            {/* Day Field */}
                            <FormField
                                control = { form.control }
                                name    = "day"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <DaySelect
                                                label               = "Día"
                                                defaultValues       = { field.value ? [field.value.toString()] : [] }
                                                onSelectionChange   = {( values ) => field.onChange( values as string ? parseInt( values as string ) : null )}
                                                placeholder         = "Seleccionar día"
                                                multiple            = { false }
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Module Field */}
                            <FormField
                                control = { form.control }
                                name    = "moduleId"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <ModuleSelect
                                                label               = "Módulo"
                                                defaultValues       = { field.value ? [field.value.toString()] : [] }
                                                onSelectionChange   = {( values ) => field.onChange( values as string ? parseInt( values as string ) : null )}
                                                multiple            = { false }
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between space-x-2 pt-4">
                            <Button
                                type        = "button"
                                variant     = "outline"
                                onClick     = { handleClose }
                                disabled    = { createSectionMutation.isPending || updateSectionMutation.isPending }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type        = "submit"
                                disabled    = { createSectionMutation.isPending || updateSectionMutation.isPending }
                            >
                                {( createSectionMutation.isPending || updateSectionMutation.isPending )
                                    ? 'Guardando...' 
                                    : ( section
                                        ? 'Guardar Cambios'
                                        : 'Crear Sección'
                                    )
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}