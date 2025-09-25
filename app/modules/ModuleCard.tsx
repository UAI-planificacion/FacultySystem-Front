'use client'

import { JSX } from 'react';

import { Clock, Hash } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import { Module } from '@/types/module.model';


export default function ModuleCard(
    { module}: { module: Module }
): JSX.Element {
    return (
        <Card
            key={module.id}
            className="group relative bg-card rounded-xl pt-3 border hover:bg-accent/50 hover:shadow-md transition-all duration-200"
        >
            <CardContent className="flex-1 items-start w-full space-y-1">
                <div className='flex items-center justify-between'>
                    <h3 className="font-bold text-lg font-mono tracking-wide">
                        {module.name}
                    </h3>

                    <div className={`w-3 h-3 rounded-full ${
                        module.isActive ? 'bg-green-500 shadow-lg' : 'bg-muted-foreground/50'
                    }`} />
                </div>

                <div className="flex items-center gap-2 text-sm justify-between">
                    <div className='flex items-center gap-1'>
                        <Clock className="h-4 w-4 text-primary" />

                        <span className="font-semibold">
                            {module.startHour} - {module.endHour}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Hash className="h-4 w-4 text-primary" />

                        <span className="text-muted-foreground">Código:</span>

                        <span className="font-mono bg-muted px-2 py-1 rounded-md font-semibold">
                            {module.code}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span className="bg-muted px-2 py-1 rounded-md font-mono text-sm">
                        Orden: {module.order}
                    </span>

                    <span className="text-sm text-muted-foreground">Diferencia:</span>

                    <span className="font-mono bg-muted px-2 py-1 rounded-md font-bold">
                        {module.difference ?? '-'}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
