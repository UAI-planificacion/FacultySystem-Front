'use client'

import { JSX } from 'react';

import { Calendar } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                   from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';

import ModuleCard   from '@/app/modules/ModuleCard';
import { Module } from '@/types/module.model';


export default function ModuleDay({
    day,
    days,
    modules
}: {
    day     : number,
    days    : string[],
    modules : Module[]
}): JSX.Element {
    const getModulesForDay = ( dayId: number ) => modules
        .filter( module => module.dayId === dayId )
        .sort(( a, b ) => a.order - b.order );


    const dayModules = getModulesForDay( day );


    return (
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
                    {days[day - 1]}

                    <Badge variant="outline" className="ml-2">
                        {dayModules.length} módulos
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-2 h-[30rem] overflow-y-auto">
                {dayModules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
                        <Calendar className="h-12 w-12 mb-3 opacity-50" />

                        <p className="text-sm font-medium">No hay módulos</p>

                        <p className="text-xs opacity-70">programados para este día</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {dayModules.map( module => (
                            <ModuleCard
                                key     = { module.id }
                                module  = { module }
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
