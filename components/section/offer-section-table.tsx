'use client'

import React, { useState } from "react"

import { Album, ChevronDown, ChevronRight, Plus }  from "lucide-react"
import { useMutation, useQueryClient }      from "@tanstack/react-query"
import { toast }                            from "sonner"

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}                                   from "@/components/ui/table"
import { Button }                   from "@/components/ui/button"
import { Checkbox }                 from "@/components/ui/checkbox"
import { ActiveBadge }              from "@/components/shared/active"
import { ActionButton }             from "@/components/shared/action"
import { ChangeStatusSection }      from "@/components/section/change-status"
import { DeleteConfirmDialog }      from "@/components/dialog/DeleteConfirmDialog"
import { SectionForm }              from "@/components/section/section-form"
import { CreateSessionForm }        from "@/components/section/create-session-form"
import { SessionShort }             from "@/components/section/session-short"
import { SessionName }              from "@/components/section/session-name"

import { OfferSection, OfferSession }             from "@/types/offer-section.model"
import { fetchApi, Method }         from "@/services/fetch"
import { KEY_QUERYS }               from "@/consts/key-queries"
import { errorToast, successToast } from "@/config/toast/toast.config"
import { tempoFormat } from "@/lib/utils"


interface Props {
	sections                    : OfferSection[];
	isLoading                   : boolean;
	isError                     : boolean;
	selectedSessions            : Set<string>;
	onSelectedSessionsChange    : ( selectedSessions: Set<string> ) => void;
}


export function OfferSectionTable({
	sections,
	isLoading,
	isError,
	selectedSessions,
	onSelectedSessionsChange
}: Props ) {
	const queryClient                                       = useQueryClient();
	const [ expandedSections, setExpandedSections ]         = useState<Set<string>>( new Set() );
	const [ selectedSections, setSelectedSections ]         = useState<Set<string>>( new Set() );
	const [ isEditSection, setIsEditSection ]               = useState<boolean>( false );
	const [ createSessionSection, setCreateSessionSection ] = useState<OfferSection | null>( null );
	const [ isCreateSessionOpen, setIsCreateSessionOpen ]   = useState<boolean>( false );
	const [ selectedSectionEdit, setSelectedSectionEdit ]   = useState<OfferSection | null>( null );
	const [ selectedSessionEdit, setSelectedSesionEdit ]   = useState<OfferSession | null>( null );

	const [ isOpenDelete, setIsOpenDelete ]                 = useState( false );
	const [ selectedSection, setSelectedSection ]           = useState<OfferSection | undefined>( undefined );


	/**
	 * Toggle section expansion
	 */
	function toggleSectionExpansion( sectionId: string ): void {
		setExpandedSections(( prev ) => {
			const newSet = new Set( prev );

			if ( newSet.has( sectionId ) ) {
				newSet.delete( sectionId );
			} else {
				newSet.add( sectionId );
			}

			return newSet;
		});
	}


	/**
	 * Check if section is fully selected
	 */
	const isSectionFullySelected = ( section: OfferSection ): boolean =>
		selectedSections.has( section.id );


	/**
	 * Handle section selection (parent)
	 */
	function handleSectionSelection( sectionId: string, checked: boolean ): void {
		setSelectedSections( ( prev ) => {
			const newSet = new Set( prev );

			if ( checked ) {
				newSet.add( sectionId );
			} else {
				newSet.delete( sectionId );
			}

			return newSet;
		});

		// Auto-select/deselect all sessions in the section
		const section = sections.find( s => s.id === sectionId );

		if ( !section ) return;

		const newSelectedSessions = new Set( selectedSessions );

		section.sessions.forEach( ( session ) => {
			if ( checked ) {
				newSelectedSessions.add( session.id );
			} else {
				newSelectedSessions.delete( session.id );
			}
		} );

		onSelectedSessionsChange( newSelectedSessions );
	}


	/**
	 * Check if section is partially selected
	 */
	function isSectionPartiallySelected( section: OfferSection ): boolean {
		const sessionIds            = section.sessions.map( s => s.id );
		const selectedSessionIds    = sessionIds.filter( id => selectedSessions.has( id ));

		return selectedSessionIds.length > 0 && selectedSessionIds.length < sessionIds.length;
	}


	/**
	 * Handle session selection (child)
	 */
	function handleSessionSelection( sessionId: string, sectionId: string ): void {
		const isCurrentlySelected   = selectedSessions.has( sessionId );
		const checked               = !isCurrentlySelected;
		const newSelectedSessions   = new Set( selectedSessions );

		if ( checked ) {
			newSelectedSessions.add( sessionId );
		} else {
			newSelectedSessions.delete( sessionId );
		}

		onSelectedSessionsChange( newSelectedSessions );

		// Check if we need to update section selection
		const section = sections.find( s => s.id === sectionId );

		if ( !section ) return;

		const sessionIds            = section.sessions.map( s => s.id );
		const selectedSessionIds    = sessionIds.filter( id => 
			checked
				? ( newSelectedSessions.has( id ) )
				: ( newSelectedSessions.has( id ) )
		);

		setSelectedSections( ( prev ) => {
			const newSet = new Set( prev );

			if ( selectedSessionIds.length === sessionIds.length ) {
				newSet.add( sectionId );
			} else {
				newSet.delete( sectionId );
			}

			return newSet;
		});
	}


	/**
	 * Handle edit section
	 */
	function handleEditSection( section: OfferSection ): void {
		setSelectedSectionEdit( section );
		setIsEditSection( true );
	}


	/**
	 * Handle delete section
	 */
	function handleDeleteSection( section: OfferSection ): void {
		setSelectedSection( section );
		setIsOpenDelete( true );
	}


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
	function handleConfirmDeleteSection(): void {
		if ( selectedSection ) {
			deleteSectionMutation.mutate( selectedSection.id );
		}
	}


	/**
	 * Get session counts for SessionShort component
	 */
	function getSessionCounts( section: OfferSection ) {
		return {
			C: section.lecture,
			A: section.tutoringSession,
			T: section.workshop,
			L: section.laboratory,
		};
	}


	/**
	 * Format date
	 */
	function formatDate( date: Date | null ): string {
		if ( !date ) return '-';

		return new Date( date ).toLocaleDateString( 'es-CL', {
			day     : '2-digit',
			month   : '2-digit',
			year    : 'numeric'
		});
	}


	return (
		<>
			<Table className="min-w-full">
				<TableHeader>
					<TableRow>
						<TableHead className="w-8"></TableHead>
						<TableHead className="w-14"></TableHead>
						<TableHead>SSEC</TableHead>
						{/* <TableHead>Asignatura</TableHead> */}
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
										>
											{expandedSections.has( section.id )
												? <ChevronDown className="h-4 w-4" />
												: <ChevronRight className="h-4 w-4" />
											}
										</Button>
									</TableCell>

									<TableCell>
										<Checkbox
											checked         = { isSectionFullySelected( section ) }
											onCheckedChange = {( checked ) => handleSectionSelection( section.id, checked as boolean )}
											className       = { isSectionPartiallySelected( section ) ? "data-[state=unchecked]:bg-blue-100 w-5 h-5" : " w-5 h-5" }
											aria-label      = "Seleccionar sección"
											disabled        = { section.isClosed }
										/>
									</TableCell>

									<TableCell className="font-medium" title={ `${section.subject.id}-${section.subject.name}` }>
                                        { section.subject.id }-{ section.code }
                                    </TableCell>

									<TableCell title={ `${section.period.id}-${section.period.name}` }>
                                        { section.period.id }
                                    </TableCell>

									{/* <TableCell className="font-medium" title={ section.subject.name }>
										{ section.subject.id }
									</TableCell> */}

									<TableCell>
										<SessionShort sessionCounts={ getSessionCounts( section ) } />
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
											{ section.sessions.length === 0
												? <Button
													title       = "Asignar Sesiones"
													size        = "icon"
													variant     = "outline"
													disabled    = { section.isClosed }
													onClick     = { () => {
														setCreateSessionSection( section );
                                                        setSelectedSectionEdit( section );
														setIsCreateSessionOpen( true );
													}}
												>
													<Album className="w-4 h-4" />
												</Button>

                                                : <Button
													title       = "Agregar Sesión"
													size        = "icon"
													variant     = "outline"
													disabled    = { section.isClosed }
													onClick     = { () => {
														setCreateSessionSection( section );
														setIsCreateSessionOpen( true );
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

											<ChangeStatusSection group={{
                                                groupId: section.groupId,
                                                isOpen: !section.isClosed } as any}
                                            />
										</div>
									</TableCell>
								</TableRow>

								{/* Expanded Sessions (Children) */}
								{expandedSections.has( section.id ) && (
									<TableRow>
										<TableCell colSpan={10} className="p-0">
											<div className="border-l-4 ml-16">
												<Table>
													<TableHeader>
														<TableRow className="">
															<TableHead className="w-10">Seleccionar</TableHead>
															<TableHead className="pl-12">Sesión</TableHead>
															<TableHead>Sala</TableHead>
															<TableHead>Profesor</TableHead>
															{/* <TableHead>Día</TableHead> */}
															<TableHead>Módulo</TableHead>
															<TableHead>Fecha</TableHead>
															<TableHead className="text-right">Acciones</TableHead>
														</TableRow>
													</TableHeader>

													<TableBody>
														{section.sessions.map(( session ) => (
															<TableRow key={session.id} className="border-l-4 border-transparent">
																<TableCell className="w-10">
																	<Checkbox
																		checked         = { selectedSessions.has( session.id ) }
																		onCheckedChange = {() => handleSessionSelection( session.id, section.id )}
																		aria-label      = "Seleccionar sesión"
																		className       = "w-5 h-5"
																		disabled        = { section.isClosed }
																	/>
																</TableCell>

																<TableCell className="pl-12">
																	<SessionName session={ session.name } />
																</TableCell>

																<TableCell>{ session.spaceId ?? '-' }</TableCell>

																<TableCell title={ `${session.professor?.id} - ${session.professor?.name}` }>
                                                                    { session.professor?.name ?? '-' }
                                                                </TableCell>

																{/* <TableCell>{ dayName[session.dayId - 1] ?? '-' }</TableCell> */}

																<TableCell 
                                                                // title={ session.module.name }
                                                                >
                                                                    { session.module.name }
																	{/* { `M${ session.module.code } ${ session.module.diference ? `-${session.module.diference}` : '' }` } */}
																</TableCell>

																<TableCell>{ session.date ? tempoFormat( session.date ) : '-' }</TableCell>

																<TableCell className="text-right">
																	<ActionButton
																		editItem            = {() => {
                                                                            setSelectedSesionEdit( session )
                                                                            console.log('🚀 ~ file: offer-section-table.tsx:457 ~ session:', session)
                                                                            setIsEditSection( true )
                                                                        }}
																		deleteItem          = {() => {}}
																		item                = { session }
																		isDisabledEdit      = { section.isClosed }
																		isDisabledDelete    = { section.isClosed }
																	/>
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										</TableCell>
									</TableRow>
								)}
							</React.Fragment>
						))
					)}
				</TableBody>
			</Table>

			{/* Edit Section Dialog */}
			<SectionForm
				isOpen  = { isEditSection }
				onClose = { () => setIsEditSection( false )}
				section = { null }
				onSave  = { () => setIsEditSection( false )}
			/>

			<CreateSessionForm
				section = { createSessionSection }
				isOpen  = { isCreateSessionOpen }
				onClose = { () => setIsCreateSessionOpen( false )}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				isOpen      = { isOpenDelete }
				onClose     = { () => setIsOpenDelete( false )}
				onConfirm   = { handleConfirmDeleteSection }
				name        = { `${selectedSection?.code} - ${selectedSection?.subject.name}` }
				type        = { "la Sección" }
			/>
		</>
	);
}
