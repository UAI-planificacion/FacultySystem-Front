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
}                               from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}                               from "@/components/ui/table";
import { PeriodForm }           from "@/components/periods/period-form";
import { 
	PeriodErrorMessage,
    PeriodTableSkeleton, 
}                               from "@/components/periods/period-table-skeleton";
import { Button }               from "@/components/ui/button";
import { ScrollArea }           from "@/components/ui/scroll-area"
import { ActionButton }         from "@/components/shared/action";
import { Input }                from "@/components/ui/input";
import { Label }                from "@/components/ui/label";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Badge }                from "@/components/ui/badge";
import { PageLayout }           from "@/components/layout/page-layout";

import { Period, PeriodStatus }     from "@/types/periods.model";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { usePagination }            from "@/hooks/use-pagination";


const endpoint = 'periods';


type StatusFilter = PeriodStatus | 'all';


export default function PeriodsPage() {
    const queryClient                                   = useQueryClient();
	const [searchQuery, setSearchQuery]                 = useState( '' );
	const [statusFilter, setStatusFilter]               = useState<StatusFilter>( 'all' );
	const [isFormOpen, setIsFormOpen]                   = useState( false );
	const [editingPeriod, setEditingPeriod]             = useState<Period | undefined>( undefined );
	const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
	const [deletingPeriodId, setDeletingPeriodId]       = useState<string | undefined>( undefined );


    const {
        data: periodList,
        isLoading,
        isError
    }   = useQuery({
		queryKey: [ KEY_QUERYS.PERIODS ],
		queryFn : () => fetchApi<Period[]>({ url: endpoint }),
	});


	/**
	 * Filtra la lista de períodos según los criterios de búsqueda
	 */
	const filteredPeriods = periodList?.filter( period => {
		const matchesSearch = searchQuery === ''
            || period.id.toLowerCase().includes( searchQuery.toLowerCase() )
            || period.name.toLowerCase().includes( searchQuery.toLowerCase() )
            || (period.startDate && period.startDate.toLowerCase().includes( searchQuery.toLowerCase() ));

        const matchesStatus = statusFilter === 'all' || period.status === statusFilter;

		return matchesSearch && matchesStatus;
	}) || [];


	/**
	 * Hook de paginación
	 */
	const {
		currentPage,
		itemsPerPage,
		totalItems,
		totalPages,
		paginatedData: paginatedPeriods,
		setCurrentPage,
		setItemsPerPage,
		resetToFirstPage
	} = usePagination({
		data: filteredPeriods,
		initialItemsPerPage: 10
	});


	/**
	 * Resetea la página actual cuando cambian los filtros
	 */
	const handleFilterChange = ( filterType: 'search' | 'status', value: string ) => {
		resetToFirstPage();

		switch ( filterType ) {
			case 'search':
				setSearchQuery( value );
				break;
			case 'status':
				setStatusFilter( value as StatusFilter );
				break;
		}
	};


	/**
	 * Abre el formulario para crear un nuevo período
	 */
	function openNewPeriodForm(): void {
		setEditingPeriod( undefined );
		setIsFormOpen( true );
	}


	/**
	 * Abre el formulario para editar un período existente
	 */
	function openEditPeriodForm( period: Period ): void {
		setEditingPeriod( period );
		setIsFormOpen( true );
	}


	/**
	 * API call para eliminar un período
	 */
	const deletePeriodApi = async ( periodId: string ): Promise<Period> =>
		fetchApi<Period>({
            url     : `${endpoint}/${periodId}`,
            method  : Method.DELETE
        });


	/**
	 * Mutación para eliminar un período
	 */
	const deletePeriodMutation = useMutation<Period, Error, string>({
		mutationFn: deletePeriodApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.PERIODS] });
			setIsDeleteDialogOpen( false );
			toast( 'Período eliminado exitosamente', successToast );
		},
		onError: (mutationError) => {
			toast(`Error al eliminar período: ${mutationError.message}`, errorToast );
		},
	});


	/**
	 * Abre el diálogo de confirmación para eliminar un período
	 */
	function onOpenDeletePeriod( period: Period ) {
		setDeletingPeriodId( period.id );
		setIsDeleteDialogOpen( true );
	}


	/**
	 * Renderiza el badge para el estado del período
	 */
	function renderStatusBadge( status: PeriodStatus ) {
		const statusConfig = {
			[PeriodStatus.Opened]: {
				variant: 'default' as const,
				className: 'bg-green-100 text-green-800',
				label: 'Abierto'
			},
			[PeriodStatus.InProgress]: {
				variant: 'secondary' as const,
				className: 'bg-blue-100 text-blue-800',
				label: 'En Progreso'
			},
			[PeriodStatus.Completed]: {
				variant: 'outline' as const,
				className: 'bg-gray-100 text-gray-800',
				label: 'Completado'
			}
		};

		const config = statusConfig[status];
		return (
			<Badge variant={ config.variant } className={ config.className }>
				{ config.label }
			</Badge>
		);
	}


	/**
	 * Formatea una fecha para mostrar en la tabla
	 */
	function formatDate( dateString: string | null ): string {
		if ( !dateString ) return '-';
		return new Date( dateString ).toLocaleDateString( 'es-ES' );
	}


	return (
		<PageLayout 
			title="Gestión de Períodos"
			actions={
				<Button onClick={ openNewPeriodForm }>
					<Plus className="mr-2 h-4 w-4" />
					Crear Período
				</Button>
			}
		>

			<div className="flex flex-col h-full space-y-6 overflow-hidden">
				{/* Filtros */}
				<div className="flex-shrink-0">
					<Card>
						<CardContent className="space-y-4 mt-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="search">Buscar</Label>

									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />

										<Input
											id          = "search"
											placeholder = "Buscar por ID, nombre o fecha de inicio..."
											value       = { searchQuery }
											onChange    = { (e) => handleFilterChange( 'search', e.target.value ) }
											className   = "pl-10"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="status-filter">Estado</Label>

									<Select value={ statusFilter } onValueChange={ (value) => handleFilterChange( 'status', value ) }>
										<SelectTrigger id="status-filter">
											<SelectValue placeholder="Seleccionar estado" />
										</SelectTrigger>

										<SelectContent>
											<SelectItem value="all">Todos</SelectItem>
											<SelectItem value={ PeriodStatus.Opened }>Abierto</SelectItem>
											<SelectItem value={ PeriodStatus.InProgress }>En Progreso</SelectItem>
											<SelectItem value={ PeriodStatus.Completed }>Completado</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Tabla de períodos */}
				<div className="flex-1 flex flex-col space-y-4 overflow-hidden">
					<Card className="flex-1 overflow-hidden">
						<CardContent className="mt-5 h-full flex flex-col">
							{ periodList?.length === 0 && !isLoading && !isError ? (
								<div className="text-center p-8 text-muted-foreground">
									No se han agregado períodos.
								</div>
							) : (
								<div className="flex-1 overflow-hidden">
									<Table>
										<TableHeader className="sticky top-0 z-10 bg-background">
											<TableRow>
												<TableHead className="bg-background w-[100px]">ID</TableHead>
												<TableHead className="bg-background w-[200px]">Nombre</TableHead>
												<TableHead className="bg-background w-[150px]">Fecha Inicio</TableHead>
												<TableHead className="bg-background w-[150px]">Fecha Fin</TableHead>
												<TableHead className="bg-background w-[150px]">Fecha Apertura</TableHead>
												<TableHead className="bg-background w-[150px]">Fecha Cierre</TableHead>
												<TableHead className="bg-background w-[100px]">Estado</TableHead>
												<TableHead className="bg-background w-[120px] text-end">Acciones</TableHead>
											</TableRow>
										</TableHeader>
									</Table>

									{ isError ? (
										<PeriodErrorMessage />
									) : (
										<ScrollArea className="h-[calc(100vh-400px)]">
											<Table>
												<TableBody>
													{isLoading
													? (
														<PeriodTableSkeleton rows={10} />
													)
													: (
														paginatedPeriods.map( period => (
															<TableRow key={ period.id }>
																<TableCell className="font-medium w-[100px]">{ period.id }</TableCell>
																<TableCell className="w-[200px]">{ period.name }</TableCell>
																<TableCell className="w-[150px]">{ formatDate( period.startDate ) }</TableCell>
																<TableCell className="w-[150px]">{ formatDate( period.endDate ) }</TableCell>
																<TableCell className="w-[150px]">{ formatDate( period.openingDate ) }</TableCell>
																<TableCell className="w-[150px]">{ formatDate( period.closingDate ) }</TableCell>
																<TableCell className="w-[100px]">
																	{ renderStatusBadge( period.status ) }
																</TableCell>
																<TableCell className="w-[120px]">
																	<ActionButton
																		editItem={ openEditPeriodForm }
																		deleteItem={ () => onOpenDeletePeriod(period) }
																		item={ period }
																	/>
																</TableCell>
															</TableRow>
														))
													)}

													{ filteredPeriods.length === 0 && searchQuery ? (
														<TableRow>
															<TableCell colSpan={ 8 } className="h-24 text-center">
																No se encontraron resultados para &quot;{ searchQuery }&quot;
															</TableCell>
														</TableRow>
													) : periodList?.length === 0 && !searchQuery ? (
														<TableRow>
															<TableCell colSpan={ 8 } className="h-24 text-center">
																No hay períodos registrados
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
					<div className="flex-shrink-0">
						<DataPagination
							currentPage             = { currentPage }
							totalPages              = { totalPages }
							totalItems              = { totalItems }
							itemsPerPage            = { itemsPerPage }
							onPageChange            = { setCurrentPage }
							onItemsPerPageChange    = { setItemsPerPage }
						/>
					</div>
				</div>
			</div>

			{/* Period Form Dialog */}
			<PeriodForm
				period  = { editingPeriod }
				onClose = { () => setIsFormOpen( false )}
				isOpen  = { isFormOpen }
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				isOpen      = { isDeleteDialogOpen }
				onClose     = { () => setIsDeleteDialogOpen( false )}
				onConfirm   = { () => deletePeriodMutation.mutate( deletingPeriodId! ) }
				name        = { deletingPeriodId! }
				type        = "el Período"
			/>
		</PageLayout>
	);
}