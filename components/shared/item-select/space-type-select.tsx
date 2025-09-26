'use client'

import { JSX } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                       from "@/components/ui/select";
import { Label }        from "@/components/ui/label";
import { Props }        from "./select-props";

import { SpaceType }    from "@/types/request-detail.model";
import { getSpaceType } from "@/lib/utils";


export function SpaceTypeSelect({
    defaultValues,
    onSelectionChange,
    label,
    placeholder = 'Selecciona un tipo de espacio',
    disabled = false,
    className
} : Props ): JSX.Element {
    return (
        <div className={`space-y-2 ${className}`}>
            { label && <Label htmlFor="professors">{ label }</Label> }

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
