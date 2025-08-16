'use client'

import { JSX } from "react";

import { HeadquartersEnum } from "@/types/grade"
import { Badge }            from "@/components/ui/badge";


const getHearquarterName = ( headquarter: HeadquartersEnum ) => ({
    [HeadquartersEnum.ERRAZURIZ]    : 'Errázuriz',
    [HeadquartersEnum.PENALOLEN]    : 'Peñalolén',
    [HeadquartersEnum.VINADELMAR]   : 'Viña del Mar',
    [HeadquartersEnum.VITACURA]     : 'Vitacura',
})[headquarter] || "Errázuriz";



interface HeadquarterProps {
    name: HeadquartersEnum;
}


export function Headquarter({
    name
}: HeadquarterProps ): JSX.Element {
    return (
        <Badge variant={'secondary'}>
            { getHearquarterName( name ) }
        </Badge>
    )
}
