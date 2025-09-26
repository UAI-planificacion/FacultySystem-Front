'use client'

import { useState } from "react";

import {
	useQuery,
	useQueryClient
}                       from "@tanstack/react-query";
import { Edit, Search } from "lucide-react";


import {
	Card,
	CardContent,
}                           from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}                           from "@/components/ui/table";
import { DayForm }          from "@/components/days/day-form";
import { 
	DayErrorMessage,
    DayTableSkeleton, 
}                           from "@/components/days/day-table-skeleton";
import { DataPagination }   from "@/components/ui/data-pagination";
import { Button }           from "@/components/ui/button";
import { ScrollArea }       from "@/components/ui/scroll-area"
import { Input }            from "@/components/ui/input";
import { Label }            from "@/components/ui/label";
import { PageLayout }       from "@/components/layout/page-layout";

import { Day }              from "@/types/day.model";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { fetchApi }         from "@/services/fetch";
import { usePagination }    from "@/hooks/use-pagination";


const endpoint = 'days';


export default function DaysPage() {
    const queryClient                           = useQueryClient();
	const [searchQuery, setSearchQuery]         = useState( '' );
	const [isFormOpen, setIsFormOpen]           = useState( false );
	const [editingDay, setEditingDay]           = useState<Day | undefined>( undefined );


    const {
        data: dayList,
        isLoading,
        isError
    }   = useQuery({
		queryKey: [ KEY_QUERYS.DAYS ],
		queryFn : () => fetchApi<Day[]>({ url: endpoint }),
	});


	/**
	 * Filtra la lista de días según los criterios de búsqueda
	 */
	const filteredDays = dayList?.filter( day => {
		const matchesSearch = searchQuery === ''
            || day.id.toLowerCase().includes( searchQuery.toLowerCase() )
            || day.name.toLowerCase().includes( searchQuery.toLowerCase() )
            || day.shortName.toLowerCase().includes( searchQuery.toLowerCase() )
            || day.mediumName.toLowerCase().includes( searchQuery.toLowerCase() );

		return matchesSearch;
	}) || [];


	/**
	 * Hook de paginación
	 */
	const {
		currentPage,
		itemsPerPage,
		totalItems,
		totalPages,
		paginatedData: paginatedDays,
		setCurrentPage,
		setItemsPerPage,
		resetToFirstPage
	} = usePagination({
		data: filteredDays,
		initialItemsPerPage: 10
	});


	/**
	 * Resetea la página actual cuando cambian los filtros
	 */
	const handleSearchChange = ( value: string ) => {
		resetToFirstPage();
		setSearchQuery( value );
	};


	/**
	 * Abre el formulario para editar un día existente
	 */
	function openEditDayForm( day: Day ): void {
		setEditingDay( day );
		setIsFormOpen( true );
	}


	return (
		<PageLayout 
			title="Gestión de Días"
		>

			{/* Filtros */}
			<Card>
				<CardContent className="space-y-4 mt-4">
					<div className="grid grid-cols-1 md:grid-cols-1 gap-4">
						<div className="space-y-2">
							<Label htmlFor="search">Buscar</Label>

							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />

								<Input
									id          = "search"
									placeholder = "Buscar por ID, nombre, nombre corto o nombre mediano..."
									value       = { searchQuery }
									onChange    = { (e) => handleSearchChange( e.target.value ) }
									className   = "pl-10"
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabla de días */}
            <div className="space-y-4">
                <Card>
                    <CardContent className="mt-5">
                        { dayList?.length === 0 && !isLoading && !isError ? (
                            <div className="text-center p-8 text-muted-foreground">
                                No se han encontrado días.
                            </div>
                        ) : (
                            <div>
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-background">
                                        <TableRow>
                                            <TableHead className="bg-background w-[100px]">ID</TableHead>
                                            <TableHead className="bg-background w-[200px]">Nombre</TableHead>
                                            <TableHead className="bg-background w-[150px]">Nombre Corto</TableHead>
                                            <TableHead className="bg-background w-[150px]">Nombre Mediano</TableHead>
                                            <TableHead className="bg-background w-[120px] text-end">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>

                                { isError ? (
                                    <DayErrorMessage />
                                ) 
                                : (
                                    <ScrollArea className="h-[calc(100vh-500px)]">
                                        <Table>
                                            <TableBody>
                                                {isLoading
                                                ? (
                                                    <DayTableSkeleton rows={10} />
                                                )
                                                : (
                                                    paginatedDays.map( day => (
                                                        <TableRow key={ day.id }>

                                                            <TableCell className="font-medium w-[100px]">{ day.id }</TableCell>

                                                            <TableCell className="w-[200px]">{ day.name }</TableCell>

                                                            <TableCell className="w-[150px]">{ day.shortName || '-' }</TableCell>

                                                            <TableCell className="w-[150px]">{ day.mediumName || '-' }</TableCell>

                                                            <TableCell className="w-[120px]">
                                                                <div className="flex justify-end">
                                                                    <Button
                                                                        title       = "Editar"
                                                                        variant     = "outline"
                                                                        size        = "icon"
                                                                        onClick={ () => openEditDayForm( day ) }
                                                                    >
                                                                        <Edit className="h-4 w-4 text-blue-500" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}

                                                { filteredDays.length === 0 && searchQuery ? (
                                                    <TableRow>
                                                        <TableCell colSpan={ 5 } className="h-24 text-center">
                                                            No se encontraron resultados para &quot;{ searchQuery }&quot;
                                                        </TableCell>
                                                    </TableRow>
                                                ) : dayList?.length === 0 && !searchQuery ? (
                                                    <TableRow>
                                                        <TableCell colSpan={ 5 } className="h-24 text-center">
                                                            No hay días registrados
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
                />
            </div>

			{/* Day Form Dialog */}
			<DayForm
				day     = { editingDay }
				onClose = { () => setIsFormOpen( false )}
				isOpen  = { isFormOpen }
			/>
		</PageLayout>
	);
}