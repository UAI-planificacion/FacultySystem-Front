'use client'

import { JSX } from "react";

import { ToggleGroup, ToggleGroupItem }	from "@/components/ui/toggle-group";
import { CircleDashed, Eye, BadgeCheck, OctagonX } from "lucide-react";

import { Status } from "@/types/request";


interface Props {
	value			: Status;
	onValueChange	: ( value: Status ) => void;
	defaultValue?	: Status;
	className?		: string;
}


/**
 * ChangeStatus Component
 * 
 * Reusable status selector with toggle group for Request and PlanningChange forms.
 * Displays 4 status options: PENDING, REVIEWING, APPROVED, REJECTED with icons and colors.
 */
export function ChangeStatus({
	value,
	onValueChange,
	defaultValue,
	className = "w-full"
}: Props ): JSX.Element {
	return (
		<ToggleGroup
			type			= "single"
			value			= { value }
			onValueChange	= {( val: Status ) => {
				if ( val ) onValueChange( val )
			}}
			className		= { className }
			defaultValue	= { defaultValue }
		>
			<ToggleGroupItem
				value		= "PENDING"
				aria-label	= "Pendiente"
				className	= "flex-1 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none border-t border-l border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-amber-400 data-[state=on]:dark:bg-amber-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-amber-500 data-[state=on]:dark:hover:bg-amber-600"
			>
				<CircleDashed className="mr-2 h-4 w-4"/>
				Pendiente
			</ToggleGroupItem>

			<ToggleGroupItem
				value		= "REVIEWING"
				aria-label	= "Revisando"
				className	= "flex-1 rounded-none border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-blue-400 data-[state=on]:dark:bg-blue-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-blue-500 data-[state=on]:dark:hover:bg-blue-600"
			>
				<Eye className="mr-2 h-4 w-4"/>
				Revisando
			</ToggleGroupItem>

			<ToggleGroupItem
				value		= "APPROVED"
				aria-label	= "Aprobado"
				className	= "flex-1 rounded-none border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-green-400 data-[state=on]:dark:bg-green-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-green-500 data-[state=on]:dark:hover:bg-green-600"
			>
				<BadgeCheck className="mr-2 h-4 w-4"/>
				Aprobado
			</ToggleGroupItem>

			<ToggleGroupItem
				value		= "REJECTED"
				aria-label	= "Rechazado"
				className	= "flex-1 rounded-tl-none rounded-bl-none rounded-tr-lg rounded-br-lg border-t border-r border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-red-400 data-[state=on]:dark:bg-red-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-red-500 data-[state=on]:dark:hover:bg-red-600"
			>
				<OctagonX className="mr-2 h-4 w-4"/>
				Rechazado
			</ToggleGroupItem>
		</ToggleGroup>
	);
}
