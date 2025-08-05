import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { CostCenter }   from "@/types/cost-center.model";
import { Option }       from "@/components/shared/Combobox";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { mockFetchCostCenters } from "@/data/cost-center.data";


// Function to transform cost center data to options format
export const memoizedCostCenterData = (
	costCenterData : CostCenter[] | undefined
): Option[] => useMemo(() => {
	return costCenterData?.map( costCenter => ({
		id		: costCenter.centro_costo,
		label	: costCenter.NombreCompuesto,
		value	: costCenter.centro_costo,
	})) ?? [];
}, [costCenterData]);


// Interface for hook parameters
interface UseCostCenterParams {
	enabled? : boolean;
    useMockData?: boolean;
}


// Interface for hook return values
interface UseCostCenterReturn {
	costCenter  : Option[];
	isLoading	: boolean;
	isError		: boolean;
	error		: Error | null;
}


/**
 * Custom hook to fetch and manage cost center data
 * @param params - Configuration parameters for the hook
 * @returns Transformed cost center data, loading state, and error information
 */
export const useCostCenter = ( 
	params : UseCostCenterParams = {} 
): UseCostCenterReturn => {
	const { enabled = true, useMockData = true } = params;

	const {
		data		: costCenterData,
		isLoading	: isLoadingCostCenter,
		isError		: isErrorCostCenter,
		error		: errorCostCenter
	} = useQuery<CostCenter[]>({
		queryKey	: [KEY_QUERYS.COST_CENTERS],
		// queryFn		: () => fetchApi({ isApi: false, url: `cost-centers/all` }),
        queryFn: useMockData 
            ? mockFetchCostCenters
            : () => fetchApi({ isApi: false, url: `cost-centers/all` }),
		enabled,
	});

	// Transform the data using memoized function
	const costCenterOptions = memoizedCostCenterData( costCenterData );

	return {
		costCenter: costCenterOptions,
		isLoading	: isLoadingCostCenter,
		isError		: isErrorCostCenter,
		error		: errorCostCenter,
	};
};
