'use client'

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";


interface PeriodTableSkeletonProps {
	rows?: number;
}


/**
 * Componente skeleton para mostrar mientras se cargan los períodos
 */
export function PeriodTableSkeleton( { rows = 5 }: PeriodTableSkeletonProps ) {
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
						<Skeleton className="h-4 w-24" />
					</TableCell>

					<TableCell className="w-[150px]">
						<Skeleton className="h-4 w-24" />
					</TableCell>

					<TableCell className="w-[150px]">
						<Skeleton className="h-4 w-24" />
					</TableCell>

					<TableCell className="w-[150px]">
						<Skeleton className="h-4 w-24" />
					</TableCell>

					<TableCell className="w-[100px]">
						<Skeleton className="h-6 w-20" />
					</TableCell>

					<TableCell className="w-[120px]">
						<div className="flex gap-2">
							<Skeleton className="h-8 w-8" />
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
export function PeriodErrorMessage() {
	return (
		<div className="text-center p-8 text-red-500">
			Error al cargar los períodos. Por favor, intenta de nuevo.
		</div>
	);
}
