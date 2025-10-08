'use client'

import { JSX } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
}                           from '@/components/ui/accordion';
import { Card }             from '@/components/ui/card';
import { Button }           from '@/components/ui/button';
import { Badge }            from '@/components/ui/badge';
import { ShowStatus }       from '@/components/shared/status';
import {
	ExternalLinkIcon,
	User,
	Building2,
	Clock,
	GraduationCap,
	Languages,
	Sun,
	FileText
}                           from 'lucide-react';

import { RequestSession }   from '@/types/offer-section.model';


interface Props {
	requestSession  : RequestSession;
	onViewRequest?  : ( requestId: string ) => void;
}


/**
 * Component to display request session information in an accordion format
 */
export function SessionInfoRequest({
	requestSession,
	onViewRequest
}: Props ): JSX.Element {
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
											{ requestSession.title }
										</span>
									</div>

									<p className="text-xs text-muted-foreground">
										ID: { requestSession.id }
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<ShowStatus status={ requestSession.status } />

								{ onViewRequest && (
									<Button
										variant     = "outline"
										size        = "icon"
										title       = "Ver solicitud completa"
										onClick     = { ( e ) => {
											e.stopPropagation();
											onViewRequest( requestSession.id );
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
						<div className="space-y-4 pt-2">
							{/* Sección: Información del Espacio */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
									<Building2 className="h-5 w-5 text-primary mt-0.5" />

									<div className="flex-1 space-y-1">
										<p className="text-xs font-medium text-muted-foreground">
											Espacio
										</p>

										<p className="text-sm font-semibold">
											{ requestSession.spaceId || (
												<span className="text-muted-foreground">
													No especificado
												</span>
											)}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
									<Building2 className="h-5 w-5 text-primary mt-0.5" />

									<div className="flex-1 space-y-1">
										<p className="text-xs font-medium text-muted-foreground">
											Edificio
										</p>

										<p className="text-sm font-semibold">
											{ requestSession.building || (
												<span className="text-muted-foreground">
													No especificado
												</span>
											)}
										</p>
									</div>
								</div>
							</div>

							{/* Sección: Configuración de Sesión */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
									<Sun className="h-5 w-5 text-primary mt-0.5" />

									<div className="flex-1 space-y-1">
										<p className="text-xs font-medium text-muted-foreground">
											En la Tarde
										</p>

										<Badge
											variant     = { requestSession.isAfternoon ? "default" : "secondary" }
											className   = "text-xs"
										>
											{ requestSession.isAfternoon ? "Sí" : "No" }
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
											variant     = { requestSession.isEnglish ? "default" : "secondary" }
											className   = "text-xs"
										>
											{ requestSession.isEnglish ? "Sí" : "No" }
										</Badge>
									</div>
								</div>

								<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
									<Clock className="h-5 w-5 text-primary mt-0.5" />

									<div className="flex-1 space-y-1">
										<p className="text-xs font-medium text-muted-foreground">
											Módulo
										</p>

										<p className="text-sm font-semibold">
											{ requestSession.moduleId }
										</p>
									</div>
								</div>
							</div>

							{/* Sección: Información Académica */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
									<GraduationCap className="h-5 w-5 text-primary mt-0.5" />

									<div className="flex-1 space-y-1">
										<p className="text-xs font-medium text-muted-foreground">
											Grado
										</p>

										<p className="text-sm font-semibold">
											{ requestSession.grade.name }
										</p>

										<p className="text-xs text-muted-foreground">
											ID: { requestSession.grade.id }
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
									<User className="h-5 w-5 text-primary mt-0.5" />

									<div className="flex-1 space-y-1">
										<p className="text-xs font-medium text-muted-foreground">
											Profesor
										</p>

										<p className="text-sm font-semibold">
											{ requestSession.professor.name }
										</p>

										<p className="text-xs text-muted-foreground">
											{ requestSession.professor.email }
										</p>
									</div>
								</div>
							</div>

							{/* Sección: Descripción */}
							{ requestSession.description && (
								<div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
									<FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />

									<div className="flex-1 space-y-1">
										<p className="text-xs font-medium text-muted-foreground">
											Descripción
										</p>

										<p className="text-sm text-foreground leading-relaxed">
											{ requestSession.description }
										</p>
									</div>
								</div>
							)}
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Card>
	);
}
