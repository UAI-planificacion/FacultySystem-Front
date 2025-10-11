'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";
import { Props }                from "@/components/shared/item-select/select-props";

import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { SizeResponse } from "@/types/request";
import { useSpace }     from "@/hooks/use-space";


interface SizeSelectProps extends Props {
	buildingFilter? : string;
}


export function SizeSelect({
    defaultValues,
    onSelectionChange,
    label,
    multiple        = true,
    placeholder     = 'Seleccionar Tamaños',
    enabled         = true,
    disabled        = false,
    className       = '',
    buildingFilter
} : SizeSelectProps ): JSX.Element {
    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.SIZES ],
        queryFn     : () => fetchApi<SizeResponse[]>({ url: 'sizes' }),
        enabled
    });


	// Obtener spaces data para filtrar por building
	const {
		spacesData,
		isLoading   : isLoadingSpaces
	} = useSpace({ enabled: !!buildingFilter });


    const memoizedSizes = useMemo(() => {
		if ( !data ) return [];

		// Si hay filtro por building, filtrar sizes disponibles en ese building
		if ( buildingFilter ) {
			const availableSizes = new Set(
				spacesData
					.filter( space => space.building === buildingFilter )
					.map( space => space.size )
			);

			return data
				.filter( size => availableSizes.has( size.id ))
				.map( size => ({
					id      : size.id,
					label   : `${size.id} ${size.detail}`,
					value   : size.id
				}));
		}

		// Sin filtro, retornar todos
        return data.map( size => ({
            id      : size.id,
            label   : `${size.id} ${size.detail}`,
            value   : size.id
        }));
    }, [ data, buildingFilter, spacesData ]);


    return (
        <div className={`space-y-2 ${className}`}>
            { label && <Label htmlFor="size">{ label }</Label> }

            { isError ? (
                <div className="space-y-1">
                    <Input
                        placeholder = "ID del tamaño"
                        onChange    = {( event ) => onSelectionChange? onSelectionChange( event.target.value ): undefined}
                        className   = "h-8"
                    />

                    <span className="text-xs text-muted-foreground">
                        Error al cargar los tamaños. Ingrese el ID manualmente.
                    </span>
                </div>
            ) : (
                <MultiSelectCombobox
                    options             = { memoizedSizes }
                    defaultValues       = { defaultValues }
                    onSelectionChange   = { onSelectionChange }
                    placeholder         = { placeholder }
                    disabled            = { isLoading || isLoadingSpaces || disabled }
                    multiple            = { multiple }
                />
            )}
        </div>
    );
}
