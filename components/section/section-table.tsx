'use client'

import React, { useState, useCallback } from "react"
import { useRouter } from 'next/navigation';


import {
    Album,
    CalendarClock,
    ChevronDown,
    ChevronRight,
    Plus
}                   from "lucide-react"
import {
    useMutation,
    useQueryClient
}                   from "@tanstack/react-query"
import { toast }    from "sonner"

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}                               from "@/components/ui/table"
import { Button }               from "@/components/ui/button"
import { Checkbox }             from "@/components/ui/checkbox"
import { ActiveBadge }          from "@/components/shared/active"
import { ActionButton }         from "@/components/shared/action"
import { ChangeStatusSection }  from "@/components/section/change-status"
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog"
import { CreateSessionForm }    from "@/components/section/create-session-form"
import { SessionShort }         from "@/components/session/session-short"
import { SessionForm }          from "@/components/session/session-form"
import { SessionTable }         from "@/components/session/session-table"
import { SectionForm }          from "@/components/section/section-form"
import { PlanningChangeForm }   from "@/components/planning-change/planning-change-form"

import { OfferSection }             from "@/types/offer-section.model"
import { fetchApi, Method }         from "@/services/fetch"
import { KEY_QUERYS }               from "@/consts/key-queries"
import { errorToast, successToast } from "@/config/toast/toast.config"
import { tempoFormat }              from "@/lib/utils"


interface Props {
	sections                    : OfferSection[];
	isLoading                   : boolean;
	isError                     : boolean;
	selectedSessions            : Set<string>;
	onSelectedSessionsChange    : ( selectedSessions: Set<string> ) => void;
}


export function SectionTable({
	sections,
	isLoading,
	isError,
	selectedSessions,
	onSelectedSessionsChange
}: Props ) {
	const queryClient   = useQueryClient();
    const router        = useRouter();

	const [ expandedSections, setExpandedSections ]         = useState<Set<string>>( new Set() );
	const [ isCreateSessionOpen, setIsCreateSessionOpen ]   = useState<boolean>( false );
	const [ selectedSectionEdit, setSelectedSectionEdit ]   = useState<OfferSection | null>( null );
	const [ isOpenDelete, setIsOpenDelete ]                 = useState( false );
	const [ isOpenSessionForm, setIsOpenSessionForm ]       = useState<boolean>( false );
	const [ isOpenSectionForm, setIsOpenSectionForm ]       = useState<boolean>( false );
	const [ selectedSection, setSelectedSection ]           = useState<OfferSection | undefined>( undefined );
	const [ isOpenPlanningChange, setIsOpenPlanningChange ] = useState<boolean>( false );

	/**
	 * Toggle section expansion
	 */
	const toggleSectionExpansion = useCallback(( sectionId: string ): void => {
		setExpandedSections(( prev ) => {
			const newSet = new Set( prev );

			if ( newSet.has( sectionId ) ) {
				newSet.delete( sectionId );
			} else {
				newSet.add( sectionId );
			}

			return newSet;
		});
	}, []);

	/**
	 * Check if section is fully selected
	 */
	const isSectionFullySelected = useCallback(( section: OfferSection ): boolean => {
		const sessionIds = section.sessions.ids || [];
		
		if ( sessionIds.length === 0 ) return false;
		
		return sessionIds.every( id => selectedSessions.has( id ));
	}, [ selectedSessions ]);

	/**
	 * Handle section selection (parent)
	 */
	const handleSectionSelection = useCallback(( sectionId: string, checked: boolean | 'indeterminate' ): void => {
		const section = sections.find( s => s.id === sectionId );

		if ( !section ) {
			return;
		}

		const sessionIds = section.sessions?.ids || [];
		const newSelectedSessions = new Set( selectedSessions );

		const shouldSelect = checked === true || checked === 'indeterminate';

		sessionIds.forEach( ( sessionId ) => {
			if ( shouldSelect ) {
				newSelectedSessions.add( sessionId );
			} else {
				newSelectedSessions.delete( sessionId );
			}
		});

		onSelectedSessionsChange( newSelectedSessions );
	}, [ sections, selectedSessions, onSelectedSessionsChange ]);


	/**
	 * Check if section is partially selected
	 */
	const isSectionPartiallySelected = useCallback(( section: OfferSection ): boolean => {
		const sessionIds = section.sessions.ids || [];
		
		if ( sessionIds.length === 0 ) return false;
		
		const selectedSessionIds = sessionIds.filter( id => selectedSessions.has( id ));
		
		return selectedSessionIds.length > 0 && selectedSessionIds.length < sessionIds.length;
	}, [ selectedSessions ]);


	/**
	 * Handle session selection (child)
	 */
	const handleSessionSelection = useCallback(( sessionId: string, sectionId: string ): void => {
		const isCurrentlySelected   = selectedSessions.has( sessionId );
		const newSelectedSessions   = new Set( selectedSessions );

		if ( isCurrentlySelected ) {
			newSelectedSessions.delete( sessionId );
		} else {
			newSelectedSessions.add( sessionId );
		}

		onSelectedSessionsChange( newSelectedSessions );
	}, [ selectedSessions, onSelectedSessionsChange ]);

	/**
	 * Handle edit section
	 */
	const handleEditSection = useCallback(( section: OfferSection ): void => {
		setSelectedSection( section );
		setIsOpenSectionForm( true );
	}, []);

	/**
	 * Handle delete section
	 */
	const handleDeleteSection = useCallback(( section: OfferSection ): void => {
		setSelectedSection( section );
		setIsOpenDelete( true );
	}, []);

	/**
	 * API call to delete section
	 */
	const deleteSectionApi = async ( sectionId: string ): Promise<void> =>
		fetchApi<void>({
			url     : `Sections/${sectionId}`,
			method  : Method.DELETE
		});

	/**
	 * Mutation to delete section
	 */
	const deleteSectionMutation = useMutation<void, Error, string>({
		mutationFn: deleteSectionApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECCTIONS] });
			setIsOpenDelete( false );
			setSelectedSection( undefined );
			toast( 'Sección eliminada exitosamente', successToast );
		},
		onError: ( mutationError ) => toast( `Error al eliminar sección: ${mutationError.message}`, errorToast )
	});

	/**
	 * Confirm delete section
	 */
	const handleConfirmDeleteSection = useCallback((): void => {
		if ( selectedSection ) {
			deleteSectionMutation.mutate( selectedSection.id );
		}
	}, [ selectedSection, deleteSectionMutation ]);

	/**
	 * Get session counts for SessionShort component
	 */
	const getSessionCounts = useCallback(( section: OfferSection ) => {
		return {
			C: section.lecture,
			A: section.tutoringSession,
			T: section.workshop,
			L: section.laboratory,
		};
	}, []);


	return (
		<>
			<Table className="min-w-full">
				<TableHeader>
					<TableRow>
						<TableHead className="w-8"></TableHead>
						<TableHead className="w-14"></TableHead>
						<TableHead>SSEC</TableHead>
						<TableHead>Período</TableHead>
						<TableHead>Sesiones</TableHead>
						<TableHead>Fecha Inicio</TableHead>
						<TableHead>Fecha Fin</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead className="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={10} className="text-center py-8">
								Cargando secciones...
							</TableCell>
						</TableRow>
					) : isError ? (
						<TableRow>
							<TableCell colSpan={10} className="text-center py-8 text-red-500">
								Error al cargar las secciones
							</TableCell>
						</TableRow>
					) : sections.length === 0 ? (
						<TableRow>
							<TableCell colSpan={10} className="text-center py-8 text-gray-500">
								No hay secciones disponibles
							</TableCell>
						</TableRow>
					) : (
						sections.map(( section ) => (
							<React.Fragment key={section.id}>
								{/* Section Row (Parent) */}
								<TableRow className={ !section.isClosed ? "" : "bg-zinc-100 dark:bg-zinc-900" }>
									<TableCell>
										<Button
											variant     = "outline"
											size        = "sm"
											onClick     = {() => toggleSectionExpansion( section.id )}
											className   = "p-1 h-8 w-8"
                                            disabled    = { section.sessionsCount === 0 }
                                            // disabled = { section.sessions.length === 0 }
										>
											{ expandedSections.has( section.id )
												? <ChevronDown className="h-4 w-4" />
												: <ChevronRight className="h-4 w-4" />
											}
										</Button>
									</TableCell>

									<TableCell>
										<Checkbox
											checked         = { 
												isSectionFullySelected( section ) 
													? true 
													: isSectionPartiallySelected( section ) 
														? 'indeterminate' 
														: false 
											}
											onCheckedChange = {( checked ) => handleSectionSelection( section.id, checked )}
											aria-label      = "Seleccionar sección"
											disabled        = { section.isClosed || section.sessionsCount === 0 }
										/>
									</TableCell>

									<TableCell className="font-medium" title={ `${section.subject.id}-${section.subject.name}` }>
                                        { section.subject.id }-{ section.code }
                                    </TableCell>

									<TableCell title={ `${section.period.id}-${section.period.name}` }>
                                        { section.period.id }
                                    </TableCell>

									<TableCell>
										<SessionShort sessionCounts={ getSessionCounts( section )} />
									</TableCell>

									<TableCell>{ section.startDate ? tempoFormat( section.startDate ) : "-" }</TableCell>

									<TableCell>{ section.endDate ? tempoFormat( section.endDate ) : "-" }</TableCell>

									<TableCell>
										<ActiveBadge
											isActive        = { !section.isClosed }
											activeText      = "Abierto"
											inactiveText    = "Cerrado"
										/>
									</TableCell>

									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-1.5">
											{/* Botón para crear planning-change */}
											<Button
												title		= "Crear Cambio de Planificación"
												size		= "icon"
												variant		= "outline"
												disabled	= { section.isClosed || section.sessionsCount === 0 }
												className	= "bg-blue-500 hover:bg-blue-600 text-white"
												onClick		= { () => {
                                                    setIsOpenPlanningChange( true );
                                                    setSelectedSectionEdit( section );
                                                }}
											>
												<CalendarClock className="w-4 h-4" />
											</Button>

											{ section.sessionsCount === 0
												? <Button
													title       = "Asignar Sesiones"
													size        = "icon"
													variant     = "outline"
													disabled    = { section.isClosed }
                                                    className   = "bg-green-500 hover:bg-green-600"
													onClick     = { () => {
														// setCreateSessionSection( section );
                                                        // setSelectedSectionEdit( section );
														// setIsCreateSessionOpen( true );
                                                        router.push(`sections/${section.id}`)
													}}
												>
													<Album className="w-4 h-4" />
												</Button>

                                                // *Crear una nueva sesión
                                                : <Button
													title       = "Crear una Sesión"
													size        = "icon"
													variant     = "outline"
													disabled    = { section.isClosed }
													onClick     = { () => {
                                                        setIsOpenSessionForm( true );
                                                        setSelectedSectionEdit( section );
													}}
												>
													<Plus className="w-4 h-4" />
												</Button>
											}

											<ActionButton
												editItem        = {() => handleEditSection( section )}
												deleteItem      = {() => handleDeleteSection( section )}
												item            = { section }
												isDisabledEdit  = { section.isClosed }
											/>

											<ChangeStatusSection 
                                                section={ section }
                                            />
										</div>
									</TableCell>
								</TableRow>

								{/* Expanded Sessions (Children) */}
								{expandedSections.has( section.id ) && (
									<SessionTable
										section                 = { section }
										selectedSessions        = { selectedSessions }
										handleSessionSelection  = { handleSessionSelection }
										isOpen                  = { expandedSections.has( section.id ) }
									/>
								)}
							</React.Fragment>
						))
					)}
				</TableBody>
			</Table>

			{/* Edit Section Dialog */}
			<SectionForm
				isOpen  = { isOpenSectionForm }
				onClose = { () => setIsOpenSectionForm( false )}
				section = { null }
			/>

            <SessionForm
                isOpen  = { isOpenSessionForm }
                onClose = { () => setIsOpenSessionForm( false )}
                session = { null }
                section = { selectedSectionEdit }
                onSave  = { () => {} }
            />

			<CreateSessionForm
				section = { null }
				isOpen  = { isCreateSessionOpen }
				onClose = { () => setIsCreateSessionOpen( false )}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				isOpen      = { isOpenDelete }
				onClose     = { () => setIsOpenDelete( false )}
				onConfirm   = { handleConfirmDeleteSection }
				name        = { `SSEC ${selectedSection?.subject.id}-${selectedSection?.code}` }
				type        = { "la Sección" }
			/>

			{/* Planning Change Form */}
			<PlanningChangeForm
				planningChange	= { null }
                section         = { selectedSectionEdit }
				isOpen			= { isOpenPlanningChange }
				onClose			= { () => setIsOpenPlanningChange( false )}
				onSuccess		= { () => {
					setIsOpenPlanningChange( false );
					queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.PLANNING_CHANGE ] });
				}}
				onCancel		= { () => setIsOpenPlanningChange( false )}
			/>
		</>
	);
}
