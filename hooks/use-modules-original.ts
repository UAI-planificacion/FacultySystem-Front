"use client"

import { useQuery } from '@tanstack/react-query';

import { ModuleOriginal } from '@/types/module.model';
import { KEY_QUERYS } from '@/consts/key-queries';
import { fetchApi } from '@/services/fetch';


const endpoint = 'modules/original';


export function useModulesOriginal() {
    return useQuery({
        queryKey : [KEY_QUERYS.MODULES_ORIGINAL],
        queryFn  : () => fetchApi<ModuleOriginal[]>({ url: endpoint }),
    });
}
