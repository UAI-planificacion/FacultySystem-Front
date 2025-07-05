"use client"

import { useQuery } from '@tanstack/react-query';

import { ENV } from '@/config/envs/env';


async function fetchData<T>( endpoint: string ): Promise<T[]> {
    const API_URL   = `${ENV.REQUEST_BACK_URL}${endpoint}`;
    const response  = await fetch( API_URL );

    return response.json();
}


export interface UseDataResult<T> {
    data        : T[];
    isLoading   : boolean;
    error       : Error | null;
    isError     : boolean;
    refetch     : () => void;
}


export function useData<T>( key : string, endpoint: string ): UseDataResult<T> {
    const {
        data = [],
        isLoading,
        error,
        isError,
        refetch
    } = useQuery({
        queryKey    : [ key ],
        queryFn     : () => fetchData<T>( endpoint ),
    });

    return {
        data,
        isLoading,
        error,
        isError,
        refetch
    };
}
