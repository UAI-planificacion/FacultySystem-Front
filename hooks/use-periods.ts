import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { Period }       from "@/types/periods.model";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";


/**
 * Custom hook to fetch and format periods data
 * @returns Object containing periods data, loading state, error state, and helper function
 */
export function usePeriods() {
	const {
		data		: periods,
		isLoading	: isLoadingPeriods,
		isError		: isErrorPeriods
	} = useQuery<Period[]>({
		queryKey	: [KEY_QUERYS.PERIODS],
		queryFn		: () => fetchApi({ url: 'periods' }),
	});


	/**
	 * Get formatted period name by period ID
	 * @param periodId - The period ID to search for
	 * @returns Formatted period name (ID - Name) or empty string if not found
	 */
	const getPeriodName = useMemo(() => {
		return ( periodId: string | null ): string => {
			if ( !periodId || !periods ) return '';

			const period = periods.find( item => item.id === periodId );
			return period ? `${period.id} - ${period.name}` : '';
		};
	}, [periods]);


	return {
		periods,
		isLoadingPeriods,
		isErrorPeriods,
		getPeriodName
	};
}
