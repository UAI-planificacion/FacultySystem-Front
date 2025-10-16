'use client'

import { JSX } from "react";

import {
	Card,
	CardContent
}										from "@/components/ui/card";
import { Label }						from "@/components/ui/label";
import { Switch }						from "@/components/ui/switch";
import { Button }						from "@/components/ui/button";
import { HeadquartersSelect }			from "@/components/shared/item-select/headquarters-select";
import { SpaceFilterSelector, FilterMode } from "@/components/shared/space-filter-selector";
import { ProfessorSelect }				from "@/components/shared/item-select/professor-select";
import { sessionLabels }				from "@/components/section/section.config";

import { OfferSection }	from "@/types/offer-section.model";
import { Session }		from "@/types/section.model";
import { Cuboid, Globe, Languages, Settings, User } from "lucide-react";
import { SessionType } from "@/components/session/session-type";


function getResponsive( section : OfferSection | null ): string {
	if ( !section ) return 'grid-cols-1';

	let sessionCount = 0;

	if ( section.lecture > 0 )          sessionCount++;
	if ( section.tutoringSession > 0 )  sessionCount++;
	if ( section.workshop > 0 )         sessionCount++;
	if ( section.laboratory > 0 )       sessionCount++;

    return {
        1 : 'grid-cols-1',
        2 : 'grid-cols-1 md:grid-cols-2',
        3 : 'grid-cols-1 md:grid-cols-3',
        4 : 'grid-cols-1 md:grid-cols-4'
    }[sessionCount] || 'grid-cols-1';
}


interface Props {
	section						: OfferSection;
	sessionRequirements			: Partial<Record<Session, number>>;
	sessionSpaces				: Record<Session, string[]>;
	sessionProfessors			: Record<Session, string[]>;
	sessionBuildings			: Record<Session, string | null>;
	sessionSpaceTypes			: Record<Session, string | null>;
	sessionSpaceSizes			: Record<Session, string | null>;
	sessionFilterModes			: Record<Session, FilterMode>;
	sessionInEnglish			: Record<Session, boolean>;
	useSameSpace				: boolean;
	globalSpaceId				: string[];
	globalBuildingId			: string | null;
	useSameProfessor			: boolean;
	globalProfessorId			: string[];
	allInEnglish				: boolean;
	onSpaceChange				: ( session: Session, value: string | string[] | undefined ) => void;
	onProfessorChange			: ( session: Session, value: string | string[] | undefined ) => void;
	onGlobalSpaceChange			: ( value: string | string[] | undefined ) => void;
	onGlobalBuildingChange		: ( buildingId: string | null ) => void;
	onGlobalProfessorChange		: ( value: string | string[] | undefined ) => void;
	onUseSameSpaceToggle		: ( checked: boolean ) => void;
	onUseSameProfessorToggle	: ( checked: boolean ) => void;
	onBuildingChange			: ( session: Session, buildingId: string | null ) => void;
	onSpaceTypeChange			: ( session: Session, spaceType: string | null ) => void;
	onSpaceSizeChange			: ( session: Session, spaceSizeId: string | null ) => void;
	onFilterModeChange			: ( session: Session, filterMode: FilterMode ) => void;
	onInEnglishChange			: ( session: Session, checked: boolean ) => void;
	onAllInEnglishToggle		: ( checked: boolean ) => void;
	onBack						: () => void;
	onCalculate					: () => void;
	isCalculating				: boolean;
}


export function SecondPlanning({
	section,
	sessionRequirements,
	sessionSpaces,
	sessionProfessors,
	sessionBuildings,
	sessionSpaceTypes,
	sessionSpaceSizes,
	sessionFilterModes,
	sessionInEnglish,
	useSameSpace,
	globalSpaceId,
	globalBuildingId,
	useSameProfessor,
	globalProfessorId,
	allInEnglish,
	onSpaceChange,
	onProfessorChange,
	onGlobalSpaceChange,
	onGlobalBuildingChange,
	onGlobalProfessorChange,
	onUseSameSpaceToggle,
	onUseSameProfessorToggle,
	onBuildingChange,
	onSpaceTypeChange,
	onSpaceSizeChange,
	onFilterModeChange,
	onInEnglishChange,
	onAllInEnglishToggle,
	onBack,
	onCalculate,
	isCalculating
}: Props ): JSX.Element {
	return (
		<div className="space-y-4">
			{/* Configuración de espacios */}
			<div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                        <Settings className="w-5 h-5" />

                        Configuración de espacios

                        <Cuboid className="w-5 h-5" />
                    </span>

                    <div className="flex items-center space-x-2" title="Usar los mismos espacios para todas las sesiones">
                        <Label htmlFor="use-same-space" className="cursor-pointer text-sm">
                            Espacios Globales
                        </Label>

                        <Switch
                            id				= "use-same-space"
                            checked			= { useSameSpace }
                            onCheckedChange = { onUseSameSpaceToggle }
                        />
                    </div>
                </div>


				{/* Configuración de espacios */}
				{useSameSpace ? (
					<div className="space-y-3">
						{/* Edificio Global */}
						<HeadquartersSelect
							label				= "Edificio Global"
							multiple			= { false }
							placeholder			= "Seleccionar edificio"
							defaultValues		= { globalBuildingId || undefined }
							onSelectionChange	= {( value ) => {
								const buildingId = typeof value === 'string' ? value : null;
								onGlobalBuildingChange( buildingId );
							}}
						/>

						{/* Filtros de espacio globales */}
						{ globalBuildingId && (
							<SpaceFilterSelector
								buildingId			= { globalBuildingId }
								filterMode			= { sessionFilterModes[Session.C] }
								spaceId				= { sessionSpaces[Session.C] }
								spaceType			= { sessionSpaceTypes[Session.C] }
								spaceSizeId			= { sessionSpaceSizes[Session.C] }
								spaceMultiple		= { true }
								onFilterModeChange	= {( mode ) => {
									// Aplicar a todas las sesiones
									Object.keys( sessionRequirements ).forEach( session => {
										onFilterModeChange( session as Session, mode );
									});
								}}
								onSpaceIdChange		= {( spaceIds ) => {
									const spaceIdsArray = Array.isArray( spaceIds ) ? spaceIds : ( spaceIds ? [spaceIds] : [] );
									// Aplicar a todas las sesiones
									Object.keys( sessionRequirements ).forEach( session => {
										onSpaceChange( session as Session, spaceIdsArray );
									});
								}}
								onSpaceTypeChange	= {( spaceType ) => {
									// Aplicar a todas las sesiones
									Object.keys( sessionRequirements ).forEach( session => {
										onSpaceTypeChange( session as Session, spaceType );
									});
								}}
								onSpaceSizeIdChange = {( spaceSizeId ) => {
									// Aplicar a todas las sesiones
									Object.keys( sessionRequirements ).forEach( session => {
										onSpaceSizeChange( session as Session, spaceSizeId );
									});
								}}
							/>
						)}
					</div>
				) : (
					<div className="space-y-4 max-h-96 overflow-y-auto">
						{Object.entries( sessionRequirements ).map(([ session, required ]) => {
							const sessionKey = session as Session;

							return (
								<Card key={ sessionKey } className="p-4 ">
									<Label className="text-sm font-semibold mb-2 block">
                                        <SessionType session={sessionKey} />
									</Label>

									<div className="space-y-3 ">
										{/* Edificio */}
										<HeadquartersSelect
											label				= "Edificio"
											multiple			= { false }
											placeholder			= "Seleccionar edificio"
											defaultValues		= { sessionBuildings[sessionKey] || undefined }
											onSelectionChange	= {( value ) => {
												const buildingId = typeof value === 'string' ? value : null;
												onBuildingChange( sessionKey, buildingId );
											}}
										/>

										{/* Filtros de espacio */}
										{ sessionBuildings[sessionKey] && (
											<SpaceFilterSelector
												buildingId			= { sessionBuildings[sessionKey] }
												filterMode			= { sessionFilterModes[sessionKey] }
												spaceId				= { sessionSpaces[sessionKey] }
												spaceType			= { sessionSpaceTypes[sessionKey] }
												spaceSizeId			= { sessionSpaceSizes[sessionKey] }
												spaceMultiple		= { true }
												onFilterModeChange	= {( mode ) => onFilterModeChange( sessionKey, mode )}
												onSpaceIdChange		= {( spaceId ) => {
													onSpaceChange( sessionKey, spaceId as string[] );
												}}
												onSpaceTypeChange	= {( spaceType ) => onSpaceTypeChange( sessionKey, spaceType )}
												onSpaceSizeIdChange = {( spaceSizeId ) => onSpaceSizeChange( sessionKey, spaceSizeId )}
											/>
										)}
									</div>
								</Card>
							);
						})}
					</div>
				)}
			</div>

            <hr className="my-4" />

			{/* Configuración de profesores */}
			<div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                        <Settings className="w-5 h-5" />
                        Configuración de profesores
                        <User className="w-5 h-5" />
                    </span>

                    <div className="flex items-center space-x-2" title="Usar los mismos profesores para todas las sesiones">
                        <Label htmlFor="use-same-professor" className="cursor-pointer text-sm">
                            Profesores Globales
                        </Label>

                        <Switch
                            id				= "use-same-professor"
                            checked			= { useSameProfessor }
                            onCheckedChange = { onUseSameProfessorToggle }
                        />
                    </div>
                </div>

				{useSameProfessor ? (
					<ProfessorSelect
						label				= "Profesores Globales"
						multiple			= { true }
						placeholder			= "Seleccionar profesores"
						defaultValues		= { globalProfessorId }
						onSelectionChange	= { onGlobalProfessorChange }
					/>
				) : (
					<div className={`grid ${getResponsive(section)} gap-4`}>
						{Object.entries( sessionRequirements ).map(([ session, required ]) => {
							const sessionKey = session as Session;

							return (
								<div key={ sessionKey } className="space-y-2">
                                    <label htmlFor="professors" className="flex items-center gap-1">
                                        <SessionType session={sessionKey} />
                                        <span className="text-sm font-medium">Profesores</span>
                                    </label>


									<ProfessorSelect
										// label				= {`Profesores para ${ sessionLabels[sessionKey] }`}
										multiple			= { true }
										placeholder			= "Seleccionar profesores"
										defaultValues		= { sessionProfessors[sessionKey] }
										onSelectionChange	= {( value ) => onProfessorChange( sessionKey, value )}
									/>
								</div>
							);
						})}
					</div>
				)}
			</div>

            <hr className="my-4" />


			{/* Configuración de inglés */}
			<div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                        <Settings className="w-5 h-5" />

                        Configuración de inglés

                        <Languages className="w-5 h-5" />
                    </span>

                    <div className="flex items-center space-x-2" title="Inglés para todas las sesiones">
                        <Label htmlFor="all-in-english" className="cursor-pointer text-sm">
                            En inglés Global
                        </Label>

                        <Switch
                            id				= "all-in-english"
                            checked			= { allInEnglish }
                            onCheckedChange = { onAllInEnglishToggle }
                        />
                    </div>
                </div>

				{!allInEnglish && (
					<div className={`grid ${getResponsive(section)} gap-4`}>
						{Object.entries( sessionRequirements ).map(([ session, required ]) => {
							const sessionKey = session as Session;

							return (
								<div key={ sessionKey } className="flex items-center space-x-2">
									<Switch
										id				= {`in-english-${sessionKey}`}
										checked			= { sessionInEnglish[sessionKey] }
										onCheckedChange = {( checked ) => onInEnglishChange( sessionKey, checked )}
									/>

									<Label htmlFor={`in-english-${sessionKey}`} className="cursor-pointer text-sm">
										{/* { sessionLabels[sessionKey] } en inglés */}
										<SessionType session={sessionKey} />
									</Label>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Botones de navegación */}
			<div className="flex justify-between">
				<Button
					variant	= "outline"
					onClick	= { onBack }
					disabled= { isCalculating }
				>
					Atrás
				</Button>

				<Button
					onClick	= { onCalculate }
					disabled= { isCalculating }
				>
					{ isCalculating ? 'Calculando...' : 'Calcular Disponibilidad' }
				</Button>
			</div>
		</div>
	);
}
