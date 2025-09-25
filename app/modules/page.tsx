'use client'

import React, { useEffect, useState } from 'react';

import { Plus }     from 'lucide-react';
import { toast }    from 'sonner';

import TableModules         from '@/app/modules/table-modules';
import ModuleDay            from '@/app/modules/module-day';
import { AddModuleModal }   from '@/app/modules/module-form';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                   from "@/components/ui/tabs";
import { Button }   from '@/components/ui/button';

import { useModulesOriginal }   from '@/hooks/use-modules-original';
import { useModules }           from '@/hooks/use-modules';

import { useDays }  from '@/hooks/use-days';
import { Day } from '@/types/day.model';


export default function ModulesPage() {
    const {
        data: modulesOriginal = [],
        isError: modulesOriginalError,
        error: modulesOriginalErrorMessage
    } = useModulesOriginal();

    const {
        data: modules = [],
        isError: modulesError,
        error: modulesErrorMessage
    } = useModules();

    const {
        data: days = [],
        isError: daysError,
        error: daysErrorMessage
    } = useDays();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const availableDays = days.map((day: Day) => Number(day.id) - 1);





    if (modulesOriginalError || modulesError || daysError) {
        return (
            <main className="container mx-auto py-10">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-destructive mb-2">Error al cargar datos</p>
                        <p className="text-muted-foreground text-sm">
                            { modulesOriginalErrorMessage?.message
                                || modulesErrorMessage?.message
                                || daysErrorMessage?.message
                            }
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="container mx-auto py-10">
            <header className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold tracking-tight">
                    Gestión de Módulos
                </h1>

                <Button 
                    onClick={ () => setIsModalOpen( true )} 
                    className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                >
                    <Plus className="h-5 w-5" />
                    Agregar Módulo
                </Button>
            </header>

            <Tabs defaultValue="table">
                <TabsList>
                    <TabsTrigger value="table">Tabla</TabsTrigger>

                    <TabsTrigger value="modules">Módulos</TabsTrigger>
                </TabsList>

                <TabsContent value="table">
                    <TableModules
                        modules = { modulesOriginal }
                        onSave  = { () => {} }
                        days    = { availableDays }
                    />
                </TabsContent>

                <TabsContent value="modules">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-6 h-full">
                        {days.map((day: Day, index: number) => (
                            <ModuleDay
                                key     = { day.id }
                                day     = { index + 1 }
                                days    = { days.map((d: Day) => d.name) }
                                modules = { modules }
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <AddModuleModal
                isOpen  = { isModalOpen }
                onClose = { () => setIsModalOpen( false )}
                days    = { availableDays }
            />
        </main>
    );
}
