'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { KEY_QUERYS }           from "@/consts/key-queries";
import { fetchApi }             from "@/services/fetch";
import { Subject }              from "@/types/subject.model";


interface Props {
    defaultValues       : string | string[] | undefined;
    onSelectionChange?  : ( selectedValues: string[] | string | undefined ) => void;
    multiple?           : boolean;
    label?              : string;
    placeholder?        : string;
}


export function SubjectSelect({
    defaultValues,
    onSelectionChange,
    multiple    = true,
    label,
    placeholder = 'Seleccionar asignaturas'
} : Props ): JSX.Element {
    const {
        data,
        isLoading,
        isError
    } = useQuery<Subject[]>({
        queryKey: [ KEY_QUERYS.SUBJECTS ],
        queryFn : () => fetchApi({ url: 'subjects' }),
    });


    const memoizedSubjects = useMemo(() => {
        return data?.map( subject => ({
            id      : subject.id,
            label   : `${subject.id} ${subject.name}`,
            value   : subject.id
        }) ) ?? [];
    }, [data]);


    return (
        <div className="space-y-2">
            { label && <Label htmlFor="subject-filter">{ label }</Label> }

            <MultiSelectCombobox
                options             = { memoizedSubjects }
                defaultValues       = { defaultValues }
                onSelectionChange   = { onSelectionChange }
                placeholder         = { placeholder }
                disabled            = { isLoading }
                multiple            = {  multiple }
            />

            { isError && 
                <span className="text-sm text-red-500">Error al cargar asignaturas</span>
            }
        </div>
    );
}
