'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Props }                from "@/components/shared/item-select/select-props";

import { KEY_QUERYS }       from "@/consts/key-queries";
import { fetchApi }         from "@/services/fetch";
import { FacultyResponse }  from "@/types/faculty.model";


export function FacultySelect({
	defaultValues,
	onSelectionChange,
	label,
	multiple    = true,
	placeholder = 'Seleccionar facultades',
	enabled     = true,
	queryKey    = [ KEY_QUERYS.FACULTIES ],
	url,
	className
} : Props ): JSX.Element {
	const {
		data,
		isLoading,
		isError
	} = useQuery<FacultyResponse>({
		queryKey,
		queryFn : () => fetchApi({
			url : url || KEY_QUERYS.FACULTIES
		}),
		enabled
	});


	const memoizedFaculties = useMemo(() => {
		return data?.faculties?.map( faculty => ({
			id      : faculty.id,
			label   : `${faculty.id} - ${faculty.name}`,
			value   : faculty.id
		}) ) ?? [];
	}, [data]);


	return (
		<div className={`space-y-2 ${className}`}>
			{ label && <Label htmlFor="faculty-filter">{ label }</Label> }

			<MultiSelectCombobox
				options             = { memoizedFaculties }
				defaultValues       = { defaultValues }
				onSelectionChange   = { onSelectionChange }
				placeholder         = { placeholder }
				disabled            = { isLoading }
				multiple            = { multiple }
			/>

			{ isError &&
				<span className="text-sm text-red-500">Error al cargar facultades</span>
			}
		</div>
	);
}
