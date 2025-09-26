"use client"

import { useQuery } from '@tanstack/react-query';

import { Size } from '@/types/size.model';
import { KEY_QUERYS } from '@/consts/key-queries';
import { fetchApi } from '@/services/fetch';


const endpoint = 'sizes';


export function useSizes() {
	return useQuery({
		queryKey : [KEY_QUERYS.SIZES],
		queryFn  : () => fetchApi<Size[]>({ url: endpoint }),
	});
}
