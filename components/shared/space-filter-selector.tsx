"use client"

import { JSX, useEffect } from "react"

import { Checkbox }         from "@/components/ui/checkbox";
import { SpaceSelect }      from "@/components/shared/item-select/space-select";
import { SizeSelect }       from "@/components/shared/item-select/size-select";
import { SpaceTypeSelect }  from "@/components/shared/item-select/space-type-select";

import { SpaceType } from "@/types/request-detail.model";
import { SPACE_TYPES_WITH_SIZE_FILTER } from "@/lib/utils";


export type FilterMode = 'space' | 'type-size';


interface Props {
	buildingId          : string | null;
	filterMode          : FilterMode;
	spaceId             : string | string[] | null;
	spaceType           : string | null;
	spaceSizeId         : string | null;
	onFilterModeChange  : ( mode: FilterMode )              => void;
	onSpaceIdChange     : ( spaceId: string | string[] | null )        => void;
	onSpaceTypeChange   : ( spaceType: string | null )      => void;
	onSpaceSizeIdChange : ( spaceSizeId: string | null )    => void;
    spaceMultiple?       : boolean;
}


/**
 * SpaceFilterSelector Component
 * 
 * Allows filtering spaces by:
 * - Specific space (exclusive)
 * - Space type and/or size (can select both or just one)
 * 
 * Size filtering is only enabled when:
 * 1. Filter mode is 'type-size'
 * 2. A space type is selected
 * 3. The selected space type is in the whitelist (SPACE_TYPES_WITH_SIZE_FILTER)
 */
export function SpaceFilterSelector({
	buildingId,
	filterMode,
	spaceId,
	spaceType,
	spaceSizeId,
	onFilterModeChange,
	onSpaceIdChange,
	onSpaceTypeChange,
	onSpaceSizeIdChange,
    spaceMultiple = false
}: Props ): JSX.Element {
	// Check if size filter should be enabled
	const isSizeFilterEnabled = filterMode === 'type-size' && 
		spaceType !== null && 
		SPACE_TYPES_WITH_SIZE_FILTER.includes( spaceType as SpaceType );

	// Clear size when type changes and size is not allowed
	useEffect(() => {
		if ( !isSizeFilterEnabled && spaceSizeId !== null ) {
			onSpaceSizeIdChange( null );
		}
	}, [ isSizeFilterEnabled, spaceSizeId, onSpaceSizeIdChange ]);

	// Handle filter mode change
	const handleFilterModeChange = ( mode: FilterMode ) => {
		onFilterModeChange( mode );

		// Clear filters based on mode
		if ( mode === 'space' ) {
			onSpaceTypeChange( null );
			onSpaceSizeIdChange( null );
		} else {
			onSpaceIdChange( null );
		}
	};


	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			{/* Espacio Específico */}
			<div className="flex gap-2 items-end">
				<Checkbox
					className       = "cursor-default rounded-full p-[0.6rem] flex justify-center items-center mb-2"
					checked         = { filterMode === 'space' }
					onCheckedChange = {( checked ) => { if ( checked ) handleFilterModeChange( 'space' )}}
				/>

				<div className="w-full">
					<SpaceSelect
						label               = "Espacio Específico"
						multiple            = { spaceMultiple }
						placeholder         = "Seleccionar espacio"
						defaultValues       = { spaceId || undefined }
                        buildingFilter      = { buildingId || undefined }
                        disabled            = { filterMode !== 'space' }
						onSelectionChange   = {( value ) => {
							if ( spaceMultiple ) {
								const spaceIds = Array.isArray( value ) ? value : ( value ? [value] : null );
								onSpaceIdChange( spaceIds );
							} else {
								const newSpaceId = typeof value === 'string' ? value : null;
								onSpaceIdChange( newSpaceId );
							}
						}}
					/>
				</div>
			</div>

			{/* Tipo de Espacio */}
			<div className="flex gap-2 items-end">
				<Checkbox
					className       = "cursor-default rounded-full p-[0.6rem] flex justify-center items-center mb-2"
					checked         = { filterMode === 'type-size' }
					onCheckedChange = {( checked ) => { if ( checked ) handleFilterModeChange( 'type-size' )}}
				/>

				<div className="w-full">
					<SpaceTypeSelect
						label               = "Tipo de Espacio"
						multiple            = { false }
						placeholder         = "Seleccionar tipo"
						defaultValues       = { spaceType || undefined }
                        buildingFilter      = { buildingId || undefined }
                        disabled            = { filterMode !== 'type-size' }
						onSelectionChange   = {( value ) => {
							const newSpaceType = ( typeof value === 'string' && value !== 'none' ) ? value : null;
							onSpaceTypeChange( newSpaceType );
						}}
					/>
				</div>
			</div>

			{/* Tamaño */}
			<div className="flex gap-2 items-end">
				<div className="w-full">
					<SizeSelect
						label               = "Tamaño"
						multiple            = { false }
						placeholder         = "Seleccionar tamaño"
						defaultValues       = { spaceSizeId || undefined }
                        buildingFilter      = { buildingId  || undefined }
                        spaceTypeFilter     = { spaceType   || undefined }
                        disabled            = { !isSizeFilterEnabled }
						onSelectionChange   = {( value ) => {
							const newSizeId = typeof value === 'string' ? value : null;
							onSpaceSizeIdChange( newSizeId );
						}}
					/>
				</div>
			</div>
		</div>
	);
}
