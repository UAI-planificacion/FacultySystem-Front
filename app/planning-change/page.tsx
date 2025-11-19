'use client'

import { JSX, useMemo, useState }   from "react";
import { useSearchParams }          from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast }                                      from "sonner";

import { PageLayout }               from "@/components/layout/page-layout";
import { DeleteConfirmDialog }      from "@/components/dialog/DeleteConfirmDialog";
import { PlanningChangeFilter }     from "@/components/planning-change/planning-change-filter";
import { PlanningChangeForm }       from "@/components/planning-change/planning-change-form";
import { PlanningChangeList }       from "@/components/planning-change/planning-change-list";
import { PlanningChangeTable }      from "@/components/planning-change/planning-change-table";

import { useViewMode }              from "@/hooks/use-view-mode";
import { Method, fetchApi }         from "@/services/fetch";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { errorToast, successToast } from "@/config/toast/toast.config";
import {
	type PlanningChange,
	type PlanningChangeAll
}                                      from "@/types/planning-change.model";
import { type Status }              from "@/types/request";


export default function PlanningChangePage(): JSX.Element {
    const searchParams                  = useSearchParams();
	const { viewMode, onViewChange }    = useViewMode({ queryName: 'viewPlanningChange', defaultMode: 'cards' });
    const sectionId                     = searchParams.get( 'sectionId' );

	// Estados de filtros
	const [title, setTitle]                                     = useState<string>( "" );
	const [statusFilter, setStatusFilter]                       = useState<Status[]>([]);
	const [sectionFilter, setSectionFilter]                     = useState<string[]>( sectionId ? [sectionId] : [] );
    const [isFormOpen, setIsFormOpen]                           = useState<boolean>( false );
	const [editingPlanningChange, setEditingPlanningChange]     = useState<PlanningChange | null>( null );
	const [isDeleteDialogOpen, setIsDeleteDialogOpen]           = useState<boolean>( false );
	const [deletingPlanningChange, setDeletingPlanningChange]   = useState<PlanningChangeAll | null>( null );

	// Query para obtener todos los planning changes
	const {
		data		: planningChanges = [],
		isLoading,
		isError
	} = useQuery<PlanningChangeAll[]>({
		queryKey	: [KEY_QUERYS.PLANNING_CHANGE],
		queryFn		: () => fetchApi<PlanningChangeAll[]>({ url: KEY_QUERYS.PLANNING_CHANGE }),
		staleTime	: 5 * 60 * 1000,
	});

	const queryClient = useQueryClient();

	/**
	 * Maps PlanningChangeAll into PlanningChange for the form component.
	 */
	const mapPlanningChangeAllToPlanningChange = ( planningChange: PlanningChangeAll ): PlanningChange => ({
		id              : planningChange.id,
		title           : planningChange.title,
		status          : planningChange.status,
		sessionName     : planningChange.sessionName,
		building        : planningChange.building,
		spaceId         : planningChange.spaceId,
		isEnglish       : planningChange.isEnglish,
		isConsecutive   : planningChange.isConsecutive,
		description     : planningChange.description,
		spaceType       : planningChange.spaceType,
		inAfternoon     : planningChange.inAfternoon,
		professor       : planningChange.professor,
		spaceSize       : planningChange.spaceSize,
		sessionId       : planningChange.session?.id || null,
		sectionId       : planningChange.section?.id || null,
		createdAt       : planningChange.createdAt,
		updatedAt       : planningChange.updatedAt,
		staffCreate     : planningChange.staffCreate,
		staffUpdate     : planningChange.staffUpdate,
		dayModulesId    : planningChange.dayModulesId,
	});

	const deletePlanningChangeMutation = useMutation<void, Error, string>({
		mutationFn	: async ( planningChangeId ) => {
			await fetchApi({
				url		: `planning-change/${planningChangeId}`,
				method	: Method.DELETE,
			});
		},
		onSuccess	: () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.PLANNING_CHANGE] });
			setIsDeleteDialogOpen( false );
			setDeletingPlanningChange( null );
			toast( 'Cambio de planificación eliminado exitosamente', successToast );
		},
		onError		: ( mutationError ) => {
			toast( `Error al eliminar cambio de planificación: ${mutationError.message}`, errorToast );
		}
	});

	// Filtrar planning changes
	const filteredPlanningChanges = useMemo(() => {
		return planningChanges.filter( pc => {
			// Filtro por título
			const matchesTitle = title === "" || 
				pc.title.toLowerCase().includes( title.toLowerCase() ) ||
				pc.id.toLowerCase().includes( title.toLowerCase() );

			// Filtro por estado
			const matchesStatus = statusFilter.length === 0 || 
				statusFilter.includes( pc.status );

			// Filtro por sección
			const matchesSection = sectionFilter.length === 0 || 
				( pc.section?.id && sectionFilter.includes( pc.section.id )) ||
				( pc.session?.section?.id && sectionFilter.includes( pc.session.section.id ));

			return matchesTitle && matchesStatus && matchesSection;
		});
	}, [planningChanges, title, statusFilter, sectionFilter]);

	// Handlers
	const handleEdit = ( planningChange: PlanningChangeAll ): void => {
		setEditingPlanningChange( mapPlanningChangeAllToPlanningChange( planningChange ));
		setIsFormOpen( true );
	};

	const handleDelete = ( planningChange: PlanningChangeAll ): void => {
		setDeletingPlanningChange( planningChange );
		setIsDeleteDialogOpen( true );
	};

	const handleNewPlanningChange = (): void => {
		setEditingPlanningChange( null );
		setIsFormOpen( true );
	};

	const handleFormSuccess = (): void => {
		setIsFormOpen( false );
		setEditingPlanningChange( null );
	};

	const handleCloseForm = (): void => {
		setIsFormOpen( false );
		setEditingPlanningChange( null );
	};

	const handleCloseDeleteDialog = (): void => {
		setIsDeleteDialogOpen( false );
		setDeletingPlanningChange( null );
	};

	const handleConfirmDelete = (): void => {
		if ( deletingPlanningChange ) {
			deletePlanningChangeMutation.mutate( deletingPlanningChange.id );
		}
	};

	return (
		<PageLayout title="Cambios de Planificaciones">
			<div className="space-y-4">
				{/* Filtros */}
				<PlanningChangeFilter
					title				= { title }
					setTitle			= { setTitle }
					statusFilter		= { statusFilter }
					setStatusFilter		= { setStatusFilter }
					sectionFilter		= { sectionFilter }
					setSectionFilter	= { setSectionFilter }
					viewMode			= { viewMode }
					onViewChange		= { onViewChange }
					onNewPlanningChange	= { handleNewPlanningChange }
				/>

				{/* Vista de Cards o Tabla */}
				{ viewMode === 'cards' ? (
					<PlanningChangeList
						planningChanges	= { filteredPlanningChanges }
						onEdit			= { handleEdit }
						onDelete		= { handleDelete }
						isLoading		= { isLoading }
						isError			= { isError }
					/>
				) : (
					<PlanningChangeTable
						planningChanges	= { filteredPlanningChanges }
						onEdit			= { ( planningChange ) => handleEdit( planningChange as PlanningChangeAll ) }
						onDelete		= { ( planningChange ) => handleDelete( planningChange as PlanningChangeAll ) }
						isLoading		= { isLoading }
						isError			= { isError }
					/>
				)}

				<PlanningChangeForm
					isOpen			= { isFormOpen }
					onClose			= { handleCloseForm }
					onCancel		= { handleCloseForm }
					onSuccess       = { handleFormSuccess }
					planningChange	= { editingPlanningChange }
					section	        = { null }
				/>

				<DeleteConfirmDialog
					isOpen		= { isDeleteDialogOpen }
					onClose     = { handleCloseDeleteDialog }
					onConfirm	= { handleConfirmDelete }
					name		= { deletingPlanningChange?.title || '' }
					type		= "el Cambio de Planificación"
				/>
			</div>
		</PageLayout>
	);
}
