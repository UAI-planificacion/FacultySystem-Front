'use client'

import { JSX, useMemo } from "react";

import { Label }                from "@/components/ui/label";
import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Props }                from "@/components/shared/item-select/select-props";

import { BuildingEnum }     from "@/types/request-detail.model";
import { getBuildingName }  from "@/lib/utils";


export function BuildingSelect({
	defaultValues,
	onSelectionChange,
	label,
	multiple        = false,
	placeholder     = 'Selecciona un edificio',
	disabled        = false,
	className
} : Props ): JSX.Element {

	const buildingOptions = useMemo(() => {
		const options = Object.values( BuildingEnum ).map(( building ) => ({
			id      : building,
			label   : getBuildingName( building ),
			value   : building
		}));

		return options;
	}, []);


	return (
		<div className={`space-y-2 ${className}`}>
			{ label && <Label htmlFor="building">{ label }</Label> }

			<MultiSelectCombobox
				options             = { buildingOptions }
				defaultValues       = { defaultValues }
				onSelectionChange   = { onSelectionChange }
				placeholder         = { placeholder }
				disabled            = { disabled }
				multiple            = { multiple }
			/>
		</div>
	);
}
