'use client'

import { JSX } from "react";

import { Button }                   from "@/components/ui/button";
import { SessionDayModuleSelector } from "@/components/session/session-day-module-selector";
import { SessionName }              from "@/components/session/session-name";
import { sessionLabels, sessionColors } from "@/components/section/section.config";

import { OfferSection } from "@/types/offer-section.model";
import { Session }      from "@/types/section.model";


interface SessionDayModule {
	session         : Session;
	dayModuleId     : number;
	dayId           : number;
	moduleId        : number;
}


interface Props {
	section                 : OfferSection;
	selectedDayModules      : SessionDayModule[];
	currentSession          : Session | null;
	sessionRequirements     : Partial<Record<Session, number>>;
	completedSessions       : Partial<Record<Session, number>>;
	allSessionsComplete     : boolean;
	onToggleDayModule       : ( session: Session, dayId: number, moduleId: number, dayModuleId: number ) => void;
	onSessionChange         : ( session: Session | null ) => void;
	onNext                  : () => void;
}


export function FirstPlanning({
	section,
	selectedDayModules,
	currentSession,
	sessionRequirements,
	completedSessions,
	allSessionsComplete,
	onToggleDayModule,
	onSessionChange,
	onNext
}: Props ): JSX.Element {
	return (
		<div className="space-y-4">
            <span className="text-sm font-medium">Primero seleccione el tipo de sesión y luego los días y módulos</span>
			{/* Selector de tipo de sesión */}
			<div className="flex flex-wrap gap-2">
				{Object.entries( sessionRequirements ).map(([ session, required ]) => {
					const sessionKey    = session as Session;
					const completed     = completedSessions[sessionKey] || 0;
					const isComplete    = completed === required;
					const isCurrent     = currentSession === sessionKey;

					return (
						<Button
							key         = { sessionKey }
							variant     = { isCurrent ? "default" : "outline" }
							size        = "sm"
							onClick     = {() => onSessionChange( sessionKey )}
							className   = {`${ isCurrent ? sessionColors[sessionKey] + ' text-white hover:' + sessionColors[sessionKey] : '' }`}
						>
							{ sessionLabels[sessionKey] } ({ completed }/{ required })
							{ isComplete && " ✓" }
						</Button>
					);
				})}
			</div>

			{/* Selector de dayModules */}
			<SessionDayModuleSelector
				selectedSessions    = { selectedDayModules }
				onToggleDayModule   = { onToggleDayModule }
				currentSession      = { currentSession }
				availableSessions   = { Object.keys( sessionRequirements ) as Session[] }
				enabled             = { true }
			/>

			{/* Mensaje de validación */}
			{!allSessionsComplete && (
				<p className="text-sm text-amber-600 text-center">
					⚠ Debes completar todas las sesiones requeridas antes de continuar
				</p>
			)}

			{/* Botón siguiente */}
			<div className="flex justify-end">
				<Button
					onClick     = { onNext }
					disabled    = { !allSessionsComplete }
				>
					Siguiente
				</Button>
			</div>
		</div>
	);
}
