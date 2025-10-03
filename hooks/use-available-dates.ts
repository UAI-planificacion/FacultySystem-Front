import { useQuery } from '@tanstack/react-query';

import { fetchApi }     from '@/services/fetch';
import { KEY_QUERYS }   from '@/consts/key-queries';


interface UseAvailableDatesParams {
	sessionId       : string | null;
	dayModuleId     : number | null;
	spaceId         : string | null | undefined;
	enabled?        : boolean;
}


/**
 * Hook to fetch available dates for a specific session, day-module, and space combination
 */
export function useAvailableDates({ sessionId, dayModuleId, spaceId, enabled = true }: UseAvailableDatesParams ) {
	return useQuery({
		queryKey    : [ KEY_QUERYS.AVAILABLE_DATES, sessionId, dayModuleId, spaceId ],
		queryFn     : async () => {
			if ( !sessionId || !dayModuleId || !spaceId ) {
				return [];
			}

			const dates = await fetchApi<string[]>({
				url : `sessions/availables/${sessionId}/${dayModuleId}/${spaceId}`
			});

			// Parse string dates to Date objects
			return dates.map( dateStr => new Date( dateStr ));
		},
		enabled     : enabled && !!sessionId && !!dayModuleId && !!spaceId,
		staleTime   : 1000 * 60 * 5, // 5 minutes
	});
}
