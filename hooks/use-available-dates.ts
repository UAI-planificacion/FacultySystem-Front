import { useQuery } from '@tanstack/react-query';

import { Method, fetchApi } from '@/services/fetch';
import { KEY_QUERYS }       from '@/consts/key-queries';


interface Props {
	sessionId       : string | null;
	dayModuleId     : number | null;
	spaceId         : string | null;
	enabled?        : boolean;
    professorId?    : string | null;
}

/**
 * Hook to fetch available dates for a specific session, day-module, and space combination
 */
export function useAvailableDates({
    sessionId,
    dayModuleId,
    spaceId,
    professorId,
    enabled = true
}: Props ) {
	return useQuery({
		queryKey    : [ KEY_QUERYS.AVAILABLE_DATES, sessionId, dayModuleId, spaceId, professorId ],
		queryFn     : async () => {
			const dates = await fetchApi<string[]>({
                method : Method.POST,
                url : `sessions/availables`,
                body : {
                    sessionId,
                    dayModuleId,
                    spaceId,
                    professorId
                }
			});

            if ( !dates ) return [];

			return dates.map( dateStr => new Date( dateStr ));
		},
		enabled     : enabled && !!sessionId && !!dayModuleId && !!spaceId,
		staleTime   : 1000 * 60 * 5, // 5 minutes
	});
}
