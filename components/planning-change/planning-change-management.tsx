"use client"

import { useState, useMemo, useEffect, JSX }	from "react";

import {
	useMutation,
	useQuery,
	useQueryClient
}					from "@tanstack/react-query";
import { toast }	from "sonner";

import { DeleteConfirmDialog }	from "@/components/dialog/DeleteConfirmDialog";
import { PlanningChangeFilter }	from "@/components/planning-change/planning-change-filter";
import { PlanningChangeTable }	from "@/components/planning-change/planning-change-table";
import { PlanningChangeForm }	from "@/components/planning-change/planning-change-form";
import { DataPagination }		from "@/components/ui/data-pagination";

import { type PlanningChange }		from "@/types/planning-change.model";
import { type Status }				from "@/types/request";
import { type Session }				from "@/types/section.model";
import { Method, fetchApi }			from "@/services/fetch";
import { errorToast, successToast }	from "@/config/toast/toast.config";
import { KEY_QUERYS }				from "@/consts/key-queries";
import { updateFacultyTotal }		from "@/app/faculties/page";


interface Props {
	facultyId	: string;
	enabled		: boolean;
}


export function PlanningChangeManagement({
    facultyId,
    enabled
}: Props ): JSX.Element {
	const queryClient											= useQueryClient();
	const [isFormOpen, setIsFormOpen]						= useState( false );
	const [editingPlanningChange, setEditingPlanningChange]	= useState<PlanningChange | null>( null );
	const [title, setTitle]									= useState( "" );
	const [statusFilter, setStatusFilter]					= useState<Status[]>( [] );
	const [sessionFilter, setSessionFilter]					= useState<Session[]>( [] );
	const [isDeleteDialogOpen, setIsDeleteDialogOpen]		= useState( false );
	const [deletingPlanningChange, setDeletingPlanningChange]	= useState<PlanningChange | null>( null );
	const [currentPage, setCurrentPage]						= useState( 1 );
	const [itemsPerPage, setItemsPerPage]					= useState( 15 );


	const { data, isLoading, isError } = useQuery({
		queryKey	: [ KEY_QUERYS.PLANNING_CHANGE, facultyId ],
		queryFn		: () => fetchApi<PlanningChange[]>({ url: `planning-change/faculty/${facultyId}` }),
		enabled,
	});


	const deletePlanningChangeApi = async ( planningChangeId: string ): Promise<PlanningChange> =>
		fetchApi<PlanningChange>({ url: `planning-change/${planningChangeId}`, method: Method.DELETE });


	const deletePlanningChangeMutation = useMutation<PlanningChange, Error, string>({
		mutationFn	: deletePlanningChangeApi,
		onSuccess	: () => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.PLANNING_CHANGE, facultyId ] });
			updateFacultyTotal( queryClient, facultyId, false, 'totalPlanningChange' );
			setIsDeleteDialogOpen( false );
			setDeletingPlanningChange( null );
			toast( 'Cambio de planificación eliminado exitosamente', successToast );
		},
		onError		: ( mutationError ) => toast( `Error al eliminar cambio de planificación: ${mutationError.message}`, errorToast )
	});


	const filteredPlanningChanges = useMemo(() => {
		const planningChanges = data || [];

		return planningChanges.filter( planningChange => {
			const matchesTitle = title === "" || planningChange.title.toLowerCase().includes( title.toLowerCase() );
			const matchesStatus = statusFilter.length === 0 || statusFilter.includes( planningChange.status );
			const matchesSession = sessionFilter.length === 0 || ( planningChange.sessionName && sessionFilter.includes( planningChange.sessionName ));

			return matchesTitle && matchesStatus && matchesSession;
		});
	}, [ data, title, statusFilter, sessionFilter ]);


	const paginatedPlanningChanges = useMemo(() => {
		const startIndex = ( currentPage - 1 ) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredPlanningChanges.slice( startIndex, endIndex );
	}, [ filteredPlanningChanges, currentPage, itemsPerPage ]);


	const totalPages = Math.ceil( filteredPlanningChanges.length / itemsPerPage );


	function handleEdit( planningChange: PlanningChange ): void {
		setEditingPlanningChange( planningChange );
		setIsFormOpen( true );
	}


	function handleNewPlanningChange(): void {
		setEditingPlanningChange( null );
		setIsFormOpen( true );
	}


	function handleFormSuccess(): void {
		setIsFormOpen( false );
		setEditingPlanningChange( null );
	}


	function handleDelete( planningChange: PlanningChange ): void {
		setDeletingPlanningChange( planningChange );
		setIsDeleteDialogOpen( true );
	}


	function handleConfirmDelete(): void {
		if ( deletingPlanningChange ) {
			deletePlanningChangeMutation.mutate( deletingPlanningChange.id );
		}
	}


	function handlePageChange( page: number ): void {
		setCurrentPage( page );
	}


	function handleItemsPerPageChange( newItemsPerPage: number ): void {
		setItemsPerPage( newItemsPerPage );
		setCurrentPage( 1 );
	}


	useEffect(() => {
		setCurrentPage( 1 );
	}, [ title, statusFilter, sessionFilter ]);


	return (
		<div className="space-y-4">
			{/* Filters */}
			<PlanningChangeFilter
				title				= { title }
				setTitle			= { setTitle }
				statusFilter		= { statusFilter }
				setStatusFilter		= { setStatusFilter }
				sessionFilter		= { sessionFilter }
				setSessionFilter	= { setSessionFilter }
				onNewPlanningChange	= { handleNewPlanningChange }
			/>

			{/* Table */}
			<PlanningChangeTable
				planningChanges	= { paginatedPlanningChanges }
				onEdit			= { handleEdit }
				onDelete		= { handleDelete }
				isLoading		= { isLoading }
				isError			= { isError }
			/>

			{/* Pagination */}
			{ !isLoading && !isError && filteredPlanningChanges.length > 0 && (
				<DataPagination
					currentPage				= { currentPage }
					totalPages				= { totalPages }
					totalItems				= { filteredPlanningChanges.length }
					itemsPerPage			= { itemsPerPage }
					onPageChange			= { handlePageChange }
					onItemsPerPageChange	= { handleItemsPerPageChange }
				/>
			)}

			{/* Planning Change Form */}
			<PlanningChangeForm
				isOpen			= { isFormOpen }
				onClose			= { () => setIsFormOpen( false )}
				onCancel		= { () => setIsFormOpen( false )}
				onSuccess		= { handleFormSuccess }
				planningChange	= { editingPlanningChange }
				section			= { null }
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				isOpen		= { isDeleteDialogOpen }
				onClose		= { () => setIsDeleteDialogOpen( false )}
				onConfirm	= { handleConfirmDelete }
				name		= { deletingPlanningChange?.title || '' }
				type		= "el Cambio de Planificación"
			/>
		</div>
	);
}
