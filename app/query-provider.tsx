"use client"

import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools }               from '@tanstack/react-query-devtools';


interface QueryProviderProps {
    children: React.ReactNode
}


export function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Tiempo de cache por defecto
                staleTime               : 1000 * 60 * 5,        // 5 minutos
                // Tiempo antes de garbage collection
                gcTime                  : 1000 * 60 * 60,       // 1 hora
                // Reintentos en caso de error
                retry                   : 1,
                // NO refetch automático - mantener caché estable
                refetchOnWindowFocus    : false,
                refetchOnMount          : false,
                refetchOnReconnect      : false,
            },
            mutations: {
                // Reintentos para mutaciones
                retry: 1,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            {children}

            <ReactQueryDevtools 
                initialIsOpen={false}
            />
        </QueryClientProvider>
    )
}
