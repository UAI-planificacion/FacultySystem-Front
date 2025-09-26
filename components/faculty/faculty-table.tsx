'use client'

import { JSX } from "react";
import { useRouter } from 'next/navigation';

import { BookCopy, Users, BookOpen } from "lucide-react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
}                               from "@/components/ui/table";
import { Button }               from "@/components/ui/button";
import { Skeleton }             from "@/components/ui/skeleton";
import { Card, CardContent }    from "@/components/ui/card";
import { ScrollArea }           from "@/components/ui/scroll-area";
import { ActionButton }         from "@/components/shared/action";

import { Faculty } from "@/types/faculty.model";


export interface FacultyTableProps {
	faculties		: Faculty[];
	isLoading		: boolean;
	isError			: boolean;
	onEdit			: ( faculty: Faculty ) => void;
	onDelete		: ( id: string ) => void;
	onNewFaculty	: () => void;
}


/**
 * Faculty table skeleton component for loading state
 */
function FacultyTableSkeleton(): JSX.Element {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[200px]">Nombre</TableHead>
					<TableHead className="w-[300px]">Descripción</TableHead>
					<TableHead className="w-[120px] text-center">Solicitudes</TableHead>
					<TableHead className="w-[120px] text-center">Personal</TableHead>
					<TableHead className="w-[120px] text-center">Asignaturas</TableHead>
					<TableHead className="w-[120px] text-center">Acciones</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: 5 }).map((_, index) => (
					<TableRow key={index}>
						<TableCell>
							<Skeleton className="h-4 w-[150px]" />
						</TableCell>

						<TableCell>
							<Skeleton className="h-4 w-[250px]" />
						</TableCell>

						<TableCell className="text-center">
							<Skeleton className="h-6 w-8 mx-auto rounded-full" />
						</TableCell>

						<TableCell className="text-center">
							<Skeleton className="h-6 w-8 mx-auto rounded-full" />
						</TableCell>

						<TableCell className="text-center">
							<Skeleton className="h-6 w-8 mx-auto rounded-full" />
						</TableCell>

						<TableCell className="text-center">
							<div className="flex justify-center gap-2">
								<Skeleton className="h-8 w-8" />
								<Skeleton className="h-8 w-8" />
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

/**
 * Faculty table component that displays faculties in table format
 * @param faculties - Array of faculty data
 * @param isLoading - Loading state
 * @param isError - Error state

 * @param onEdit - Callback for editing a faculty
 * @param onDelete - Callback for deleting a faculty
 * @param onNewFaculty - Callback for creating a new faculty

 */
export function FacultyTable({
	faculties,
	isLoading,
	isError,
	onEdit,
	onDelete,
	onNewFaculty
}: FacultyTableProps ): JSX.Element {
	const router = useRouter();

	if ( isError ) {
		return (
			<div className="text-center p-8 text-muted-foreground border rounded-lg">
				Error al cargar las facultades.
			</div>
		);
	}

	if ( isLoading ) {
		return (
			<div className="border rounded-lg">
				<FacultyTableSkeleton />
			</div>
		);
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
        <Card>
            <CardContent>
                <ScrollArea className="h-[calc(100vh-400px)]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Nombre</TableHead>

                                <TableHead className="w-[300px]">Descripción</TableHead>

                                <TableHead className="w-[10px] text-center">Solicitudes</TableHead>

                                <TableHead className="w-[10px] text-center">Personal</TableHead>

                                <TableHead className="w-[10px] text-center">Asignaturas</TableHead>

                                <TableHead className="w-[10px] text-center">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {faculties.map( faculty => (
                                <TableRow key={faculty.id}>
                                    <TableCell className="font-medium">
                                        { faculty.name }
                                    </TableCell>

                                    <TableCell className="text-muted-foreground">
                                        { faculty.description || 'Sin descripción' }
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Button
                                            variant		= "outline"
                                            size		= "default"
                                            onClick		= {() => router.push(`/faculties/${faculty.id}?tab=requests`)}
                                            className	= "h-10 px-4 text-sm mx-auto flex items-center justify-center min-w-[80px]"
                                        >
                                            <BookCopy className="h-4 w-4 mr-2" />
                                            {faculty.totalRequests || 0}
                                        </Button>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Button
                                            variant		= "outline"
                                            size		= "default"
                                            onClick		= {() => router.push( `/faculties/${faculty.id}?tab=staff` )}
                                            className	= "h-10 px-4 text-sm mx-auto flex items-center justify-center min-w-[80px]"
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            {faculty.totalStaff || 0}
                                        </Button>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Button
                                            variant		= "outline"
                                            size		= "default"
                                            onClick		= {() => router.push( `/faculties/${faculty.id}?tab=subjects` )}
                                            className	= "h-10 px-4 text-sm mx-auto flex items-center justify-center min-w-[80px]"
                                        >
                                            <BookOpen className="h-4 w-4 mr-2" />
                                            {faculty.totalSubjects || 0}
                                        </Button>
                                    </TableCell>

                                    <TableCell className="w-[10px]">
                                        <ActionButton
                                            editItem    = { () => onEdit( faculty ) }
                                            deleteItem  = { () => onDelete( faculty.id )}
                                            item        = { faculty }
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
	);
}
