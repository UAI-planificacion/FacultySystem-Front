"use client"

import { useQuery } from '@tanstack/react-query';

import { Module } from '@/types/module.model';
import { KEY_QUERYS } from '@/consts/key-queries';
import { fetchApi } from '@/services/fetch';


const endpoint = 'modules';


export function useModules() {
    return useQuery({
        queryKey : [KEY_QUERYS.MODULES],
        queryFn  : () => fetchApi<Module[]>({ url: endpoint }),
    });
}

// Función para obtener los módulos de un día específico
export const getModulesForDay = (
    modules : Module[],
    dayId   : number
): Module[] => modules
    .filter(( module: Module ) => module.dayId === dayId )
    .sort(( a: Module, b: Module ) => a.order - b.order );
