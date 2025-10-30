'use client'

import { JSX, useState, useMemo }   from "react";
import { useSearchParams }          from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { PageLayout }           from "@/components/layout/page-layout";
import { PlanningChangeFilter } from "@/components/planning-change/planning-change-filter";
import { PlanningChangeList }   from "@/components/planning-change/planning-change-list";
import { PlanningChangeTable }  from "@/components/planning-change/planning-change-table";

import { useViewMode }              from "@/hooks/use-view-mode";
import { fetchApi }                 from "@/services/fetch";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { type PlanningChangeAll }   from "@/types/planning-change.model";
import { type Status }              from "@/types/request";


export default function PlanningChangePage(): JSX.Element {
	const searchParams                  = useSearchParams();
	const { viewMode, onViewChange }    = useViewMode({ queryName: 'viewPlanningChange', defaultMode: 'cards' });

	// Estados de filtros
	const [title, setTitle]                 = useState<string>( "" );
	const [statusFilter, setStatusFilter]   = useState<Status[]>([]);
	const [sectionFilter, setSectionFilter] = useState<string[]>(() => {
		const sectionId = searchParams.get( 'sectionId' );

        return sectionId ? [sectionId] : [];
	});

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
		console.log( "Editar:", planningChange );
		// TODO: Implementar edición
	};

	const handleDelete = ( planningChange: PlanningChangeAll ): void => {
		console.log( "Eliminar:", planningChange );
		// TODO: Implementar eliminación
	};

	const handleNewPlanningChange = (): void => {
		console.log( "Crear nuevo planning change" );
		// TODO: Implementar creación
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
			</div>
		</PageLayout>
	);
}
