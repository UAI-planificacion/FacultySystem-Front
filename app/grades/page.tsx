'use client'

import { useState } from "react";

import {
	useMutation,
	useQuery,
	useQueryClient
}                       from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast }        from "sonner";

import {
	Card,
	CardContent,
}                               from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}                               from "@/components/ui/table";
import { 
	GradeErrorMessage,
    GradeTableSkeleton, 
}                               from "@/components/grade/grade-table-skeleton";
import { Button }               from "@/components/ui/button";
import { ScrollArea }           from "@/components/ui/scroll-area"
import { ActionButton }         from "@/components/shared/action";
import { Input }                from "@/components/ui/input";
import { Label }                from "@/components/ui/label";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { DataPagination }       from "@/components/ui/data-pagination";
import { GradeForm }            from "@/components/grade/grade-form";
import { ShowDate }             from "@/components/shared/date";

import { Grade }                    from "@/types/grade";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { usePagination }            from "@/hooks/use-pagination";


const endpoint = 'grades';


export default function GradesPage() {
    const queryClient                                   = useQueryClient();
	const [searchQuery, setSearchQuery]                 = useState( '' );
	const [isFormOpen, setIsFormOpen]                   = useState( false );
	const [editingGrade, setEditingGrade]               = useState<Grade | undefined>( undefined );
	const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
	const [deletingGradeId, setDeletingGradeId]         = useState<string | undefined>( undefined );
	const { data: gradeList, isLoading, isError }       = useQuery({
		queryKey: [ KEY_QUERYS.GRADES ],
		queryFn : () => fetchApi<Grade[]>({ url : endpoint }),
	});


	/**
	 * Filtra la lista de grados según los criterios de búsqueda
	 */
	const filteredGrades = gradeList?.filter( grade => 
		searchQuery === '' || grade.name.toLowerCase().includes( searchQuery.toLowerCase() ) 
	) || [];


	/**
	 * Hook de paginación
	 */
	const {
		currentPage,
		itemsPerPage,
		totalItems,
		totalPages,
		startIndex,
		endIndex,
		paginatedData: paginatedGrades,
		setCurrentPage,
		setItemsPerPage,
		resetToFirstPage
	} = usePagination({
		data: filteredGrades,
		initialItemsPerPage: 10
	});


	/**
	 * Resetea la página actual cuando cambian los filtros
	 */
	const handleFilterChange = ( value: string ) => {
		resetToFirstPage();
		setSearchQuery( value );
	};


	/**
	 * Abre el formulario para crear un nuevo grado
	 */
	function openNewGradeForm(): void {
		setEditingGrade( undefined );
		setIsFormOpen( true );
	}


	/**
	 * Abre el formulario para editar un grado existente
	 */
	function openEditGradeForm( grade: Grade ): void {
		setEditingGrade( grade );
		setIsFormOpen( true );
	}


	/**
	 * API call para eliminar un grado
	 */
	const deleteGradeApi = async ( gradeId: string ): Promise<Grade> =>
		fetchApi<Grade>({
            url     : `${endpoint}/${gradeId}`,
            method  : Method.DELETE
        });


	/**
	 * Mutación para eliminar un grado
	 */
	const deleteGradeMutation = useMutation<Grade, Error, string>({
		mutationFn: deleteGradeApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.GRADES] });
			setIsDeleteDialogOpen( false );
			toast( 'Grado eliminado exitosamente', successToast );
		},
		onError: (mutationError) => {
			toast(`Error al eliminar grado: ${mutationError.message}`, errorToast );
		},
	});


	/**
	 * Abre el diálogo de confirmación para eliminar un grado
	 */
	function onOpenDeleteGrade( grade: Grade ) {
		setDeletingGradeId( grade.id );
		setIsDeleteDialogOpen( true );
	}



	return (
		<main className="container mx-auto p-6 space-y-6 min-h-[calc(100vh-74px)]">
			<header className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Gestión de Grados</h1>

				<Button onClick={ openNewGradeForm }>
					<Plus className="mr-2 h-4 w-4" />
					Crear Grado
				</Button>
			</header>

			{/* Filtros */}
			<Card>
				<CardContent className="space-y-4 mt-4">
					<div className="space-y-2">
						<Label htmlFor="search">Buscar</Label>

						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />

							<Input
								id          = "search"
								placeholder = "Buscar por ID, nombre o sede..."
								value       = { searchQuery }
								onChange    = { (e) => handleFilterChange( e.target.value ) }
								className   = "pl-10"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabla de grados */}
            <div className="space-y-2">
                <Card>
                    <CardContent className="mt-5">
                        { gradeList?.length === 0 && !isLoading && !isError ? (
                            <div className="text-center p-8 text-muted-foreground">
                                No se han agregado grados.
                            </div>
                        ) : (
                            <div>
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-background">
                                        <TableRow>
                                            <TableHead className="bg-background w-[250px]">Nombre</TableHead>
                                            <TableHead className="bg-background w-[250px]">Sede</TableHead>
                                            <TableHead className="bg-background w-[200px]">Fecha de Creación</TableHead>
                                            <TableHead className="bg-background w-[200px]">Última Actualización</TableHead>
                                            <TableHead className="bg-background w-[120px] text-end">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>

                                { isError ? (
                                    <GradeErrorMessage />
                                ) 
                                : (
                                    <ScrollArea className="h-[calc(100vh-590px)]">
                                        <Table>
                                            <TableBody>
                                                {isLoading
                                                ? (
                                                    <GradeTableSkeleton rows={10} />
                                                )
                                                : (
                                                    paginatedGrades.map( grade => (
                                                        <TableRow key={ grade.id }>
                                                            <TableCell className="font-medium w-[250px]">{ grade.name }</TableCell>

                                                            <TableCell className="w-[250px]">{ grade.headquartersId }</TableCell>

                                                            <TableCell className="w-[200px]">
                                                                <ShowDate date={ grade.createdAt } />
                                                            </TableCell>

                                                            <TableCell className="w-[200px]">
                                                                <ShowDate date={ grade.updatedAt } />
                                                            </TableCell>

                                                            <TableCell className="w-[120px]">
                                                                <ActionButton
                                                                    editItem={ openEditGradeForm }
                                                                    deleteItem={ () => onOpenDeleteGrade(grade) }
                                                                    item={ grade }
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}

                                                { filteredGrades.length === 0 && searchQuery ? (
                                                    <TableRow>
                                                        <TableCell colSpan={ 5 } className="h-24 text-center">
                                                            No se encontraron resultados para &quot;{ searchQuery }&quot;
                                                        </TableCell>
                                                    </TableRow>
                                                ) : gradeList?.length === 0 && !searchQuery ? (
                                                    <TableRow>
                                                        <TableCell colSpan={ 5 } className="h-24 text-center">
                                                            No hay grados registrados
                                                        </TableCell>
                                                    </TableRow>
                                                ) : null }
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                ) }
                            </div>
                        ) }
                    </CardContent>
                </Card>

                {/* Paginación */}
                <DataPagination
                    currentPage             = { currentPage }
                    totalPages              = { totalPages }
                    totalItems              = { totalItems }
                    itemsPerPage            = { itemsPerPage }
                    onPageChange            = { setCurrentPage }
                    onItemsPerPageChange    = { setItemsPerPage }
                    startIndex              = { startIndex }
                    endIndex                = { endIndex }
                />
            </div>

			{/* Grade Form Dialog */}
			<GradeForm
				grade = { editingGrade }
				onClose     = { () => setIsFormOpen( false )}
				isOpen      = { isFormOpen }
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				isOpen      = { isDeleteDialogOpen }
				onClose     = { () => setIsDeleteDialogOpen( false ) }
				onConfirm   = { () => deleteGradeMutation.mutate( deletingGradeId! ) }
				name        = { deletingGradeId! }
				type        = "el Grado"
			/>
		</main>
	);
}
