import { TableCell, TableRow } from "@/components/ui/table";


/**
 * Skeleton component for individual professor table row
 */
function ProfessorRowSkeleton() {
	return (
		<TableRow className="h-[73px]">
			{/* ID */}
			<TableCell className="font-medium w-[100px]">
				<div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
			</TableCell>

			{/* Nombre */}
			<TableCell className="w-[250px]">
				<div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
			</TableCell>

			{/* Email */}
			<TableCell className="w-[250px]">
				<div className="h-4 w-40 bg-gray-300 rounded animate-pulse" />
			</TableCell>

			{/* Tipo */}
			<TableCell className="w-[120px]">
				<div className="h-6 w-16 bg-gray-300 rounded animate-pulse" />
			</TableCell>

			{/* Acciones */}
			<TableCell className="w-[120px]">
				<div className="flex justify-end gap-2">
					<div className="h-8 w-8 bg-gray-300 rounded animate-pulse" />
					<div className="h-8 w-8 bg-gray-300 rounded animate-pulse" />
				</div>
			</TableCell>
		</TableRow>
	);
}


interface ProfessorTableSkeletonProps {
	rows? : number;
}


/**
 * Skeleton component for professor table with multiple rows
 */
export function ProfessorTableSkeleton( { rows = 5 }: ProfessorTableSkeletonProps ) {
	return (
		Array.from( { length: rows } ).map( ( _, index ) => (
            <ProfessorRowSkeleton key={ index } />
		))
	);
}


/**
 * Error message component for professor table
 */
export function ProfessorErrorMessage() {
	return (
		<div className="text-center p-8 text-muted-foreground">
			<div className="text-destructive">
				Error al cargar los profesores. Por favor, intenta nuevamente.
			</div>
		</div>
	);
}