'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { KEY_QUERYS }           from "@/consts/key-queries";
import { fetchApi }             from "@/services/fetch";
import { SizeResponse }         from "@/types/request";
import { ENV }                  from "@/config/envs/env";


interface Props {
    defaultValues       : string | string[] | undefined;
    onSelectionChange?  : ( selectedValues: string[] | string | undefined ) => void;
    multiple?           : boolean;
    label?              : string;
    placeholder?        : string;
}


export function SizeSelect({
    defaultValues,
    onSelectionChange,
    multiple    = true,
    label,
    placeholder = 'Seleccionar Tamaños'
} : Props ): JSX.Element {
    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.SIZE ],
        queryFn     : () => fetchApi<SizeResponse[]>({
            url         : `${ENV.ACADEMIC_SECTION}sizes`,
            isApi       : false
        }),
    });


    const memoizedSizes = useMemo(() => {
        return data?.map( size => ({
            id      : size.id,
            label   : `${size.id} ${size.detail}`,
            value   : size.id
        }) ) ?? [];
    }, [data]);


    return (
        <div className="space-y-2">
            { label && <Label htmlFor="size">{ label }</Label> }

            <MultiSelectCombobox
                options             = { memoizedSizes }
                defaultValues       = { defaultValues }
                onSelectionChange   = { onSelectionChange }
                placeholder         = { placeholder }
                disabled            = { isLoading }
                multiple            = {  multiple }
            />

            { isError && 
                <span className="text-sm text-red-500">Error al cargar tamaños</span>
            }
        </div>
    );
}
