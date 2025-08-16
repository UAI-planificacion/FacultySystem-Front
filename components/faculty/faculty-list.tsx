'use client'

import { JSX } from "react";

import { FacultyCard }              from "@/components/faculty/faculty-card";
import { FacultyCardSkeletonGrid }  from "@/components/faculty/faculty-card-skeleton";
import { Button }                   from "@/components/ui/button";

import { Faculty } from "@/types/faculty.model";


export interface FacultyListProps {
	faculties		: Faculty[];
	isLoading		: boolean;
	isError			: boolean;
	onEdit			: ( faculty: Faculty ) => void;
	onDelete		: ( id: string ) => void;
	onNewFaculty	: () => void;
}


/**
 * Faculty list component that displays faculties in card format
 * @param faculties - Array of faculty data
 * @param isLoading - Loading state
 * @param isError - Error state

 * @param onEdit - Callback for editing a faculty
 * @param onDelete - Callback for deleting a faculty
 * @param onNewFaculty - Callback for creating a new faculty

 */
export function FacultyList({
	faculties,
	isLoading,
	isError,
	onEdit,
	onDelete,
	onNewFaculty
}: FacultyListProps ): JSX.Element {

	if ( isError ) {
		return (
			<div className="text-center p-8 text-muted-foreground">
				Error al cargar las facultades.
			</div>
		);
	}

	if ( isLoading ) {
		return <FacultyCardSkeletonGrid count={12} />;
	}

	if ( faculties.length === 0 ) {
		return (
			<div className="text-center p-12 border rounded-lg border-dashed">
				<p className="text-muted-foreground">
					No se encontraron facultades.
				</p>

				<Button onClick={onNewFaculty} variant="outline" className="mt-4">
					Crea tu primera facultad
				</Button>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{faculties.map( faculty => (
				<FacultyCard
					key			= { faculty.id }
					faculty		= { faculty }
					onEdit		= { onEdit }
					onDelete	= { onDelete }
				/>
			))}
		</div>
	);
}