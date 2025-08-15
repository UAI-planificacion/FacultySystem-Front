import { TableCell, TableRow } from "@/components/ui/table";


/**
 * Skeleton component for individual grade table row
 */
function GradeRowSkeleton() {
	return (
		<TableRow className="h-[73px]">
			{/* Name */}
			<TableCell className="font-medium w-[250px]">
				<div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
			</TableCell>

			{/* Headquarters ID */}
			<TableCell className="w-[250px]">
				<div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
			</TableCell>

			{/* Created At */}
			<TableCell className="w-[200px]">
				<div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
			</TableCell>

			{/* Updated At */}
			<TableCell className="w-[200px]">
				<div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
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


interface GradeTableSkeletonProps {
	rows? : number;
}


/**
 * Skeleton component for grade table with multiple rows
 */
export function GradeTableSkeleton( { rows = 5 }: GradeTableSkeletonProps ) {
	return (
		Array.from( { length: rows } ).map( ( _, index ) => (
            <GradeRowSkeleton key={ index } />
		))
	);
}


/**
 * Error message component for grade table
 */
export function GradeErrorMessage() {
	return (
		<div className="text-center p-8 text-muted-foreground">
			<div className="text-destructive">
				Error al cargar los grados. Por favor, intenta nuevamente.
			</div>
		</div>
	);
}