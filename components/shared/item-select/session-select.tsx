'use client'

import { JSX, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Label }                from "@/components/ui/label";
import { Input }                from "@/components/ui/input";

import { KEY_QUERYS }       from "@/consts/key-queries";
import { fetchApi }         from "@/services/fetch";
import { OfferSession }     from "@/types/offer-section.model";
import { sessionLabels }    from "@/components/section/section.config";


interface Props {
	defaultValues		: string[];
	onSelectionChange	: ( value: string | string[] | undefined ) => void;
	label?				: string;
	multiple?			: boolean;
	placeholder?		: string;
	enabled?			: boolean;
	disabled?			: boolean;
}


export function SessionSelect({
	defaultValues,
	onSelectionChange,
	label,
	multiple	= false,
	placeholder	= 'Seleccionar Sesión',
	enabled		= true,
	disabled	= false,
}: Props ): JSX.Element {
	const {
		data,
		isLoading,
		isError,
	} = useQuery({
		queryKey	: [KEY_QUERYS.SESSIONS],
		queryFn		: () => fetchApi<OfferSession[]>({ url: KEY_QUERYS.SESSIONS }),
		enabled
	});


	const memoizeSessions = useMemo(() => {
		return data?.map( session => {
			const sectionCode		= session.section?.code || 'N/A';
			const subjectName		= session.section?.subject?.name || 'N/A';
			const sessionName		= sessionLabels[session.name] || session.name;
			const date				= new Date( session.date ).toLocaleDateString( 'es-ES' );
			const moduleCode		= session.module?.code || 'N/A';
			const startHour			= session.module?.startHour || '';
			const endHour			= session.module?.endHour || '';
			const difference		= session.module?.difference ? `-${session.module.difference}` : '';

			return {
				id		: session.id,
				label	: `${sectionCode}-${subjectName} - ${sessionName} - ${date} - ${moduleCode} - ${startHour}-${endHour}${difference}`,
				value	: session.id
			};
		}) ?? [];
	}, [data]);


	return (
		<div className="space-y-2">
			{ label && <Label htmlFor="session">{ label }</Label> }

			{ isError ? (
				<div className="space-y-1">
					<Input
						placeholder	= "ID de la sesión"
						onChange	= {( event ) => onSelectionChange ? onSelectionChange( event.target.value ) : undefined}
						className	= "h-8"
					/>

					<span className="text-xs text-muted-foreground">
						Error al cargar las sesiones. Ingrese el ID manualmente.
					</span>
				</div>
			) : (
				<MultiSelectCombobox
					options				= { memoizeSessions }
					defaultValues		= { defaultValues }
					onSelectionChange	= { onSelectionChange }
					placeholder			= { placeholder }
					disabled			= { isLoading || disabled }
					multiple			= { multiple }
				/>
			)}
		</div>
	);
}
