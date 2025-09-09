'use client'

import React, { useState, useEffect } from 'react';

import { useForm }      from 'react-hook-form';
import { zodResolver }  from '@hookform/resolvers/zod';
import * as z           from 'zod';

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
}                               from '@/components/ui/form';
import { Input }                from '@/components/ui/input';
import { Button }               from '@/components/ui/button';
import { Badge }                from '@/components/ui/badge';
import { Card, CardContent }    from '@/components/ui/card';
import { SizeSelect }           from '@/components/shared/item-select/size-select';
import { SpaceSelect }          from '@/components/shared/item-select/space-select';
import { ModuleSelect }         from '@/components/shared/item-select/module-select';
import { ProfessorSelect }      from '@/components/shared/item-select/professor-select';
import { SessionSelect }        from '@/components/shared/item-select/session-select';
import { DaySelect }            from '@/components/shared/item-select/days-select';

import { Section, Session } from '@/types/section.model';
import { Size }             from '@/types/request-detail.model';


interface Props {
    isOpen      : boolean;
    onClose     : () => void;
    section     : Section | null;
    onSave      : ( updatedSection: Section ) => void;
}


// Zod schema for form validation
const formSchema = z.object({
    session                 : z.nativeEnum( Session, { required_error: 'Debe seleccionar una sesión' }),
    size                    : z.string().nullable().optional(),
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
    onSave
}: Props ) {
    const [isSubmitting, setIsSubmitting] = useState<boolean>( false );

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


    // Reset form when section changes
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


    // Handle form submission
    const onSubmit = async ( data: FormData ) => {
        if ( !section ) return;

        setIsSubmitting( true );

        try {
            // Create updated section
            const updatedSection: Section = {
                ...section,
                session                 : data.session,
                size                    : (data.size as Size ) ?? null,
                correctedRegistrants    : data.correctedRegistrants || null,
                realRegistrants         : data.realRegistrants || null,
                plannedBuilding         : data.plannedBuilding || null,
                chairsAvailable         : data.chairsAvailable || null,
                room                    : data.room || null,
                professorId             : data.professorId || null,
                day                     : data.day || null,
                moduleId                : data.moduleId || null
            };

            onSave( updatedSection );
            onClose();
        } catch ( error ) {
            console.error( 'Error updating section:', error );
        } finally {
            setIsSubmitting( false );
        }
    };


    // Handle dialog close
    const handleClose = () => {
        form.reset();
        onClose();
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Sección</DialogTitle>

                    <DialogDescription>
                        Modifica los datos de la sección individual.
                    </DialogDescription>

                    {/* Section Info */}
                    {section && (
                        <Card>
                            <CardContent className="mt-4">
                                <h4 className="font-medium mb-2">Información de la Sección</h4>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium">Número:</span>
                                        <Badge variant="secondary" className="ml-2">
                                            {section.code}
                                        </Badge>
                                    </div>

                                    <div>
                                        <span className="font-medium">Período:</span>
                                        <Badge variant="outline" className="ml-2">
                                            {section.period}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
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
                                disabled    = { isSubmitting }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type        = "submit"
                                disabled    = { isSubmitting }
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}