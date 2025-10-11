import { JSX, useState, useCallback, useMemo } from "react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}                       from "@/components/ui/table"
import { DayModule, Module }       from "@/types/request";
import { useQuery }     from "@tanstack/react-query";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { Session }      from "@/types/section.model";
import { sessionColors } from "../section/section.config";


interface SessionDayModule {
	session         : Session;
	dayModuleId     : number;
	dayId           : number;
	moduleId        : number;
}


interface Props {
	selectedSessions    : SessionDayModule[];
	onToggleDayModule   : ( session: Session, dayId: number, moduleId: number, dayModuleId: number ) => void;
	currentSession      : Session | null;
	availableSessions   : Session[];
	enabled             : boolean;
}


export function SessionDayModuleSelector({
	selectedSessions,
	onToggleDayModule,
	currentSession,
	availableSessions,
	enabled
}: Props ): JSX.Element {
	const {
		data        : modules = [],
		isLoading   : isLoadingModules,
		isError     : isErrorModules,
	} = useQuery({
		queryKey    : [KEY_QUERYS.MODULES],
		queryFn     : () => fetchApi<Module[]>({ url: 'modules/original' }),
	});

    const {
		data        : dayModules = [],
		isLoading   : isLoadingDayModules,
		isError     : isErrorDayModules,
	} = useQuery({
		queryKey    : [KEY_QUERYS.MODULES, 'dayModules'],
		queryFn     : () => fetchApi<DayModule[]>({ url: 'modules/dayModule' }),
	});


	const availableDays = useMemo(() => {
		const dayNames      = [ 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo' ];
		const uniqueDayIds  = new Set<number>();

		modules.forEach( module => {
			module.days.forEach( dayId => uniqueDayIds.add( dayId ));
		});

		return Array.from( uniqueDayIds )
			.sort(( a, b ) => a - b )
			.map( dayId => ({
				id          : dayId,
				name        : dayNames[dayId - 1] || `Día ${dayId}`,
				shortName   : dayNames[dayId - 1]?.substring( 0, 3 ) || `D${dayId}`,
				mediumName  : dayNames[dayId - 1]?.substring( 0, 4 ) || `Día${dayId}`
			}));
	}, [ modules ]);


	const modulesWithDays = useMemo(() => {
		return modules.filter( module => module.days.length > 0 );
	}, [ modules ]);


	// Map para saber qué sesión tiene cada dayModuleId
	const dayModuleSessionMap = useMemo(() => {
		const map = new Map<string, Session>();

		selectedSessions.forEach( item => {
			const key = `${item.dayId}-${item.moduleId}`;
			map.set( key, item.session );
		});

		return map;
	}, [ selectedSessions ]);


	// Verificar si un dayModule está seleccionado
	const getSessionForDayModule = useCallback(( dayId: number, moduleId: string ): Session | null => {
		const key = `${dayId}-${moduleId}`;
		return dayModuleSessionMap.get( key ) || null;
	}, [ dayModuleSessionMap ]);


	// Calcular el dayModuleId basado en dayId y moduleId
	const calculateDayModuleId = useCallback(( dayId: number, moduleId: number ): number => {
		// Esta es una lógica temporal, deberías ajustarla según tu backend
		// Asumiendo que dayModuleId = (dayId * 1000) + parseInt(moduleId)
		// return ( dayId * 1000 ) + parseInt( moduleId );
        return dayModules.find( dayModule => dayModule.dayId === dayId && dayModule.moduleId === moduleId )?.id || 0;
	}, [ dayModules ]);


	const handleCellClick = useCallback(( dayId: number, moduleId: number ): void => {
		if ( !currentSession || !enabled ) return;

		// const sessionForThisDayModule = getSessionForDayModule( dayId, moduleId );
		const dayModuleId = calculateDayModuleId( dayId, moduleId );

		onToggleDayModule( currentSession, dayId, moduleId, dayModuleId );
	}, [ currentSession, enabled, getSessionForDayModule, calculateDayModuleId, onToggleDayModule ]);


	// Obtener el color de fondo según la sesión
	// const getCellBackgroundColor = useCallback(( session: Session | null ): string => {
	// 	if ( !session ) return '';

	// 	const colorClass = sessionColors[session];
	// 	return colorClass.replace( 'bg-', '' );
	// }, []);


	if ( isLoadingModules ) {
		return (
			<div className="w-full p-8 text-center text-muted-foreground">
				Cargando módulos...
			</div>
		);
	}


	if ( isErrorModules ) {
		return (
			<div className="w-full p-8 text-center text-red-500">
				Error al cargar los módulos
			</div>
		);
	}


	if ( modulesWithDays.length === 0 ) {
		return (
			<div className="w-full p-8 text-center text-muted-foreground">
				No hay módulos disponibles con días asignados
			</div>
		);
	}


	return (
		<div className="w-full">
			<div className="border rounded-lg bg-background relative">
				{/* Header fijo */}
				<div className="sticky top-0 z-30 bg-background border-b">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[7.85rem] px-3 border-r bg-background">
										Módulos
									</TableHead>

									{availableDays.map(( day ) => (
										<TableHead
											key         = { day.id }
											className   = "text-center w-20 min-w-20 px-2 whitespace-nowrap bg-background"
										>
											{ day.name }
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
						</Table>
					</div>
				</div>

				{/* Contenido con scroll */}
				<div className="">
					<Table>
						<TableBody>
							{modulesWithDays.map(( module ) => (
								<TableRow key={module.id}>
									<TableCell
										className   = "sticky left-0 bg-background z-10 w-32 min-w-32 p-3 border-r shadow-md text-xs truncate"
										title       = { `${ module.name } ${ module.difference ?? '' } ${ module.startHour }-${ module.endHour }` }
									>
										{ module.name } { module.difference ?? '' } { module.startHour }-{ module.endHour }
									</TableCell>

									{ availableDays.map( day => {
										// Verificar si este módulo está disponible en este día
										const isModuleAvailableOnDay    = module.days.includes( day.id );
										const sessionForThisCell        = getSessionForDayModule( day.id, module.id.toString() );
										const isSelected                = sessionForThisCell !== null;
										const canSelect                 = enabled && currentSession && availableSessions.includes( currentSession );

										let cellStyle: React.CSSProperties = {};

                                        if ( isSelected && sessionForThisCell ) {
											const colorMap: Record<Session, string> = {
												[Session.C]: '#3b82f6', // blue-500
												[Session.A]: '#22c55e', // green-500
												[Session.T]: '#f97316', // orange-500
												[Session.L]: '#a855f7', // purple-500
											};

                                            cellStyle = {
												backgroundColor : colorMap[sessionForThisCell],
												color           : 'white'
											};
										}

										return (
											<TableCell
												key         = { `${ module.id }-${ day.id }` }
												className   = {`text-center w-20 min-w-20 p-2 transition-colors ${
													isModuleAvailableOnDay 
														? ( canSelect ? 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800 cursor-pointer' : 'cursor-not-allowed opacity-70' )
														: 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50'
												}`}
												style       = { cellStyle }
												onClick     = {() => {
													if ( !isModuleAvailableOnDay || !canSelect ) return;
													handleCellClick( day.id, module.id );
												}}
											>
												{ isModuleAvailableOnDay ? (
													isSelected && sessionForThisCell ? (
														<span className="font-semibold">{ sessionForThisCell }</span>
													) : (
														<span className="text-gray-400">—</span>
													)
												) : (
													<span className="text-gray-400">—</span>
												)}
											</TableCell>
										);
									})}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
