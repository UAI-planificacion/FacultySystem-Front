'use client'

import { useState } from "react"

import { useMutation, useQueryClient }  from "@tanstack/react-query"
import { toast }                        from "sonner"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                               from "@/components/ui/table"
import { Checkbox }             from "@/components/ui/checkbox"
import { SessionName }          from "@/components/session/session-name"
import { ActionButton }         from "@/components/shared/action"
import { SessionForm }          from "@/components/session/session-form"
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog"

import { OfferSection, OfferSession }   from "@/types/offer-section.model"
import { tempoFormat }                  from "@/lib/utils"
import { fetchApi, Method }             from "@/services/fetch"
import { KEY_QUERYS }                   from "@/consts/key-queries"
import { errorToast, successToast }     from "@/config/toast/toast.config"


interface Props {
	section                 : OfferSection;
	selectedSessions        : Set<string>;
	handleSessionSelection  : ( sessionId: string, sectionId: string ) => void;
}


export function SessionTable({
	section,
	selectedSessions,
	handleSessionSelection
}: Props ) {
	const queryClient                                       = useQueryClient();
	const [ isEditSection, setIsEditSection ]               = useState<boolean>( false );
	const [ selectedSessionEdit, setSelectedSesionEdit ]    = useState<OfferSession | null>( null );
	const [ isOpenDelete, setIsOpenDelete ]                 = useState( false );
	const [ selectedSession, setSelectedSession ]           = useState<OfferSession | undefined>( undefined );


	/**
	 * API call to delete session
	 */
	const deleteSessionApi = async ( sessionId: string ): Promise<void> =>
		fetchApi<void>({
			url     : `Sessions/${sessionId}`,
			method  : Method.DELETE
		});


	/**
	 * Mutation to delete session
	 */
	const deleteSessionMutation = useMutation<void, Error, string>({
		mutationFn: deleteSessionApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECCTIONS] });
			setIsOpenDelete( false );
			setSelectedSession( undefined );
			toast( 'Sesión eliminada exitosamente', successToast );
		},
		onError: ( mutationError ) => toast( `Error al eliminar sesión: ${mutationError.message}`, errorToast )
	});


	/**
	 * Confirm delete session
	 */
	function handleConfirmDeleteSession(): void {
		if ( selectedSession ) {
			deleteSessionMutation.mutate( selectedSession.id );
		}
	}


	return (
		<>
			<TableRow>
				<TableCell colSpan={9} className="p-0">
					<div className="border-l-4 ml-16">
						<Table>
							<TableHeader>
								<TableRow className="">
									<TableHead className="w-10">Seleccionar</TableHead>

									<TableHead className="pl-12">Sesión</TableHead>

									<TableHead>Sala</TableHead>

									<TableHead>Profesor</TableHead>

									<TableHead>Módulo</TableHead>

									<TableHead>Fecha</TableHead>

                                    <TableHead>Idioma</TableHead>

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

										<TableCell>
											{ session.module.name }
										</TableCell>

										<TableCell>{ session.date ? tempoFormat( session.date ) : '-' }</TableCell>

										<TableCell>{ session.isEnglish ? 'Inglés' : 'Español' }</TableCell>

										<TableCell className="text-right">
											<ActionButton
												editItem            = {() => {
													setSelectedSesionEdit( session )
													setIsEditSection( true );
												}}
												deleteItem          = {() => {
													setSelectedSession( session );
													setIsOpenDelete( true );
												}}
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

			<SessionForm
				isOpen  = { isEditSection }
				onClose = { () => setIsEditSection( false )}
				session = { selectedSessionEdit }
				section = { section }
				onSave  = { () => setIsEditSection( false )}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				isOpen      = { isOpenDelete }
				onClose     = { () => setIsOpenDelete( false )}
				onConfirm   = { handleConfirmDeleteSession }
				name        = { `Día: ${ tempoFormat( selectedSession?.date )}` }
				type        = { "la Sesión" }
			/>
		</>
	);
}
