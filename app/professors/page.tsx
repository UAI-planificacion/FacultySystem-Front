'use client'

import { useState } from "react";

import {
	useMutation,
	useQuery,
	useQueryClient
}                   from "@tanstack/react-query";
import { Plus, Search }     from "lucide-react";
import { toast }    from "sonner";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
}                               from "@/components/ui/select";
import { DataPagination }       from "@/components/ui/data-pagination";
import {
	Card,
	CardContent,
	CardHeader,
    CardTitle,
}                               from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}                               from "@/components/ui/table";
import { ProfessorForm }        from "@/components/professor/professor-form";
import { 
	ProfessorErrorMessage,
    ProfessorTableSkeleton, 
}                               from "@/components/professor/professor-table-skeleton";
import { Button }               from "@/components/ui/button";
import { ScrollArea }           from "@/components/ui/scroll-area"
import { ActionButton }         from "@/components/shared/action";
import { Input }                from "@/components/ui/input";
import { Label }                from "@/components/ui/label";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Badge }                from "@/components/ui/badge";

import {  Professor }               from "@/types/professor";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { ENV }                      from "@/config/envs/env";
import { usePagination }            from "@/hooks/use-pagination";


const endpoint = 'professors';


type TypeFilter = 'mock' | 'real' | 'all';


export default function ProfessorsPage() {
    const queryClient                                   = useQueryClient();
	const [searchQuery, setSearchQuery]                 = useState( '' );
	const [mockFilter, setMockFilter]                   = useState<TypeFilter>( 'all' );
	const [isFormOpen, setIsFormOpen]                   = useState( false );
	const [editingProfessor, setEditingProfessor]       = useState<Professor | undefined>( undefined );
	const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
	const [deletingProfessorId, setDeletingProfessorId] = useState<string | undefined>( undefined );
	const { data: professorList, isLoading, isError }   = useQuery({
		queryKey: [ KEY_QUERYS.PROFESSORS ],
		queryFn : () => fetchApi<Professor[]>({
            url     : `${ENV.ACADEMIC_SECTION}${endpoint}`,
            isApi   : false
        }),
	});


	/**
	 * Filtra la lista de profesores según los criterios de búsqueda
	 */
	const filteredProfessors = professorList?.filter( professor => {
		const matchesSearch = searchQuery === '' || 
			professor.id.toLowerCase().includes( searchQuery.toLowerCase() ) ||
			professor.name.toLowerCase().includes( searchQuery.toLowerCase() ) ||
			professor.email?.toLowerCase().includes( searchQuery.toLowerCase() );

        const matchesMock = {
            'mock'  : professor.isMock === true,
            'real'  : professor.isMock === false,
            'all'   : true,
        }[mockFilter];

		return matchesSearch && matchesMock;
	}) || [];


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
		paginatedData: paginatedProfessors,
		setCurrentPage,
		setItemsPerPage,
		resetToFirstPage
	} = usePagination({
		data: filteredProfessors,
		initialItemsPerPage: 10
	});


	/**
	 * Resetea la página actual cuando cambian los filtros
	 */
	const handleFilterChange = ( filterType: 'search' | 'mock', value: string ) => {
		resetToFirstPage();

		switch ( filterType ) {
			case 'search':
				setSearchQuery( value );
				break;
			case 'mock':
				setMockFilter( value as TypeFilter );
				break;
		}
	};


	/**
	 * Abre el formulario para crear un nuevo profesor
	 */
	function openNewProfessorForm(): void {
		setEditingProfessor( undefined );
		setIsFormOpen( true );
	}


	/**
	 * Abre el formulario para editar un profesor existente
	 */
	function openEditProfessorForm( professor: Professor ): void {
		setEditingProfessor( professor );
		setIsFormOpen( true );
	}


	/**
	 * API call para eliminar un profesor
	 */
	const deleteProfessorApi = async ( professorId: string ): Promise<Professor> =>
		fetchApi<Professor>({
            isApi   : false,
            url     : `${ENV.ACADEMIC_SECTION}${endpoint}/${professorId}`,
            method  : Method.DELETE
        });


	/**
	 * Mutación para eliminar un profesor
	 */
	const deleteProfessorMutation = useMutation<Professor, Error, string>({
		mutationFn: deleteProfessorApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.PROFESSORS] });
			setIsDeleteDialogOpen( false );
			toast( 'Profesor eliminado exitosamente', successToast );
		},
		onError: (mutationError) => {
			toast(`Error al eliminar profesor: ${mutationError.message}`, errorToast );
		},
	});


	/**
	 * Abre el diálogo de confirmación para eliminar un profesor
	 */
	function onOpenDeleteProfessor( professor: Professor ) {
		setDeletingProfessorId( professor.id );
		setIsDeleteDialogOpen( true );
	}


	/**
	 * Renderiza el badge para indicar si es profesor de prueba
	 */
	function renderMockBadge( isMock: boolean ) {
		return isMock ? (
			<Badge variant="secondary" className="bg-orange-100 text-orange-800">
				Prueba
			</Badge>
		) : (
			<Badge variant="default" className="bg-green-100 text-green-800">
				Real
			</Badge>
		);
	}
	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Gestión de Profesores</h1>

				<Button onClick={ openNewProfessorForm }>
					<Plus className="mr-2 h-4 w-4" />
					Crear Profesor
				</Button>
			</div>

			{/* Filtros */}
			<Card>
				<CardContent className="space-y-4 mt-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="search">Buscar</Label>

							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />

								<Input
									id          = "search"
									placeholder = "Buscar por ID, nombre o email..."
									value       = { searchQuery }
									onChange    = { (e) => handleFilterChange( 'search', e.target.value ) }
									className   = "pl-10"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="mock-filter">Tipo de Profesor</Label>

							<Select value={ mockFilter } onValueChange={ (value) => handleFilterChange( 'mock', value ) }>
								<SelectTrigger id="mock-filter">
									<SelectValue placeholder="Seleccionar tipo" />
								</SelectTrigger>

								<SelectContent>
									<SelectItem value="all">Todos</SelectItem>
									<SelectItem value="real">Reales</SelectItem>
									<SelectItem value="mock">Prueba</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabla de profesores */}
            <div className="grid space-y-2">
                <Card>
                    <CardContent className="mt-5">
                        { professorList?.length === 0 && !isLoading && !isError ? (
                            <div className="text-center p-8 text-muted-foreground">
                                No se han agregado profesores.
                            </div>
                        ) : (
                            <div>
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-background">
                                        <TableRow>
                                            <TableHead className="bg-background w-[100px]">ID</TableHead>
                                            <TableHead className="bg-background w-[250px]">Nombre</TableHead>
                                            <TableHead className="bg-background w-[250px]">Email</TableHead>
                                            <TableHead className="bg-background w-[120px]">Tipo</TableHead>
                                            <TableHead className="bg-background w-[120px] text-end">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>

                                { isError ? (
                                    <ProfessorErrorMessage />
                                ) 
                                : (
                                    <ScrollArea className="h-[calc(100vh-590px)]">
                                        <Table>
                                            <TableBody>
                                                {isLoading
                                                ? (
                                                    <ProfessorTableSkeleton rows={10} />
                                                )
                                                : (
                                                    paginatedProfessors.map( professor => (
                                                        <TableRow key={ professor.id }>

                                                            <TableCell className="font-medium w-[100px]">{ professor.id }</TableCell>

                                                            <TableCell className="w-[250px]">{ professor.name }</TableCell>

                                                            <TableCell className="w-[250px]">{ professor.email || '-' }</TableCell>

                                                            <TableCell className="w-[120px]">
                                                                { renderMockBadge( professor.isMock ) }
                                                            </TableCell>

                                                            <TableCell className="w-[120px]">
                                                                <ActionButton
                                                                    editItem={ openEditProfessorForm }
                                                                    deleteItem={ () => onOpenDeleteProfessor(professor) }
                                                                    item={ professor }
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}

                                                { filteredProfessors.length === 0 && searchQuery ? (
                                                    <TableRow>
                                                        <TableCell colSpan={ 5 } className="h-24 text-center">
                                                            No se encontraron resultados para &quot;{ searchQuery }&quot;
                                                        </TableCell>
                                                    </TableRow>
                                                ) : professorList?.length === 0 && !searchQuery ? (
                                                    <TableRow>
                                                        <TableCell colSpan={ 5 } className="h-24 text-center">
                                                            No hay profesores registrados
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

			{/* Professor Form Dialog */}
			<ProfessorForm
				initialData = { editingProfessor }
				onClose     = { () => setIsFormOpen( false )}
				isOpen      = { isFormOpen }
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				isOpen      = { isDeleteDialogOpen }
				onClose     = { () => setIsDeleteDialogOpen( false )}
				onConfirm   = { () => deleteProfessorMutation.mutate( deletingProfessorId! ) }
				name        = { deletingProfessorId! }
				type        = "el Profesor"
			/>
		</div>
	);
}
