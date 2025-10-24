'use client'

import React, { useEffect, useMemo, useState }   from 'react';
import { useForm }                                  from 'react-hook-form';

import {
    useMutation,
    useQueryClient
}                       from '@tanstack/react-query';
import { toast }        from 'sonner';
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
import { Button }               from '@/components/ui/button';
import { MultiSelectCombobox }  from '@/components/shared/Combobox';
import { SizeSelect }           from '@/components/shared/item-select/size-select';
import { SpaceTypeSelect }      from '@/components/shared/item-select/space-type-select';
import { BuildingSelect }       from '@/components/shared/item-select/building-select';
import { ProfessorSelect }      from '@/components/shared/item-select/professor-select';
import { CalendarSelect }       from '@/components/ui/calendar-select';

import { fetchApi, Method }         from '@/services/fetch';
import { KEY_QUERYS }               from '@/consts/key-queries';
import { errorToast, successToast } from '@/config/toast/toast.config';
import { OfferSection }             from '@/types/offer-section.model';
import { tempoFormat }              from '@/lib/utils';


interface Props {
    isOpen      : boolean;
    onClose     : () => void;
    section     : OfferSection | null;
    onSuccess?  : () => void;
    sections    : OfferSection[];
}

// Zod schema for form validation
const formSchema = z.object({
    code        : z.number().min( 1, 'El número debe ser mayor a 0' ),
    spaceSizeId : z.string().optional().nullable(),
    spaceType   : z.string().optional().nullable(),
    building    : z.string().optional().nullable(),
    startDate   : z.string().min( 1, 'La fecha de inicio es requerida' ),
    endDate     : z.string().min( 1, 'La fecha de fin es requerida' ),
    professorId : z.string().optional().nullable(),
}).refine(( data ) => {
    if ( data.startDate && data.endDate ) {
        const start = new Date( data.startDate );
        const end   = new Date( data.endDate );
        return end >= start;
    }

    return true;
}, {
    message : 'La fecha de fin no puede ser menor que la fecha de inicio',
    path    : ['endDate'],
});


type FormData = z.infer<typeof formSchema>;


export function SectionForm({
    isOpen,
    onClose,
    section,
    onSuccess,
    sections,
}: Props ) {
    const queryClient = useQueryClient();

    const [ groupSections, setGroupSections ] = useState<OfferSection[]>([]);

    // Generate available code options (1-100) excluding codes already used in the group
    const availableCodeOptions = useMemo(() => {
        const usedCodes = groupSections
            .filter(( s ) => s.id !== section?.id ) // Exclude current section
            .map(( s ) => s.code );

        return Array.from({ length: 100 }, ( _, i ) => i + 1 )
            .filter(( code ) => !usedCodes.includes( code ))
            .map(( code ) => ({
                id      : code.toString(),
                label   : code.toString(),
                value   : code.toString(),
            }));
    }, [ groupSections, section?.id ]);


    const updateSectionApi = async ( updatedSection: any ): Promise<any> =>
        fetchApi({
            url     : `${KEY_QUERYS.SECTIONS}/${section?.id}`,
            method  : Method.PATCH,
            body    : updatedSection
        });


    const updateSectionMutation = useMutation({
        mutationFn  : updateSectionApi,
        onSuccess   : () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECTIONS] });
            onClose();
            toast( 'Sección actualizada exitosamente', successToast );
            onSuccess?.();
        },
        onError: ( mutationError: any ) => toast( `Error al actualizar la sección: ${mutationError.message}`, errorToast )
    });


    const form = useForm<FormData>({
        resolver    : zodResolver( formSchema ),
        defaultValues: {
            code        : section?.code || 0,
            spaceSizeId : section?.spaceSizeId || '',
            spaceType   : section?.spaceType || '',
            building    : section?.building || '',
            startDate   : section?.startDate ? tempoFormat( section.startDate ) : '',
            endDate     : section?.endDate ? tempoFormat( section.endDate ) : '',
            professorId : section?.professor.id || '',
        }
    });


    useEffect(() => {
        if ( section ) {
            form.reset({
                code        : section.code,
                spaceSizeId : section.spaceSizeId,
                spaceType   : section.spaceType,
                building    : section.building,
                startDate   : section.startDate ? tempoFormat( section.startDate ) : '',
                endDate     : section.endDate ? tempoFormat( section.endDate ) : '',
                professorId : section.professor.id,
            });

            const groupSections = sections.filter( ( s ) => s.groupId === section.groupId );
            setGroupSections( groupSections );
        }
    }, [ section, form, isOpen ]);


    function onSubmit( data: FormData ): void {
        const updatedSection = {
            code        : data.code,
            spaceSizeId : data.spaceSizeId  || null,
            spaceType   : data.spaceType    || null,
            building    : data.building     || null,
            startDate   : data.startDate,
            endDate     : data.endDate,
            professorId : data.professorId  || null,
        };

        console.log('🚀 ~ updatedSection:', updatedSection);

        updateSectionMutation.mutate( updatedSection );
    };


    function handleClose(): void {
        form.reset();
        onClose();
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-4">
                    <DialogTitle>Editar Sección</DialogTitle>

                    <DialogDescription>
                        Modifica los datos de la sección. Los cambios se aplicarán inmediatamente.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit( onSubmit )} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Code Field */}
                            <FormField
                                control = { form.control }
                                name    = "code"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de la Sección</FormLabel>

                                        <FormControl>
                                            <MultiSelectCombobox
                                                options             = { availableCodeOptions }
                                                defaultValues       = { field.value.toString() }
                                                onSelectionChange   = {( value: string | string[] | undefined ) => {
                                                    const numValue = typeof value === 'string' ? parseInt( value ) : 0;
                                                    field.onChange( numValue );
                                                }}
                                                placeholder         = "Seleccionar número"
                                                searchPlaceholder   = "Buscar número..."
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
                                        <ProfessorSelect
                                            label               = "Profesor"
                                            defaultValues       = { field.value ? [field.value] : [] }
                                            onSelectionChange   = {( values ) => field.onChange( values as string || null )}
                                            multiple            = { false }
                                        />

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Building Field */}
                            <FormField
                                control = { form.control }
                                name    = "building"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <BuildingSelect
                                            label               = "Edificio"
                                            defaultValues       = { field.value ? [field.value] : [] }
                                            onSelectionChange   = {( values ) => field.onChange( values as string || null )}
                                            multiple            = { false }
                                        />

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Space Type Field */}
                            <FormField
                                control = { form.control }
                                name    = "spaceType"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <SpaceTypeSelect
                                            label               = "Tipo de Espacio"
                                            defaultValues       = { field.value ? [field.value] : [] }
                                            onSelectionChange   = {( values ) => field.onChange( values as string || null )}
                                            multiple            = { false }
                                        />

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             {/* Size Field */}
                            <FormField
                                control = { form.control }
                                name    = "spaceSizeId"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <SizeSelect
                                            label               = "Tamaño"
                                            defaultValues       = { field.value as string }
                                            onSelectionChange   = {( values ) => field.onChange( values || '' )}
                                            multiple            = { false }
                                        />

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {( section?.sessions.ids?.length ?? 0 ) === 0 &&
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Start Date Field */}
                                <FormField
                                    control = { form.control }
                                    name    = "startDate"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Inicio</FormLabel>

                                            <FormControl>
                                                <CalendarSelect
                                                    value           = { field.value ? new Date( field.value ) : undefined }
                                                    onSelect        = {( date ) => field.onChange( date ? tempoFormat( date ) : '' )}
                                                    placeholder     = "Seleccionar fecha de inicio"
                                                    disabled        = {( date ) => {
                                                        if ( !section ) return true;

                                                        const periodStart = new Date( section.period.startDate );
                                                        const periodEnd = new Date( section.period.endDate );
                                                        
                                                        return date < periodStart || date > periodEnd;
                                                    }}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* End Date Field */}
                                <FormField
                                    control = { form.control }
                                    name    = "endDate"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Fin</FormLabel>

                                            <FormControl>
                                                <CalendarSelect
                                                    value           = { field.value ? new Date( field.value ) : undefined }
                                                    onSelect        = {( date ) => field.onChange( date ? tempoFormat( date ) : '' )}
                                                    placeholder     = "Seleccionar fecha de fin"
                                                    disabled        = {( date ) => {
                                                        if ( !section ) return true;

                                                        const periodStart = new Date( section.period.startDate );
                                                        const periodEnd = new Date( section.period.endDate );
                                                        
                                                        return date < periodStart || date > periodEnd;
                                                    }}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        }

                        {/* Action Buttons */}
                        <div className="flex justify-between space-x-2 pt-4">
                            <Button
                                type        = "button"
                                variant     = "outline"
                                onClick     = { handleClose }
                                disabled    = { updateSectionMutation.isPending }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type        = "submit"
                                disabled    = { updateSectionMutation.isPending }
                            >
                                {updateSectionMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
