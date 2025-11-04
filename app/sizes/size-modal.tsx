"use client"

import type React from "react"
import { useState, useEffect, JSX } from "react"

import { toast } from "sonner";
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
}                   from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                   from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                   from "@/components/ui/tabs";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";

import { errorToast, successToast } from "@/config/toast/toast.config";

import type {
    Size,
    SizeId,
    SizeSave
}                           from "@/types/size.model";
import { KEY_QUERYS }       from '@/consts/key-queries';
import { Method, fetchApi } from "@/services/fetch";
import LoaderMini           from "@/icons/LoaderMini";


interface SizeModalProps {
    isOpen          : boolean;
    onClose         : () => void;
    size            : Size | null;
    existingSizes   : Size[];
}


function getAvailableSizeIds( existingSizes: Size[] ): SizeId[] {
    const allSizeIds: SizeId[] = ["XS", "XE", "S", "SE", "MS", "M", "L", "XL", "XXL"];
    const usedIds = existingSizes.map(( size ) => size.id );

    return allSizeIds.filter(( id ) => !usedIds.includes( id ));
}


type RangeType = "minMax" | "greaterThan" | "lessThan";


const sizeEmpty = {
    id          : undefined,
    detail      : "",
    min         : undefined,
    max         : undefined,
    greaterThan : undefined,
    lessThan    : undefined,
}


const generateSizeDetail = (
    rangeType: RangeType,
    size: Partial<Size>
): string => ({
    'minMax'       : `${size.min ?? 0} - ${size.max ?? 0}`,
    'greaterThan'  : `> ${size.greaterThan ?? 0}`,
    'lessThan'     : `< ${size.lessThan ?? 0}`,
})[rangeType] || '';


const endpoint = 'sizes';

export function SizeModal({
    isOpen,
    onClose,
    size,
    existingSizes
}: SizeModalProps ): JSX.Element {
    const queryClient = useQueryClient();
    const [formData, setFormData]   = useState<Partial<Size>>( sizeEmpty );
    const [rangeType, setRangeType] = useState<RangeType>( "minMax" );
    const [errors, setErrors]       = useState<Record<string, string>>( {} );
    const [detail, setDetail]       = useState<string>( '' );

    useEffect(() => {
        setDetail(generateSizeDetail(rangeType, formData));
    }, [formData, rangeType]);


    useEffect(() => {
        if (size) {
            setFormData({ ...size });

            const newRangeType = size.greaterThan && !size.lessThan && !size.min && !size.max
                ? "greaterThan"
                : size.lessThan && !size.greaterThan && !size.min && !size.max
                    ? "lessThan"
                    : size.min && size.max && !size.greaterThan && !size.lessThan
                        ? "minMax"
                        : "minMax";

            setRangeType( newRangeType );
            setDetail( generateSizeDetail( newRangeType, size ));
        } else {
            setFormData( sizeEmpty );
            setRangeType( "minMax" );
            setDetail( '' );
        }

        setErrors({});
    }, [size, isOpen]);


    function validateForm(): boolean {
        const newErrors: Record<string, string> = {};

        if ( !formData.id ) {
            newErrors.id = "El ID es requerido";
        }

        if ( rangeType === "minMax" ) {
            if ( formData.min === undefined || formData.min < 0 ) {
                newErrors.min = "El valor mínimo es requerido y debe ser mayor o igual a 0"
            }

            if ( formData.max === undefined || formData.max < 0 ) {
                newErrors.max = "El valor máximo es requerido y debe ser mayor o igual a 0";
            }

            if ( formData.min !== undefined && formData.max !== undefined && formData.min >= formData.max ) {
                newErrors.max = "El valor máximo debe ser mayor que el mínimo";
            }
        } else if ( rangeType === "greaterThan" ) {
            if ( formData.greaterThan === undefined || formData.greaterThan < 0 ) {
                newErrors.greaterThan = "El valor 'mayor que' es requerido y debe ser mayor o igual a 0";
            }
        } else if ( rangeType === "lessThan" ) {
            if ( formData.lessThan === undefined || formData.lessThan <= 0 ) {
                newErrors.lessThan = "El valor 'menor que' es requerido y debe ser mayor que 0";
            }
        }

        setErrors( newErrors );
        return Object.keys( newErrors ).length === 0;
    }


    /**
     * API call para crear un tamaño
     */
    const createSizeApi = async (data: SizeSave): Promise<Size> =>
        fetchApi<Size>({
            url    : endpoint,
            method : Method.POST,
            body   : data,
        });

    /**
     * API call para actualizar un tamaño
     */
    const updateSizeApi = async (data: SizeSave): Promise<Size> =>
        fetchApi<Size>({
            url    : `${endpoint}/${data.id}`,
            method : Method.PATCH,
            body   : data,
        });

    /**
     * Mutación para crear tamaño
     */
    const createSizeMutation = useMutation<Size, Error, SizeSave>({
        mutationFn : createSizeApi,
        onSuccess  : () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SIZES] });
            toast('Tamaño creado exitosamente', successToast);
            onClose();
            resetForm();
        },
        onError: (mutationError) => {
            toast(`Error al crear tamaño: ${mutationError.message}`, errorToast);
        },
    });

    /**
     * Mutación para actualizar tamaño
     */
    const updateSizeMutation = useMutation<Size, Error, SizeSave>({
        mutationFn : updateSizeApi,
        onSuccess  : () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SIZES] });
            toast('Tamaño actualizado exitosamente', successToast);
            onClose();
            resetForm();
        },
        onError: (mutationError) => {
            toast(`Error al actualizar tamaño: ${mutationError.message}`, errorToast);
        },
    });


    /**
     * Resetea el formulario
     */
    function resetForm(): void {
        setFormData( sizeEmpty );
        setRangeType( "minMax" );
        setErrors( {} );
        setDetail( '' );
    }


    async function handleSubmit( event: React.FormEvent ): Promise<void> {
        event.preventDefault();

        if ( !validateForm() ) return;

        const sizeSave: SizeSave = {
            ...formData,
            detail,
        } as SizeSave;

        if ( rangeType === "minMax" ) {
            sizeSave.greaterThan = undefined;
            sizeSave.lessThan    = undefined;
        } else if ( rangeType === "greaterThan" ) {
            sizeSave.min         = undefined;
            sizeSave.max         = undefined;
            sizeSave.lessThan    = undefined;
        } else if ( rangeType === "lessThan" ) {
            sizeSave.min         = undefined;
            sizeSave.max         = undefined;
            sizeSave.greaterThan = undefined;
        }

        if ( size ) {
            updateSizeMutation.mutate( sizeSave );
        } else {
            createSizeMutation.mutate( sizeSave );
        }
    }


    function handleChange( field: keyof Size, value: any ) {
        setFormData(( prev ) => ({
            ...prev,
            [field]: value
        }));

        if ( errors[field] ) {
            setErrors(( prev ) => ({
                ...prev,
                [field]: ""
            }))
        }
    }


    function handleRangeTypeChange( newRangeType: RangeType ) {
        setRangeType( newRangeType );
        setErrors( {} );
    }


    const availableSizeIds = getAvailableSizeIds(
        size
            ? existingSizes.filter(( s ) => s.id !== size.id )
            : existingSizes
    );


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{size ? "Editar Tamaño" : "Añadir Tamaño"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="id">ID</Label>

                            {size ? (
                                <Input id="id" value={formData.id || ""} disabled />
                            ) : (
                                <Select value={formData.id} onValueChange={(value) => handleChange("id", value as SizeId)}>
                                    <SelectTrigger id="id">
                                        <SelectValue placeholder="Seleccionar ID" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {availableSizeIds.map(( sizeId ) => (
                                            <SelectItem key={sizeId} value={sizeId}>
                                                {sizeId}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {errors.id && <p className="text-sm text-destructive">{errors.id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="detail">Detalle</Label>

                            <Input id="detail" value={ detail } disabled />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Rango</Label>

                        <Tabs
                            defaultValue    = "minMax"
                            className       = "w-full"
                            value           = { rangeType }
                            onValueChange   = {( value ) => handleRangeTypeChange( value as RangeType )}
                        >
                            <TabsList className="grid grid-cols-3">
                                <TabsTrigger value="minMax">Rango</TabsTrigger>

                                <TabsTrigger value="greaterThan">Mayor que</TabsTrigger>

                                <TabsTrigger value="lessThan">Menor que</TabsTrigger>
                            </TabsList>

                            <TabsContent value="minMax">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="min">Mínimo</Label>

                                        <Input
                                            id          = "min"
                                            type        = "number"
                                            min         = "0"
                                            value       = { formData.min ?? "" }
                                            onChange    = {(e) => handleChange( "min", e.target.value ? Number.parseInt( e.target.value ) : undefined  )}
                                        />

                                        { errors.min && <p className="text-sm text-destructive">{ errors.min }</p> }
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max">Máximo</Label>

                                        <Input
                                            id="max"
                                            type="number"
                                            min="0"
                                            value={formData.max ?? ""}
                                            onChange={(e) => handleChange("max", e.target.value ? Number.parseInt(e.target.value) : undefined)}
                                        />

                                        {errors.max && <p className="text-sm text-destructive">{errors.max}</p>}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="greaterThan">
                                <div className="space-y-2">
                                    <Label htmlFor="greaterThan">Mayor que</Label>

                                    <Input
                                        id="greaterThan"
                                        type="number"
                                        min="0"
                                        value={formData.greaterThan ?? ""}
                                        onChange={(e) => handleChange("greaterThan", e.target.value ? Number.parseInt(e.target.value) : undefined )}
                                    />

                                    {errors.greaterThan && <p className="text-sm text-destructive">{errors.greaterThan}</p>}
                                </div>
                            </TabsContent>

                            <TabsContent value="lessThan">
                                <div className="space-y-2">
                                    <Label htmlFor="lessThan">Menor que</Label>

                                    <Input
                                        id="lessThan"
                                        type="number"
                                        min="1"
                                        value={formData.lessThan ?? ""}
                                        onChange={(e) => handleChange("lessThan", e.target.value ? Number.parseInt(e.target.value) : undefined)}
                                    />

                                    {errors.lessThan && <p className="text-sm text-destructive">{errors.lessThan}</p>}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div> 

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type        = "button"
                            variant     = "outline"
                            onClick     = { onClose }
                            disabled    = { createSizeMutation.isPending || updateSizeMutation.isPending }
                        >
                            {(createSizeMutation.isPending || updateSizeMutation.isPending) && <LoaderMini />}

                            Cancelar
                        </Button>

                        <Button
                            type        = "submit"
                            disabled    = { createSizeMutation.isPending || updateSizeMutation.isPending }
                        >
                            {(createSizeMutation.isPending || updateSizeMutation.isPending) && <LoaderMini />}

                            {size ? "Actualizar" : "Añadir"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
