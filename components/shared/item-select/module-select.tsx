'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";

import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { ENV }          from "@/config/envs/env";
import { Props }        from "./select-props";
import { Module }       from "@/types/request";


export function ModuleSelect({
    defaultValues,
    onSelectionChange,
    multiple    = true,
    label,
    placeholder = 'Seleccionar Módulos'
} : Props ): JSX.Element {
    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.MODULES ],
        queryFn     : () => fetchApi<Module[]>({
            url         : `${ENV.ACADEMIC_SECTION}modules/original`,
            isApi       : false
        }),
    });


    const memoizeModules = useMemo(() => {
        return data?.map( module => ({
            id      : module.id.toString(),
            label   : `${module.name} (${module.startHour} - ${module.endHour})`,
            value   : module.id.toString()
        }) ) ?? [];
    }, [data]);


    return (
        <div className="space-y-2">
            { label && <Label htmlFor="module">{ label }</Label> }

            { isError ? (
                <div className="space-y-1">
                    <Input
                        placeholder = "ID del módulo"
                        onChange    = {( event ) => onSelectionChange? onSelectionChange( event.target.value ): undefined}
                        className   = "h-8"
                    />

                    <span className="text-xs text-muted-foreground">
                        Error al cargar los módulos. Ingrese el ID manualmente.
                    </span>
                </div>
            ) : (
                <MultiSelectCombobox
                    options             = { memoizeModules }
                    defaultValues       = { defaultValues }
                    onSelectionChange   = { onSelectionChange }
                    placeholder         = { placeholder }
                    disabled            = { isLoading }
                    multiple            = {  multiple }
                />
            )}
        </div>
    );
}
