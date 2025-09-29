'use client'

import React, { useState } from 'react';

import { Plus } from 'lucide-react';

import TableModules         from '@/app/modules/table-modules';
import ModuleDay            from '@/app/modules/module-day';
import { AddModuleModal }   from '@/app/modules/module-form';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                       from "@/components/ui/tabs";
import { Button }       from '@/components/ui/button';
import { PageLayout }   from '@/components/layout/page-layout';

import { useModulesOriginal }   from '@/hooks/use-modules-original';
import { useModules }           from '@/hooks/use-modules';
import { useDays }              from '@/hooks/use-days';

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
            <PageLayout title="Gestión de Módulos">
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
            </PageLayout>
        );
    }

    return (
        <PageLayout 
            title="Gestión de Módulos"
            actions={
                <Button 
                    onClick     = { () => setIsModalOpen( true )} 
                    className   = "flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />

                    Agregar Módulo
                </Button>
            }
        >

            <Tabs defaultValue="modules" className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-2 mb-2">
                    <TabsTrigger value="modules">Módulos</TabsTrigger>
                    <TabsTrigger value="byDays">Módulos por Día</TabsTrigger>
                </TabsList>

                <TabsContent value="modules" className="flex-1 overflow-hidden">
                    <TableModules
                        modules = { modulesOriginal }
                        onSave  = { () => {} }
                        days    = { availableDays }
                    />
                </TabsContent>

                <TabsContent value="byDays" className="flex-1 overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-4 h-full">
                        { days.map(( day: Day, index: number ) => (
                            <ModuleDay
                                key     = { day.id }
                                day     = { index + 1 }
                                days    = { days.map(( d: Day ) => d.name) }
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
                modules = { modulesOriginal }
            />
        </PageLayout>
    );
}
