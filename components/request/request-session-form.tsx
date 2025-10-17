"use client"

import { JSX, useCallback, useState } from "react"

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
import { HeadquartersSelect }       from "@/components/shared/item-select/headquarters-select";
import { SpaceFilterSelector, FilterMode } from "@/components/shared/space-filter-selector";

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
	sessionFilterMode       : Record<Session, FilterMode>;
	currentSession          : Session | null;
	onSessionDayModulesChange   : ( sessionDayModules: Record<Session, SessionDayModule[]> ) => void;
	onSessionConfigsChange      : ( sessionConfigs: Record<Session, Partial<RequestSessionCreate>> ) => void;
	onSessionBuildingsChange    : ( sessionBuildings: Record<Session, string | null> ) => void;
	onSessionFilterModeChange   : ( sessionFilterMode: Record<Session, FilterMode> ) => void;
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
	sessionFilterMode,
	currentSession,
	onSessionDayModulesChange,
	onSessionConfigsChange,
	onSessionBuildingsChange,
	onSessionFilterModeChange,
	onCurrentSessionChange,
}: Props ): JSX.Element {
	// Estado para controlar si usar configuración global
	const [ useGlobalConfig, setUseGlobalConfig ] = useState<boolean>( false );


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


	// Manejar cambio de modo de filtro
	const handleFilterModeChange = useCallback(( session: Session, filterMode: FilterMode ) => {
		onSessionFilterModeChange({
			...sessionFilterMode,
			[session]: filterMode
		});
	}, [ sessionFilterMode, onSessionFilterModeChange ]);


	return (
		<Card>
			<CardContent className="space-y-4 mt-4">
				{/* Switch para configuración global */}
				<div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
					<div className="space-y-0.5">
						<Label htmlFor="use-global-config" className="text-base font-semibold cursor-pointer">
							Configuración Global
						</Label>
						<p className="text-sm text-muted-foreground">
							Aplicar la misma configuración a todas las sesiones
						</p>
					</div>

					<Switch
						id				= "use-global-config"
						checked			= { useGlobalConfig }
						onCheckedChange	= { setUseGlobalConfig }
					/>
				</div>

				{ useGlobalConfig ? (
					<div className="space-y-4">
						{/* Configuración Global - Aplica a todas las sesiones */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Profesor */}
							<ProfessorSelect
								label				= "Profesor"
								multiple			= { false }
								placeholder			= "Seleccionar profesor"
								defaultValues		= { sessionConfigs[availableSessions[0]]?.professorId || undefined }
								onSelectionChange	= {( value ) => {
									const professorId = typeof value === 'string' ? value : null;
									const updatedConfigs = { ...sessionConfigs };
									availableSessions.forEach( session => {
										updatedConfigs[session] = {
											...updatedConfigs[session],
											professorId
										};
									});
									onSessionConfigsChange( updatedConfigs );
								}}
							/>

							{/* Edificio */}
							<HeadquartersSelect
								label				= "Edificio"
								multiple			= { false }
								placeholder			= "Seleccionar edificio"
								defaultValues		= { sessionBuildings[availableSessions[0]] || undefined }
								onSelectionChange	= {( value ) => {
									const buildingId = typeof value === 'string' ? value : null;
									const updatedBuildings = { ...sessionBuildings };
									const updatedConfigs = { ...sessionConfigs };

									availableSessions.forEach( session => {
										updatedBuildings[session] = buildingId;
										updatedConfigs[session] = {
											...updatedConfigs[session],
											building    : buildingId || undefined,
											spaceType   : null,
											spaceSizeId : null,
											spaceId     : null,
										};
									});

									onSessionBuildingsChange( updatedBuildings );
									onSessionConfigsChange( updatedConfigs );
								}}
							/>
						</div>

						{/* Selector de filtros de espacio */}
						{ sessionConfigs[availableSessions[0]]?.building && (
							<SpaceFilterSelector
								buildingId			= { sessionConfigs[availableSessions[0]].building || null }
								filterMode			= { sessionFilterMode[availableSessions[0]] }
								spaceId				= { sessionConfigs[availableSessions[0]].spaceId || null }
								spaceType			= { sessionConfigs[availableSessions[0]].spaceType || null }
								spaceSizeId			= { sessionConfigs[availableSessions[0]].spaceSizeId || null }
								onFilterModeChange	= {( mode ) => {
									const updatedFilterModes = { ...sessionFilterMode };
									availableSessions.forEach( session => {
										updatedFilterModes[session] = mode;
									});
									onSessionFilterModeChange( updatedFilterModes );
								}}
								onSpaceIdChange		= {( spaceId ) => {
									const normalizedSpaceId = typeof spaceId === 'string' ? spaceId : null;
									const updatedConfigs = { ...sessionConfigs };
									availableSessions.forEach( session => {
										updatedConfigs[session] = {
											...updatedConfigs[session],
											spaceId: normalizedSpaceId
										};
									});
									onSessionConfigsChange( updatedConfigs );
								}}
								onSpaceTypeChange	= {( spaceType ) => {
									const updatedConfigs = { ...sessionConfigs };
									availableSessions.forEach( session => {
										updatedConfigs[session] = {
											...updatedConfigs[session],
											spaceType: spaceType as any
										};
									});
									onSessionConfigsChange( updatedConfigs );
								}}
								onSpaceSizeIdChange	= {( spaceSizeId ) => {
									const updatedConfigs = { ...sessionConfigs };
									availableSessions.forEach( session => {
										updatedConfigs[session] = {
											...updatedConfigs[session],
											spaceSizeId
										};
									});
									onSessionConfigsChange( updatedConfigs );
								}}
							/>
						)}

						{/* Switches */}
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
							<div className="flex items-center justify-between rounded-lg border p-3">
								<Label htmlFor="global-isEnglish" className="cursor-pointer">
									En inglés
								</Label>

								<Switch
									id				= "global-isEnglish"
									checked			= { sessionConfigs[availableSessions[0]]?.isEnglish || false }
									onCheckedChange	= {( checked ) => {
										const updatedConfigs = { ...sessionConfigs };
										availableSessions.forEach( session => {
											updatedConfigs[session] = {
												...updatedConfigs[session],
												isEnglish: checked
											};
										});
										onSessionConfigsChange( updatedConfigs );
									}}
								/>
							</div>

							<div className="flex items-center justify-between rounded-lg border p-3">
								<Label htmlFor="global-isConsecutive" className="cursor-pointer">
									Consecutivo
								</Label>

								<Switch
									id				= "global-isConsecutive"
									checked			= { sessionConfigs[availableSessions[0]]?.isConsecutive || false }
									onCheckedChange	= {( checked ) => {
										const updatedConfigs = { ...sessionConfigs };
										availableSessions.forEach( session => {
											updatedConfigs[session] = {
												...updatedConfigs[session],
												isConsecutive: checked
											};
										});
										onSessionConfigsChange( updatedConfigs );
									}}
								/>
							</div>

							<div className="flex items-center justify-between rounded-lg border p-3">
								<Label htmlFor="global-inAfternoon" className="cursor-pointer">
									En la tarde
								</Label>

								<Switch
									id				= "global-inAfternoon"
									checked			= { sessionConfigs[availableSessions[0]]?.inAfternoon || false }
									onCheckedChange	= {( checked ) => {
										const updatedConfigs = { ...sessionConfigs };
										availableSessions.forEach( session => {
											updatedConfigs[session] = {
												...updatedConfigs[session],
												inAfternoon: checked
											};
										});
										onSessionConfigsChange( updatedConfigs );
									}}
								/>
							</div>
						</div>

						{/* Descripción */}
						<div>
							<Label htmlFor="global-description">Descripción de la sesión</Label>

							<Textarea
								id			= "global-description"
								placeholder	= "Descripción opcional"
								className	= "mt-2"
								value		= { sessionConfigs[availableSessions[0]]?.description || '' }
								onChange	= {( e ) => {
									const updatedConfigs = { ...sessionConfigs };
									availableSessions.forEach( session => {
										updatedConfigs[session] = {
											...updatedConfigs[session],
											description: e.target.value
										};
									});
									onSessionConfigsChange( updatedConfigs );
								}}
							/>
						</div>
					</div>
				) : (
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

							{/* Selector de filtros de espacio */}
							{ sessionConfigs[session].building && (
								<SpaceFilterSelector
									buildingId          = { sessionConfigs[session].building || null }
									filterMode          = { sessionFilterMode[session] }
									spaceId             = { sessionConfigs[session].spaceId || null }
									spaceType           = { sessionConfigs[session].spaceType || null }
									spaceSizeId         = { sessionConfigs[session].spaceSizeId || null }
									onFilterModeChange  = {( mode ) => handleFilterModeChange( session, mode )}
									onSpaceIdChange     = {( spaceId ) => handleSessionConfigChange( session, 'spaceId', spaceId )}
									onSpaceTypeChange   = {( spaceType ) => handleSessionConfigChange( session, 'spaceType', spaceType )}
									onSpaceSizeIdChange = {( spaceSizeId ) => handleSessionConfigChange( session, 'spaceSizeId', spaceSizeId )}
								/>
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
				)}

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
