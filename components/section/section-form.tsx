'use client'

import React, { useEffect } from 'react';
import { useForm }          from 'react-hook-form';

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
}                       from '@/components/ui/form';
import { Input }        from '@/components/ui/input';
import { Button }       from '@/components/ui/button';
import { SizeSelect }   from '@/components/shared/item-select/size-select';
import { PeriodSelect } from '@/components/shared/item-select/period-select';
// import { SectionInfo }  from '@/components/section/section-info';

import { fetchApi, Method } from '@/services/fetch';
import { KEY_QUERYS }       from '@/consts/key-queries';

import { errorToast, successToast } from '@/config/toast/toast.config';
import { OfferSection } from '@/types/offer-section.model';


interface UpdateGroupRequest {
    code        : number;
    periodId    : string;
    size        : string | null | undefined;
}

interface Props {
    isOpen          : boolean;
    onClose         : () => void;
    // group           : SectionGroup | null;
    // existingGroups  : SectionGroup[];
    section : OfferSection | null;
    onSuccess?      : () => void;
}


// Zod schema for form validation
const formSchema = z.object({
    code    : z.number().min( 1, 'El número debe ser mayor a 0' ),
    period  : z.string().min( 1, 'Debe seleccionar un período' ),
    size    : z.string().optional().nullable()
});


type FormData = z.infer<typeof formSchema>;


export function SectionForm({
    isOpen,
    onClose,
    // group,
    // existingGroups,
    section,
    onSuccess,
}: Props ) {
    const queryClient = useQueryClient();


    const updateGroupApi = async ( updatedGroup: UpdateGroupRequest & { groupId: string } ): Promise<any> =>
        fetchApi({
            url     : `Sections/groupId/${updatedGroup.groupId}`,
            method  : Method.PATCH,
            body    : {
                code        : updatedGroup.code,
                periodId    : updatedGroup.periodId,
                size        : updatedGroup.size
            }
        });


    const updateGroupMutation = useMutation({
        mutationFn: updateGroupApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECCTIONS] });
            onClose();
            toast( 'Grupo actualizado exitosamente', successToast );
            onSuccess?.();
        },
        onError: ( mutationError: any ) => toast( `Error al actualizar el grupo: ${mutationError.message}`, errorToast )
    });


    const form = useForm<FormData>({
        resolver    : zodResolver( formSchema ),
        defaultValues: {
            code    : section?.code || 0,
            // period  : section?.period.split( '-' )[0] || '',
        }
    });


    useEffect(() => {
        if ( section ) {
            form.reset({
                code    : section.code,
                // period  : section.period.split( '-' )[0],
                // size    : section.sections[0]?.size,
            });
        }
    }, [ section, form ]);


    function validateUniqueCodePeriod( code: number, period: string ): boolean {
        if ( !section ) return true;

        // const isUnique = !section.sessions.some( session => 
        //     session.code === code &&
        //     session.period.split( '-' )[0] === period
        // );

        // if ( !isUnique ) {
        //     form.setError( 'code', {
        //         type    : 'manual',
        //         message : 'Ya existe un grupo con este número y período'
        //     });

        //     form.setError( 'period', {
        //         type    : 'manual',
        //         message : 'Ya existe un grupo con este número y período'
        //     });

        //     return false;
        // }

        return true;
    };


    function onSubmit( data: FormData ): void {
        if ( !validateUniqueCodePeriod( data.code, data.period )) {
            return;
        }
        console.log('🚀 ~ file: section-form-group.tsx:151 ~ data:', data)

        // const updatedGroup: UpdateGroupRequest & { groupId: string } = {
        //     code        : data.code,
        //     periodId    : data.period,
        //     size        : data.size,
        //     // groupId     : group!.groupId
        // };

        // console.log("🚀 ~ file: section-form-group.tsx:151 ~ updatedGroup:", updatedGroup);

        // updateGroupMutation.mutate( updatedGroup );
    };


    function handleClose(): void {
        form.reset();
        onClose();
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader className="space-y-4">
                    <DialogTitle>Editar Grupo de Secciones</DialogTitle>

                    <DialogDescription>
                        Modifica los datos del grupo. Los cambios se aplicarán a todas las secciones del grupo.
                    </DialogDescription>

                    {/* Group Info */}
                    {/* {group && <SectionInfo group={group} showCode={false}/> } */}
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit( onSubmit )} className="space-y-6">
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
                                        <PeriodSelect
                                            label               = "Período"
                                            defaultValues       = { field.value || '' }
                                            multiple            = { false }
                                            onSelectionChange   = {( values ) => field.onChange( values || '' )}
                                        />

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

                        {/* Action Buttons */}
                        <div className="flex justify-between space-x-2 pt-4">
                            <Button
                                type        = "button"
                                variant     = "outline"
                                onClick     = { handleClose }
                                disabled    = { updateGroupMutation.isPending }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type        = "submit"
                                disabled    = { updateGroupMutation.isPending }
                            >
                                {updateGroupMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
