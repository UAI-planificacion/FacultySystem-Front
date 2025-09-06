'use client'

import React, {
    useState,
    useEffect
}                   from 'react';
import { useForm }  from 'react-hook-form';

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
import { MultiSelectCombobox }  from '@/components/shared/Combobox';
import { Card, CardContent }    from '@/components/ui/card';

import { SizeResponse } from '@/types/request';


interface Option {
    id      : string;
    label   : string;
    value   : string;
}


interface SessionCount {
    C : number;
    A : number;
    T : number;
    L : number;
}


interface SectionGroup {
    groupId         : string;
    code            : number;
    period          : string;
    sessionCounts   : SessionCount;
    schedule        : string;
    isOpen          : boolean;
    sections        : any[];
}


interface Props {
    isOpen          : boolean;
    onClose         : () => void;
    group           : SectionGroup | null;
    memoizedPeriods : Option[];
    sizes           : SizeResponse[];
    existingGroups  : SectionGroup[];
    onSave          : ( updatedGroup: SectionGroup ) => void;
}


// Zod schema for form validation
const formSchema = z.object({
    code    : z.number().min( 1, 'El número debe ser mayor a 0' ),
    period  : z.string().min( 1, 'Debe seleccionar un período' ),
    size    : z.string().optional().nullable()
});


type FormData = z.infer<typeof formSchema>;


export function SectionFormGroup({
    isOpen,
    onClose,
    group,
    memoizedPeriods,
    sizes,
    existingGroups,
    onSave
}: Props ) {
    console.log("🚀 ~ file: section-form-group.tsx:85 ~ group:", group)

    const [isSubmitting, setIsSubmitting] = useState<boolean>( false );

    const form = useForm<FormData>({
        resolver    : zodResolver( formSchema ),
        defaultValues: {
            code    : group?.code || 0,
            period  : group?.period.split( '-' )[0] || '',
            size    : group?.sections[0]?.size || '',
        }
    });


    // Reset form when group changes
    useEffect(() => {
        if ( group ) {
            form.reset({
                code    : group.code,
                period  : group.period.split( '-' )[0],
                size    : group.sections[0]?.size || '',
            });
        }
    }, [ group, form ]);


    // Custom validation for unique code and period combination
    const validateUniqueCodePeriod = ( code: number, period: string ): boolean => {
        if ( !group ) return true;

        return !existingGroups.some( existingGroup => 
            existingGroup.groupId !== group.groupId &&
            existingGroup.code === code &&
            existingGroup.period.split( '-' )[0] === period
        );
    };


    // Handle form submission
    const onSubmit = async ( data: FormData ) => {
        if ( !group ) return;

        // Validate unique code and period combination
        if ( !validateUniqueCodePeriod( data.code, data.period ) ) {
            form.setError( 'code', {
                type    : 'manual',
                message : 'Ya existe un grupo con este número y período'
            });
            form.setError( 'period', {
                type    : 'manual',
                message : 'Ya existe un grupo con este número y período'
            });
            return;
        }

        setIsSubmitting( true );

        try {
            const updatedGroup = {
                code        : data.code,
                periodId    : data.period,
                size        : data.size,
                // TODO: QUITAR
                groupId : group.groupId
            }

            console.log("🚀 ~ file: section-form-group.tsx:151 ~ updatedGroup:", updatedGroup)

            // onSave( updatedGroup );
            // onClose();
        } catch ( error ) {
            console.error( 'Error updating group:', error );
        } finally {
            setIsSubmitting( false );
        }
    };


    // Handle dialog close
    const handleClose = () => {
        form.reset();
        onClose();
    };


    // Prepare size options
    const sizeOptions = sizes?.map( size => ({
        label   : size.detail,
        value   : size.id
    })) || [];


    // Prepare period options
    const periodOptions = memoizedPeriods || [];


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Editar Grupo de Secciones</DialogTitle>

                    <DialogDescription>
                        Modifica los datos del grupo. Los cambios se aplicarán a todas las secciones del grupo.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit( onSubmit )} className="space-y-6">
                        {/* Group Info */}
                        {group && (
                            <Card>
                                <CardContent className="mt-4">
                                    <h4 className="font-medium mb-2">Información del Grupo</h4>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="font-medium">Secciones:</span>

                                            <Badge variant="secondary" className="ml-2">
                                                {group.sections.length}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1  gap-4">
                            {/* Code Field */}
                            <FormField
                                control = { form.control }
                                name    = "code"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número del Grupo</FormLabel>

                                        <FormControl>
                                            <Input
                                                type        = "number"
                                                placeholder = "Ingrese el número del grupo"
                                                {...field}
                                                onChange    = {( e ) => field.onChange( parseInt( e.target.value ) || 0 )}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Period Field */}
                            <FormField
                                control = { form.control }
                                name    = "period"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Período</FormLabel>

                                        <FormControl>
                                            <MultiSelectCombobox
                                                options             = { periodOptions }
                                                defaultValues       = { field.value || '' }
                                                onSelectionChange   = {( values ) => field.onChange( values || '' )}
                                                placeholder         = "Seleccionar período"
                                                className           = "w-full"
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
                                        <FormLabel>Tamaño</FormLabel>

                                        <FormControl>
                                            <MultiSelectCombobox
                                                options             = { sizeOptions }
                                                defaultValues       = { field.value as string }
                                                onSelectionChange   = {( values ) => field.onChange( values || '' )}
                                                placeholder         = "Seleccionar tamaño"
                                                className           = "w-full"
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
