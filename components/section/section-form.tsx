'use client'

import React, { useEffect } from 'react';

import { useForm }      from 'react-hook-form';
import { zodResolver }  from '@hookform/resolvers/zod';
import * as z           from 'zod';

import {
    useMutation,
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
    UpdateSectionRequest
}                       from '@/types/section.model';
import { Size }         from '@/types/request-detail.model';


interface Props {
    isOpen      : boolean;
    onClose     : () => void;
    section     : Section | null;
    onSave      : ( updatedSection: Section ) => void;
    onSuccess?  : () => void;
    group?      : SectionGroup | null;
}


// Zod schema for form validation
const formSchema = z.object({
    session                 : z.nativeEnum( Session, { required_error: 'Debe seleccionar una sesión' }),
    size                    : z.nativeEnum( Size ).nullable().optional(),
    correctedRegistrants    : z.number().nullable().optional(),
    realRegistrants         : z.number().nullable().optional(),
    plannedBuilding         : z.string().nullable().optional(),
    chairsAvailable         : z.number().nullable().optional(),
    room                    : z.string().nullable().optional(),
    professorId             : z.string().nullable().optional(),
    day                     : z.number().min(1).max(7).nullable().optional(),
    moduleId                : z.string().nullable().optional()
});


type FormData = z.infer<typeof formSchema>;


export function SectionForm({
    isOpen,
    onClose,
    section,
    onSave,
    onSuccess,
    group
}: Props ) {
    const queryClient = useQueryClient();


    const createSectionApi = async ( newSection: CreateSectionRequest ): Promise<Section> =>
        fetchApi({
            isApi   : false,
            url     : `${ENV.ACADEMIC_SECTION}Sections`,
            method  : Method.POST,
            body    : newSection
        });


    const updateSectionApi = async ( updatedSection: UpdateSectionRequest ): Promise<Section> =>
        fetchApi({
            isApi   : false,
            url     : `${ENV.ACADEMIC_SECTION}Sections/${updatedSection.id}`,
            method  : Method.PATCH,
            body    : {
                session                 : updatedSection.session,
                size                    : updatedSection.size,
                correctedRegistrants    : updatedSection.correctedRegistrants,
                realRegistrants         : updatedSection.realRegistrants,
                plannedBuilding         : updatedSection.plannedBuilding,
                chairsAvailable         : updatedSection.chairsAvailable,
                roomId                  : updatedSection.roomId,
                professorId             : updatedSection.professorId,
                day                     : updatedSection.day,
                moduleId                : updatedSection.moduleId
            }
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
            toast( 'Sección actualizada exitosamente', successToast );
            onSuccess?.();
        },
        onError: ( mutationError: any ) => toast( `Error al actualizar la sección: ${mutationError.message}`, errorToast )
    });


    const form = useForm<FormData>({
        resolver    : zodResolver( formSchema ),
        defaultValues: {
            session                 : section?.session || Session.C,
            size                    : section?.size || null,
            correctedRegistrants    : section?.correctedRegistrants || null,
            realRegistrants         : section?.realRegistrants || null,
            plannedBuilding         : section?.plannedBuilding || null,
            chairsAvailable         : section?.chairsAvailable || null,
            room                    : section?.room || null,
            professorId             : section?.professorId || null,
            day                     : section?.day || null,
            moduleId                : section?.moduleId || null
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
                professorId             : section.professorId,
                day                     : section.day,
                moduleId                : section.moduleId
            });
        }
    }, [ section, form ]);


    function onSubmit( data: FormData ): void {
        const sectionData = {
            session                 : data.session,
            size                    : data.size                 || null,
            correctedRegistrants    : data.correctedRegistrants || null,
            realRegistrants         : data.realRegistrants      || null,
            plannedBuilding         : data.plannedBuilding      || null,
            chairsAvailable         : data.chairsAvailable      || null,
            roomId                  : data.room                 || null,
            professorId             : data.professorId          || null,
            day                     : data.day                  || null,
            moduleId                : data.moduleId             || null
        };

        if ( section ) {
            const updatedSection: UpdateSectionRequest = {
                ...sectionData,
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
                    <DialogTitle>{section ? 'Editar Sección' : 'Crear Nueva Sección'}</DialogTitle>

                    <DialogDescription>
                        { section
                            ? 'Modifica los datos de la sección individual.'
                            : 'Completa los datos para crear una nueva sección.'
                        }
                    </DialogDescription>

                    {/* Section Info */}
                    <SectionInfo section={section} group={group} />
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
                                                onSelectionChange   = {( values ) => field.onChange( values as string as Session.C )}
                                                multiple            = { false }
                                            />
                                        </FormControl>

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
                                                defaultValues       = { field.value ? [field.value] : [] }
                                                onSelectionChange   = {( values ) => field.onChange( values as string || null )}
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
