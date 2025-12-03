'use client'

import { JSX } from "react";

import { Button }                       from "@/components/ui/button";
import { SessionDayModuleSelector }     from "@/components/session/session-day-module-selector";
import { sessionLabels, sessionColors } from "@/components/section/section.config";

// import { OfferSection } from "@/types/offer-section.model";
import { Session }      from "@/types/section.model";


interface SessionDayModule {
	session     : Session;
	dayModuleId : number;
	dayId       : number;
	moduleId    : number;
}


interface Props {
	// section             : OfferSection;
	selectedDayModules  : SessionDayModule[];
	currentSession      : Session | null;
	sessionRequirements : Partial<Record<Session, number>>;
	completedSessions   : Partial<Record<Session, number>>;
	allSessionsComplete : boolean;
	onToggleDayModule   : ( session: Session, dayId: number, moduleId: number, dayModuleId: number ) => void;
	onSessionChange     : ( session: Session | null ) => void;
	onNext              : () => void;
}


export function FirstPlanning({
	// section,
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
			{/* Selector de dayModules con botones integrados */}
			<SessionDayModuleSelector
				selectedSessions        = { selectedDayModules }
				onToggleDayModule       = { onToggleDayModule }
				currentSession          = { currentSession }
				availableSessions       = { Object.keys( sessionRequirements ) as Session[] }
				enabled                 = { true }
				onCurrentSessionChange  = { onSessionChange }
				sessionButtonLabel      = {( session, count ) => {
					const required      = sessionRequirements[session] || 0;
					const isComplete    = count === required;
					return `${ sessionLabels[session] } (${ count }/${ required })${ isComplete ? ' ✓' : '' }`;
				}}
			/>

			{/* Mensaje de validación */}
			{!allSessionsComplete && (
				<p className="text-sm text-amber-600 text-center">
					⚠ Debes completar todas las sesiones requeridas antes de continuar
				</p>
			)}

			{/* Botón siguiente */}
			<div className="flex justify-end border-t pt-4">
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
