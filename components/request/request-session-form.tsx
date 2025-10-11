"use client"

import { JSX, useCallback } from "react"

import { z } from "zod";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
}                                   from "@/components/ui/tabs";
import {
	Card,
	CardContent,
}                                   from "@/components/ui/card";
import { Button }                   from "@/components/ui/button";
import { Switch }                   from "@/components/ui/switch";
import { Textarea }                 from "@/components/ui/textarea";
import { Label }                    from "@/components/ui/label";
import { SessionDayModuleSelector } from "@/components/session/session-day-module-selector";
import { ProfessorSelect }          from "@/components/shared/item-select/professor-select";
import { SpaceSelect }              from "@/components/shared/item-select/space-select";
import { HeadquartersSelect }       from "@/components/shared/item-select/headquarters-select";
import { SizeSelect }               from "@/components/shared/item-select/size-select";
import { SpaceTypeSelect }          from "@/components/shared/item-select/space-type-select";
import { Checkbox }                 from "@/components/ui/checkbox";

import { Session }              from "@/types/section.model";
import { RequestSessionCreate } from "@/types/request-session.model";


interface SessionDayModule {
	session         : Session;
	dayModuleId     : number;
	dayId           : number;
	moduleId        : number;
}


interface Props {
	availableSessions       : Session[];
	sessionDayModules       : Record<Session, SessionDayModule[]>;
	sessionConfigs          : Record<Session, Partial<RequestSessionCreate>>;
	sessionBuildings        : Record<Session, string | null>;
	sessionFilterType       : Record<Session, 'type' | 'size' | 'space'>;
	currentSession          : Session | null;
	onSessionDayModulesChange   : ( sessionDayModules: Record<Session, SessionDayModule[]> ) => void;
	onSessionConfigsChange      : ( sessionConfigs: Record<Session, Partial<RequestSessionCreate>> ) => void;
	onSessionBuildingsChange    : ( sessionBuildings: Record<Session, string | null> ) => void;
	onSessionFilterTypeChange   : ( sessionFilterType: Record<Session, 'type' | 'size' | 'space'> ) => void;
	onCurrentSessionChange      : ( currentSession: Session | null ) => void;
}


const sessionLabels: Record<Session, string> = {
	[Session.C] : 'Cátedra',
	[Session.A] : 'Ayudantía',
	[Session.T] : 'Taller',
	[Session.L] : 'Laboratorio',
};


const sessionColors: Record<Session, string> = {
	[Session.C] : 'bg-blue-500',
	[Session.A] : 'bg-green-500',
	[Session.T] : 'bg-orange-500',
	[Session.L] : 'bg-purple-500',
};


// Zod schema for request session validation
export const requestSessionSchema = z.object({
	building    : z.string().min( 1, { message: "El edificio es obligatorio" }),
	spaceFilter : z.object({
		spaceId     : z.string().nullable(),
		spaceType   : z.string().nullable(),
		spaceSizeId : z.string().nullable(),
	}).refine(
		( data ) => data.spaceId !== null || data.spaceType !== null || data.spaceSizeId !== null,
		{
			message : "Debe seleccionar al menos un filtro: Espacio específico, Tipo de espacio o Tamaño",
		}
	),
});


export function RequestSessionForm({
	availableSessions,
	sessionDayModules,
	sessionConfigs,
	sessionBuildings,
	sessionFilterType,
	currentSession,
	onSessionDayModulesChange,
	onSessionConfigsChange,
	onSessionBuildingsChange,
	onSessionFilterTypeChange,
	onCurrentSessionChange,
}: Props ): JSX.Element {
	// Manejar toggle de dayModule
	const handleToggleDayModule = useCallback(( session: Session, dayId: number, moduleId: number, dayModuleId: number ) => {
		onSessionDayModulesChange({
			...sessionDayModules,
			[session]: (() => {
				const sessionModules = sessionDayModules[session];
				const existingIndex = sessionModules.findIndex( dm => dm.dayId === dayId && dm.moduleId === moduleId );

				if ( existingIndex >= 0 ) {
					// Remover
					return sessionModules.filter(( _, index ) => index !== existingIndex );
				} else {
					// Validar que el dayModule no esté siendo usado por otra sesión
					const isUsedByOtherSession = Object.entries( sessionDayModules ).some(([ otherSession, modules ]) => {
						if ( otherSession === session ) return false; // Ignorar la sesión actual
						return modules.some( dm => dm.dayModuleId === dayModuleId );
					});

					if ( isUsedByOtherSession ) {
						// Encontrar qué sesión está usando este dayModule
						const usedBySession = Object.entries( sessionDayModules ).find(([ otherSession, modules ]) => {
							if ( otherSession === session ) return false;
							return modules.some( dm => dm.dayModuleId === dayModuleId );
						});

						const sessionName = usedBySession ? sessionLabels[usedBySession[0] as Session] : 'otra sesión';

						// Importar toast aquí si es necesario
						import( "sonner" ).then(({ toast }) => {
							import( "@/config/toast/toast.config" ).then(({ errorToast }) => {
								toast(
									`Este horario ya está siendo usado por ${sessionName}`,
									{
										...errorToast,
										description: 'Un mismo horario no puede ser seleccionado por múltiples sesiones'
									}
								);
							});
						});

						return sessionModules; // No hacer cambios
					}

					// Agregar
					return [...sessionModules, {
						session,
						dayModuleId,
						dayId,
						moduleId
					}];
				}
			})()
		});
	}, [ sessionDayModules, onSessionDayModulesChange ]);


	// Manejar cambio de configuración de sesión
	const handleSessionConfigChange = useCallback(( session: Session, key: keyof RequestSessionCreate, value: any ) => {
		onSessionConfigsChange({
			...sessionConfigs,
			[session]: {
				...sessionConfigs[session],
				[key]: value
			}
		});
	}, [ sessionConfigs, onSessionConfigsChange ]);


	// Manejar cambio de edificio
	const handleBuildingChange = useCallback(( session: Session, buildingId: string | null ) => {
		// Actualizar sessionBuildings
		onSessionBuildingsChange({
			...sessionBuildings,
			[session]: buildingId
		});

		// Actualizar sessionConfigs con el nuevo edificio y limpiar filtros de espacio
		onSessionConfigsChange({
			...sessionConfigs,
			[session]: {
				...sessionConfigs[session],
				building    : buildingId,
				spaceType   : null,
				spaceSizeId : null,
				spaceId     : null,
			}
		});
	}, [ sessionBuildings, sessionConfigs, onSessionBuildingsChange, onSessionConfigsChange ]);


	// Manejar cambio de tipo de filtro
	const handleFilterTypeChange = useCallback(( session: Session, filterType: 'type' | 'size' | 'space' ) => {
		onSessionFilterTypeChange({
			...sessionFilterType,
			[session]: filterType
		});

		// Limpiar las otras opciones según el tipo seleccionado
		if ( filterType === 'space' ) {
			handleSessionConfigChange( session, 'spaceType', null );
			handleSessionConfigChange( session, 'spaceSizeId', null );
		} else if ( filterType === 'type' ) {
			handleSessionConfigChange( session, 'spaceId', null );
			handleSessionConfigChange( session, 'spaceSizeId', null );
		} else if ( filterType === 'size' ) {
			handleSessionConfigChange( session, 'spaceType', null );
			handleSessionConfigChange( session, 'spaceId', null );
		}
	}, [ sessionFilterType, onSessionFilterTypeChange, handleSessionConfigChange ]);


	return (
		<Card>
			<CardContent className="space-y-4 mt-4">
				{/* Tabs para configuración individual de cada sesión */}
				<Tabs defaultValue={ availableSessions[0] } className="w-full">
					<TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableSessions.length}, 1fr)` }}>
						{availableSessions.map( session => (
							<TabsTrigger
								key     = { session }
								value   = { session }
							>
								{ sessionLabels[session] }
							</TabsTrigger>
						))}
					</TabsList>

					{availableSessions.map( session => (
						<TabsContent key={ session } value={ session } className="space-y-4 mt-4">
							
							{/* Configuración de la sesión */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Profesor */}
								<ProfessorSelect
									label               = "Profesor"
									multiple            = { false }
									placeholder         = "Seleccionar profesor"
									defaultValues       = { sessionConfigs[session].professorId || undefined }
									onSelectionChange   = {( value ) => {
										const professorId = typeof value === 'string' ? value : null;
										handleSessionConfigChange( session, 'professorId', professorId );
									}}
								/>

								{/* Edificio */}
								<HeadquartersSelect
									label               = "Edificio"
									multiple            = { false }
									placeholder         = "Seleccionar edificio"
									defaultValues       = { sessionBuildings[session] || undefined }
									onSelectionChange   = {( value ) => {
										const buildingId = typeof value === 'string' ? value : null;
										handleBuildingChange( session, buildingId );
									}}
								/>
							</div>

							{/* Selector de tipo de filtro (Type, Size, Space) */}
							{ sessionConfigs[session].building && (
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
									{/* Espacio Específico */}
									<div className="flex gap-2 items-end">
										<Checkbox
											className       = "cursor-default rounded-full p-[0.6rem] flex justify-center items-center mb-2"
											checked         = { sessionFilterType[session] === 'space' }
											onCheckedChange = {( checked ) => {
												if ( checked ) {
													handleFilterTypeChange( session, 'space' );
												}
											}}
										/>

										<div className="w-full">
											<SpaceSelect
												label               = "Espacio Específico"
												multiple            = { false }
												placeholder         = "Seleccionar espacio"
												defaultValues       = { sessionConfigs[session].spaceId || undefined }
												onSelectionChange   = {( value ) => {
													const spaceId = typeof value === 'string' ? value : null;
													handleSessionConfigChange( session, 'spaceId', spaceId );
												}}
												buildingFilter      = { sessionConfigs[session].building || undefined }
												disabled            = { sessionFilterType[session] !== 'space' }
											/>
										</div>
									</div>

									{/* Tipo de Espacio */}
									<div className="flex gap-2 items-end">
										<Checkbox
											className       = "cursor-default rounded-full p-[0.6rem] flex justify-center items-center mb-2"
											checked         = { sessionFilterType[session] === 'type' }
											onCheckedChange = {( checked ) => {
												if ( checked ) {
													handleFilterTypeChange( session, 'type' );
												}
											}}
										/>

										<div className="w-full">
											<SpaceTypeSelect
												label               = "Tipo de Espacio"
												multiple            = { false }
												placeholder         = "Seleccionar tipo"
												defaultValues       = { sessionConfigs[session].spaceType || undefined }
												onSelectionChange   = {( value ) => {
													const spaceType = ( typeof value === 'string' && value !== 'none' ) ? value : null;
													handleSessionConfigChange( session, 'spaceType', spaceType );
												}}
												buildingFilter      = { sessionConfigs[session].building || undefined }
												disabled            = { sessionFilterType[session] !== 'type' }
											/>
										</div>
									</div>

									{/* Tamaño */}
									<div className="flex gap-2 items-end">
										<Checkbox
											className       = "cursor-default rounded-full p-[0.6rem] flex justify-center items-center mb-2"
											checked         = { sessionFilterType[session] === 'size' }
											onCheckedChange = {( checked ) => {
												if ( checked ) {
													handleFilterTypeChange( session, 'size' );
												}
											}}
										/>

										<div className="w-full">
											<SizeSelect
												label               = "Tamaño"
												multiple            = { false }
												placeholder         = "Seleccionar tamaño"
												defaultValues       = { sessionConfigs[session].spaceSizeId || undefined }
												onSelectionChange   = {( value ) => {
													const sizeId = typeof value === 'string' ? value : null;
													handleSessionConfigChange( session, 'spaceSizeId', sizeId );
												}}
												buildingFilter      = { sessionConfigs[session].building || undefined }
												disabled            = { sessionFilterType[session] !== 'size' }
											/>
										</div>
									</div>
								</div>
							)}

							{/* Switches */}
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
								<div className="flex items-center justify-between rounded-lg border p-3">
									<Label htmlFor={`isEnglish-${session}`} className="cursor-pointer">
										En inglés
									</Label>

									<Switch
										id              = {`isEnglish-${session}`}
										checked         = { sessionConfigs[session].isEnglish || false }
										onCheckedChange = {( checked ) => handleSessionConfigChange( session, 'isEnglish', checked )}
									/>
								</div>

								<div className="flex items-center justify-between rounded-lg border p-3">
									<Label htmlFor={`isConsecutive-${session}`} className="cursor-pointer">
										Consecutivo
									</Label>

									<Switch
										id              = {`isConsecutive-${session}`}
										checked         = { sessionConfigs[session].isConsecutive || false }
										onCheckedChange = {( checked ) => handleSessionConfigChange( session, 'isConsecutive', checked )}
									/>
								</div>

								<div className="flex items-center justify-between rounded-lg border p-3">
									<Label htmlFor={`inAfternoon-${session}`} className="cursor-pointer">
										En la tarde
									</Label>

									<Switch
										id              = {`inAfternoon-${session}`}
										checked         = { sessionConfigs[session].inAfternoon || false }
										onCheckedChange = {( checked ) => handleSessionConfigChange( session, 'inAfternoon', checked )}
									/>
								</div>
							</div>

							{/* Descripción de la sesión */}
							<div>
								<Label htmlFor={`description-${session}`}>Descripción de la sesión</Label>

								<Textarea
									id          = {`description-${session}`}
									placeholder = "Descripción opcional"
									className   = "mt-2"
									value       = { sessionConfigs[session].description || '' }
									onChange    = {( e ) => handleSessionConfigChange( session, 'description', e.target.value )}
								/>
							</div>
						</TabsContent>
					))}
				</Tabs>

				<div className="space-y-2">
					<Label>Selecciona la sesión para marcar posibles horarios semanales</Label>

					<div className="flex flex-wrap gap-2">
						{availableSessions.map( session => {
							const isCurrent = currentSession === session;
							const count = sessionDayModules[session].length;

							return (
								<Button
									key         = { session }
									variant     = { isCurrent ? "default" : "outline" }
									size        = "sm"
									onClick     = {() => onCurrentSessionChange( session )}
									className   = {`${ isCurrent ? sessionColors[session] + ' text-white hover:' + sessionColors[session] : '' }`}
								>
									{ sessionLabels[session] } ({ count })
								</Button>
							);
						})}
					</div>
				</div>

				{/* Tabla única compartida */}
				<SessionDayModuleSelector
					selectedSessions    = { Object.values( sessionDayModules ).flat() }
					onToggleDayModule   = { handleToggleDayModule }
					currentSession      = { currentSession }
					availableSessions   = { availableSessions }
					enabled             = { true }
				/>
			</CardContent>
		</Card>
	);
}
