"use client";

import React, { useState } from 'react';

import { Asterisk, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DaySelector } from '@/components/shared/DaySelector';
import { Time } from '@/components/shared/Time';
import { Card } from '@/components/ui/card';

import {
    errorToast,
    successToast
} from '@/config/toast/toast.config';

import { ModuleCreate, ModuleOriginal } from '@/types/module.model';
import { KEY_QUERYS } from '@/consts/key-queries';
import { Method, fetchApi } from '@/services/fetch';
import LoaderMini from '@/icons/LoaderMini';


interface ModuleModalProps {
    isOpen  : boolean;
    onClose : () => void;
    days    : number[];
}

const endpoint = 'modules';

const moduleEmpty: ModuleCreate = {
    startHour   : '',
    endHour     : '',
    code        : '',
    dayIds      : [],
}


export function AddModuleModal({
    isOpen,
    onClose,
    days
}: ModuleModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<ModuleCreate[]>([moduleEmpty]);
    const [errors, setErrors] = useState<Record<string, string[]>>({});


    function validateForm(): boolean {
        const newErrors: Record<string, string[]> = {};

        formData.forEach(( module, index ) => {
            const moduleErrors: string[] = [];

            if ( !module.code.trim() ) {
                moduleErrors.push( 'El código es requerido' );
            }

            if ( !module.startHour ) {
                moduleErrors.push( 'La hora de inicio es requerida' );
            }

            if ( !module.endHour ) {
                moduleErrors.push( 'La hora de fin es requerida' );
            }

            if ( module.startHour && module.endHour ) {
                if ( module.startHour >= module.endHour ) {
                    moduleErrors.push( 'La hora de fin debe ser posterior a la hora de inicio' );
                }
            }

            if ( !module.dayIds || module.dayIds.length === 0 ) {
                moduleErrors.push( 'Debe seleccionar al menos un día' );
            }

            if ( moduleErrors.length > 0 ) {
                newErrors[`module_${index}`] = moduleErrors;
            }
        });

        setErrors( newErrors );
        return Object.keys( newErrors ).length === 0;
    };


    /**
     * API call para crear módulos
     */
    const createModulesApi = async (data: ModuleCreate[]): Promise<ModuleOriginal[]> =>
        fetchApi<ModuleOriginal[]>({
            url    : endpoint,
            method : Method.POST,
            body   : data,
        });

    /**
     * Mutación para crear módulos
     */
    const createModulesMutation = useMutation<ModuleOriginal[], Error, ModuleCreate[]>({
        mutationFn : createModulesApi,
        onSuccess  : () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.MODULES] });
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.MODULES_ORIGINAL] });
            toast('Módulos creados exitosamente', successToast);
            onClose();
            setFormData([moduleEmpty]);
            setErrors({});
        },
        onError: (mutationError) => {
            toast(`Error al crear módulos: ${mutationError.message}`, errorToast);
        },
    });

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        if (!validateForm()) return;
        createModulesMutation.mutate(formData);
    };




    function handleChange( index: number, field: string, value: any ): void {
        setFormData(prev => prev.map((module, i) => 
            i === index ? { ...module, [field]: value } : module
        ));

        if (errors[`module_${index}`]) {
            setErrors(prev => ({ ...prev, [`module_${index}`]: [] }));
        }
    };


    function addModule(): void {
        setFormData(prev => [...prev, { ...moduleEmpty }]);
    };


    function removeModule( index: number ): void {
        if ( formData.length === 0 ) return;

        setFormData( prev => prev.filter(( _, i ) => i !== index ));

        setErrors( prev => {
            const newErrors = { ...prev };
            delete newErrors[`module_${index}`];
            return newErrors;
        });
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[680px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Crear Nuevos Módulos
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 pt-2">
                        {formData.map((module, index) => (
                            <Card key={index} className="grid grid-cols-3 gap-3 border border-zinc-300 dark:border-zinc-700 p-4 rounded-lg relative">
                                {formData.length > 1 && (
                                    <Button
                                        type        = "button"
                                        variant     = "destructive"
                                        size        = "sm"
                                        onClick     = { () => removeModule( index )}
                                        className   = "absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 z-10"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}

                                <div className="space-y-2">
                                    <Label
                                        className='flex items-center gap-0.5'
                                        htmlFor={`code-${index}`}
                                    >
                                        Código del Módulo
                                        <Asterisk className="w-[0.85rem] h-[0.85rem]" />
                                    </Label>

                                    <Input
                                        id          = { `code-${index}` }
                                        value       = { module.code }
                                        onChange    = {( e ) => handleChange( index, 'code', e.target.value )}
                                        placeholder = "Ej: 1, 2, 3..."
                                        type        = "number"
                                        min         = "1"
                                        max         = "99999"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        className='flex items-center gap-0.5'
                                        htmlFor={`startTime-${index}`}
                                    >
                                        Hora Inicio
                                        <Asterisk className="w-[0.85rem] h-[0.85rem]" />
                                    </Label>

                                    <Time
                                        value       = { module.startHour }
                                        onChange    = {( value: string ) => handleChange( index, 'startHour', value )}
                                        startHour   = { 6 }
                                        endHour     = { 23 }
                                        minuteJump  = { 5 }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        className='flex items-center gap-0.5'
                                        htmlFor={`endTime-${index}`}
                                    >
                                        Hora Fin
                                        <Asterisk className="w-[0.85rem] h-[0.85rem]" />
                                    </Label>

                                    <Time
                                        value       = { module.endHour }
                                        onChange    = {( value: string ) => handleChange( index, 'endHour', value )}
                                        startHour   = { 6 }
                                        endHour     = { 23 }
                                        minuteJump  = { 5 }
                                    />
                                </div>

                                <div className="space-y-2 col-span-3">
                                    <Label
                                        className='flex items-center gap-0.5'
                                        htmlFor={`days-${index}`}
                                    >
                                        Días en los que estará el módulo
                                        <Asterisk className="w-[0.85rem] h-[0.85rem]" />
                                    </Label>

                                    <DaySelector
                                        days        = { days }
                                        value       = { module.dayIds }
                                        onChange    = {( days: number[] ) => handleChange( index, 'dayIds', days )}
                                    />
                                </div>

                                {errors[`module_${index}`] && (
                                    <ul className="col-span-3 space-y-0.5">
                                        {errors[`module_${index}`].map((error, errorIndex) => (
                                            <li key={errorIndex} className="text-sm text-destructive flex items-center gap-0.5">
                                                <Asterisk className="w-4 h-4" />
                                                {error}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Card>
                        ))}
                    </div>

                    <Button
                        type        = "button"
                        variant     = "secondary"
                        onClick     = { addModule }
                        className   = "w-full col-span-3"
                        disabled    = { createModulesMutation.isPending }
                    >
                        { createModulesMutation.isPending && <LoaderMini /> }

                        <Plus className="h-5 w-5" />
                        Agregar Módulo
                    </Button>

                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Button
                            type        = "button"
                            variant     = "outline"
                            onClick     = { onClose }
                            disabled    = { createModulesMutation.isPending }
                        >
                            { createModulesMutation.isPending && <LoaderMini /> }

                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            disabled={createModulesMutation.isPending}
                        >
                            { createModulesMutation.isPending && <LoaderMini /> }

                            Crear Módulos
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
