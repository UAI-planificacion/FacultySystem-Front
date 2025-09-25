'use client'

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";


interface DayTableSkeletonProps {
	rows?: number;
}


/**
 * Componente skeleton para mostrar mientras se cargan los días
 */
export function DayTableSkeleton( { rows = 5 }: DayTableSkeletonProps ) {
	return (
		<>
			{ Array.from( { length: rows } ).map( ( _, index ) => (
				<TableRow key={ index }>
					<TableCell className="w-[100px]">
						<Skeleton className="h-4 w-16" />
					</TableCell>

					<TableCell className="w-[200px]">
						<Skeleton className="h-4 w-32" />
					</TableCell>

					<TableCell className="w-[150px]">
						<Skeleton className="h-4 w-20" />
					</TableCell>

					<TableCell className="w-[150px]">
						<Skeleton className="h-4 w-24" />
					</TableCell>

					<TableCell className="w-[120px]">
						<div className="flex gap-2">
							<Skeleton className="h-8 w-8" />
						</div>
					</TableCell>
				</TableRow>
			) ) }
		</>
	);
}


/**
 * Componente para mostrar mensaje de error
 */
export function DayErrorMessage() {
	return (
		<div className="text-center p-8 text-red-500">
			Error al cargar los días. Por favor, intenta de nuevo.
		</div>
	);
}
