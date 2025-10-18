'use client'

import { JSX, useMemo } from "react";

import { useQuery }				from "@tanstack/react-query";

import { MultiSelectCombobox }	from "@/components/shared/Combobox";
import { Label }				from "@/components/ui/label";

import { KEY_QUERYS }					from "@/consts/key-queries";
import { fetchApi }						from "@/services/fetch";
import { SessionWithoutPlanningChange }	from "@/types/planning-change.model";
import { tempoFormat }					from "@/lib/utils";


interface Props {
	defaultValues		: string | string[] | undefined;
	onSelectionChange?	: ( selectedValues: string[] | string | undefined ) => void;
	multiple?			: boolean;
	label?				: string;
	placeholder?		: string;
	enabled?			: boolean;
	disabled?			: boolean;
	className?			: string;
}


/**
 * SessionWithoutPlanningChangeSelect Component
 * 
 * Selects sessions that don't have a planning change assigned yet.
 * Label format: {subject.id} - {code} | {sessionName} - {date} - {startHour}-{endHour} {difference}
 * Example: "MAT101 - 1 | C - Jue 17 Oct 2024 - 08:00-10:00 A"
 */
export function SessionWithoutPlanningChangeSelect({
	defaultValues,
	onSelectionChange,
	label,
	multiple		= false,
	placeholder		= 'Seleccionar Sesión',
	enabled			= true,
	disabled		= false,
	className
}: Props ): JSX.Element {
	const {
		data,
		isLoading,
		isError,
	} = useQuery({
		queryKey	: [ KEY_QUERYS.PLANNING_CHANGE, 'session-without' ],
		queryFn		: () => fetchApi<SessionWithoutPlanningChange[]>({ url: 'planning-change/without/session' }),
		enabled
	});


	const memoizedSessions = useMemo(() => {
		return data?.map( session => {
			// dayModule is now a single object, not an array
			const moduleInfo = session.dayModule 
				? `${ session.dayModule.module.startHour }-${ session.dayModule.module.endHour } ${ session.dayModule.module.difference || '' }`.trim()
				: '';

			const formattedDate = tempoFormat( session.date );

			return {
				id		: session.id,
				label	: `${ session.section.subject.id }-${ session.section.code } | ${ session.name } - ${ formattedDate } - ${ moduleInfo }`,
				value	: session.id
			};
		}) ?? [];
	}, [data]);


	return (
		<div className={ `space-y-2 ${ className }` }>
			{ label && <Label htmlFor="session-without-planning">{ label }</Label> }

			<MultiSelectCombobox
				options				= { memoizedSessions }
				defaultValues		= { defaultValues }
				onSelectionChange	= { onSelectionChange }
				placeholder			= { placeholder }
				disabled			= { isLoading || disabled }
				multiple			= { multiple }
			/>

			{ isError && 
				<span className="text-sm text-red-500">Error al cargar sesiones</span>
			}
		</div>
	);
}
