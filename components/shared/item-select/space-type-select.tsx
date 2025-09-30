'use client'

import { JSX, useMemo } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                           from "@/components/ui/select";
import { Label }            from "@/components/ui/label";
import { MultiSelectCombobox } from "@/components/shared/Combobox";
import { Props }            from "./select-props";

import { SpaceType }        from "@/types/request-detail.model";
import { getSpaceType }     from "@/lib/utils";


export function SpaceTypeSelect({
    defaultValues,
    onSelectionChange,
    label,
    multiple = false,
    placeholder = 'Selecciona un tipo de espacio',
    disabled = false,
    className
} : Props ): JSX.Element {
    
    const spaceTypeOptions = useMemo(() => {
        const options = Object.values( SpaceType ).map(( spaceType ) => ({
            id      : spaceType,
            label   : getSpaceType( spaceType ),
            value   : spaceType
        }));
        
        // Agregar opción "Sin especificar" al inicio
        return [
            { id: 'none', label: 'Sin especificar', value: 'none' },
            ...options
        ];
    }, []);

    if ( multiple ) {
        return (
            <div className={`space-y-2 ${className}`}>
                { label && <Label htmlFor="spaceType">{ label }</Label> }

                <MultiSelectCombobox
                    options             = { spaceTypeOptions }
                    defaultValues       = { defaultValues }
                    onSelectionChange   = { onSelectionChange }
                    placeholder         = { placeholder }
                    disabled            = { disabled }
                    multiple            = { true }
                />
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            { label && <Label htmlFor="spaceType">{ label }</Label> }

            <Select
                onValueChange   = { onSelectionChange }
                value           = { defaultValues as string }
                disabled        = { disabled }
            >
                <SelectTrigger>
                    <SelectValue placeholder={ placeholder } />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="none">Sin especificar</SelectItem>
                    { Object.values( SpaceType ).map(( spaceType ) => (
                        <SelectItem key={ spaceType } value={ spaceType }>
                            { getSpaceType( spaceType )}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
