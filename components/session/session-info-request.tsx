'use client'

import { JSX, useMemo } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
}                           from '@/components/ui/accordion';
import { Card, CardContent }             from '@/components/ui/card';
import { Button }           from '@/components/ui/button';
import { Badge }            from '@/components/ui/badge';
import { ShowStatus }       from '@/components/shared/status';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	ExternalLinkIcon,
	User,
	Building2,
	Clock,
	GraduationCap,
	Languages,
	Sun,
	FileText,
	PlusIcon,
	Calendar
}                           from 'lucide-react';

import { OfferSection, RequestSession }   from '@/types/offer-section.model';
import { Session } from '@/types/section.model';
import { useQuery } from "@tanstack/react-query";
import { KEY_QUERYS } from "@/consts/key-queries";
import { fetchApi } from "@/services/fetch";
import { SessionDayModuleSelector } from './session-day-module-selector';


interface Props {
	section  : OfferSection;
	onViewRequest?  : ( requestId: string ) => void;
    enabled: boolean;
}


// Mapeo de nombres de sesiones en español
const SESSION_NAMES: Record<Session, string> = {
	[Session.C] : 'Cátedra',
	[Session.A] : 'Ayudantía',
	[Session.T] : 'Taller',
	[Session.L] : 'Laboratorio'
};


/**
 * Component to display request session information in an accordion format
 */
export function SessionInfoRequest({
	section,
	onViewRequest,
	enabled
}: Props ): JSX.Element {
	const {
		data        : request,
		isLoading,
		isError
	} = useQuery({
		queryKey    : [ KEY_QUERYS.REQUESTS, section.id ],
		queryFn     : () => fetchApi<RequestSession>({ url : `requests/section/${section.id}` }),
	});

    console.log('🚀 ~ file: session-info-request.tsx:63 ~ request:', request)

	// Preparar las sesiones seleccionadas para el selector de días/módulos
	const allSelectedSessions = useMemo(() => {
		if ( !request?.requestSessions ) return [];

		return request.requestSessions.flatMap( reqSession =>
			reqSession.sessionDayModules.map( sdm => ({
				session         : reqSession.session,
				dayModuleId     : parseInt( sdm.id ),
				dayId           : sdm.dayId,
				moduleId        : sdm.module.id
			}))
		);
	}, [ request ]);


	// Obtener las sesiones disponibles
	const availableSessions = useMemo(() => {
		if ( !request?.requestSessions ) return [];
		return request.requestSessions.map( rs => rs.session );
	}, [ request ]);

	if ( !request ) return (
		<Card>
			<CardContent className="mt-5 space-y-0">
				<Button
					onClick     = { () => onViewRequest?.( section.id ) }
					className   = "gap-2 w-full"
				>
					<PlusIcon className="h-4 w-4" />
					Crear Solicitud
				</Button>
			</CardContent>
		</Card>
	);

	return (
		<Card className="border-l-4 border-l-primary/50">
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="request-info" className="border-none">
					<AccordionTrigger className="px-6 py-4 hover:no-underline">
						<div className="flex items-center justify-between w-full pr-4">
							<div className="flex items-center gap-4 flex-1">
								<div className="flex flex-col items-start gap-2">
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold">
											Solicitud:
										</span>

										<span className="text-sm font-medium text-muted-foreground">
											{ request.title }
										</span>
									</div>

									<p className="text-xs text-muted-foreground">
										ID: { request.id }
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<ShowStatus status={ request.status } />

								{ onViewRequest && (
									<Button
										variant     = "outline"
										size        = "icon"
										title       = "Ver solicitud completa"
										onClick     = { ( e ) => {
											e.stopPropagation();
											onViewRequest( request.id );
										}}
										className   = "h-8 w-8"
									>
										<ExternalLinkIcon className="h-4 w-4" />
									</Button>
								)}
							</div>
						</div>
					</AccordionTrigger>

					<AccordionContent className="px-6 pb-4">
						<div className="space-y-6 pt-2">
							{/* Tabs por cada sesión */}
							{ request.requestSessions && request.requestSessions.length > 0 && (
								<Tabs defaultValue={ request.requestSessions[0].session } className="w-full">
									<TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${ request.requestSessions.length }, 1fr)` }}>
										{ request.requestSessions.map( reqSession => (
											<TabsTrigger key={ reqSession.id } value={ reqSession.session }>
												{ SESSION_NAMES[reqSession.session] } ({ reqSession.sessionDayModules.length })
											</TabsTrigger>
										))}
									</TabsList>

									{ request.requestSessions.map( reqSession => (
										<TabsContent key={ reqSession.id } value={ reqSession.session } className="space-y-4 mt-4">
											{/* Información específica de la sesión */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{/* Espacio ID */}
												<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
													<Building2 className="h-5 w-5 text-primary mt-0.5" />

													<div className="flex-1 space-y-1">
														<p className="text-xs font-medium text-muted-foreground">
															Espacio
														</p>

														<p className="text-sm font-semibold">
															{ reqSession.spaceId || (
																<span className="text-muted-foreground">
																	No especificado
																</span>
															)}
														</p>
													</div>
												</div>

												{/* Tamaño de espacio */}
												{ reqSession.spaceSize && (
													<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
														<Building2 className="h-5 w-5 text-primary mt-0.5" />

														<div className="flex-1 space-y-1">
															<p className="text-xs font-medium text-muted-foreground">
																Tamaño de Espacio
															</p>

															<p className="text-sm font-semibold">
																{ reqSession.spaceSize.detail }
															</p>
														</div>
													</div>
												)}
											</div>

											{/* Configuración de Sesión */}
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
													<Sun className="h-5 w-5 text-primary mt-0.5" />

													<div className="flex-1 space-y-1">
														<p className="text-xs font-medium text-muted-foreground">
															En la Tarde
														</p>

														<Badge
															variant     = { reqSession.isAfternoon ? "default" : "secondary" }
															className   = "text-xs"
														>
															{ reqSession.isAfternoon ? "Sí" : "No" }
														</Badge>
													</div>
												</div>

												<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
													<Languages className="h-5 w-5 text-primary mt-0.5" />

													<div className="flex-1 space-y-1">
														<p className="text-xs font-medium text-muted-foreground">
															En Inglés
														</p>

														<Badge
															variant     = { reqSession.isEnglish ? "default" : "secondary" }
															className   = "text-xs"
														>
															{ reqSession.isEnglish ? "Sí" : "No" }
														</Badge>
													</div>
												</div>

												<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
													<Clock className="h-5 w-5 text-primary mt-0.5" />

													<div className="flex-1 space-y-1">
														<p className="text-xs font-medium text-muted-foreground">
															Consecutivo
														</p>

														<Badge
															variant     = { reqSession.isConsecutive ? "default" : "secondary" }
															className   = "text-xs"
														>
															{ reqSession.isConsecutive ? "Sí" : "No" }
														</Badge>
													</div>
												</div>
											</div>

											{/* Profesor */}
											{ reqSession.professor && (
												<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
													<User className="h-5 w-5 text-primary mt-0.5" />

													<div className="flex-1 space-y-1">
														<p className="text-xs font-medium text-muted-foreground">
															Profesor
														</p>

														<p className="text-sm font-semibold">
															{ reqSession.professor.name }
														</p>
													</div>
												</div>
											)}

											{/* Descripción */}
											{ reqSession.description && (
												<div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
													<FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />

													<div className="flex-1 space-y-1">
														<p className="text-xs font-medium text-muted-foreground">
															Descripción
														</p>

														<p className="text-sm text-foreground leading-relaxed">
															{ reqSession.description }
														</p>
													</div>
												</div>
											)}
										</TabsContent>
									))}
								</Tabs>
							)}

							{/* Tabla de sesiones por día y módulo */}
							{ allSelectedSessions.length > 0 && (
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Calendar className="h-5 w-5 text-primary" />
										<h3 className="text-sm font-semibold">
											Sesiones por Día y Módulo
										</h3>
									</div>

									<SessionDayModuleSelector
										selectedSessions    = { allSelectedSessions }
										onToggleDayModule   = {() => {}} // No hace nada, solo visualización
										currentSession      = { null } // No hay sesión actual en modo visualización
										availableSessions   = { availableSessions }
										enabled             = { enabled }
									/>
								</div>
							)}
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Card>
	);
}
