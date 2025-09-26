import { useQuery } from '@tanstack/react-query';

import { Day } from '@/types/day.model';
import { KEY_QUERYS } from '@/consts/key-queries';
import { fetchApi } from '@/services/fetch';


const endpoint = 'days';


export function useDays() {
    return useQuery({
        queryKey : [KEY_QUERYS.DAYS],
        queryFn  : () => fetchApi<Day[]>({ url: endpoint }),
    });
}
