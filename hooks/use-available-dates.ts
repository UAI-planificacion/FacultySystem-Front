import { useQuery } from '@tanstack/react-query';

import { fetchApi }     from '@/services/fetch';
import { KEY_QUERYS }   from '@/consts/key-queries';


interface UseAvailableDatesParams {
	sectionId       : string | null;
	dayModuleId     : number | null;
	spaceId         : string | null | undefined;
	enabled?        : boolean;
}


/**
 * Hook to fetch available dates for a specific session, day-module, and space combination
 */
export function useAvailableDates({ sectionId, dayModuleId, spaceId, enabled = true }: UseAvailableDatesParams ) {
	return useQuery({
		queryKey    : [ KEY_QUERYS.AVAILABLE_DATES, sectionId, dayModuleId, spaceId ],
		queryFn     : async () => {
			const dates = await fetchApi<string[]>({
				url : `sessions/availables/${sectionId}/${dayModuleId}/${spaceId}`
			});

            if ( !dates ) return [];

			return dates.map( dateStr => new Date( dateStr ));
		},
		enabled     : enabled && !!sectionId && !!dayModuleId && !!spaceId,
		staleTime   : 1000 * 60 * 5, // 5 minutes
	});
}
