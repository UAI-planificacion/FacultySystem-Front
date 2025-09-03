'use client'

import { Trash2 } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader
}                               from "@/components/ui/card";
import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Button }               from "@/components/ui/button";
import { Input }                from "@/components/ui/input";
import { Label }                from "@/components/ui/label";
import { SessionButton }        from "@/components/section/session-button";

import { SectionData, Session } from "@/types/section.model";
import { Props } from "./section.config";


export function SectionCard({
    section,
    updateSectionNumber,
    removeSection,
    removeDisabled,
    isErrorPeriods,
    updateSectionPeriod,
    getAvailablePeriodsForSection,
    isLoadingPeriods,
    updateSessionCount,
    setSessionCount
}: Props ) {
    section = section as SectionData;

    return (
        <Card key={section.id} className="border-2 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Label className="text-lg font-semibold">Sección</Label>

                        <Input
                            type        = "number"
                            min         = "1"
                            max         = "200"
                            value       = { section.sectionNumber }
                            onChange    = {( e ) => {
                                const newNumber = parseInt( e.target.value ) || 1;
                                updateSectionNumber( section.id, newNumber );
                            }}
                            className   = "w-20 h-8 text-center"
                        />
                    </div>

                    <Button
                        variant     = "destructive"
                        size        = "icon"
                        onClick     = {() => removeSection( section.id )}
                        disabled    = { removeDisabled }
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Selector de período para esta sección */}
                <div className="space-y-2">
                    <Label>Período para esta sección</Label>

                    { isErrorPeriods ? (
                        <>
                            <Input
                                placeholder = "ID del período"
                                onChange    = {(event) => updateSectionPeriod( section.id, event.target.value )}
                            />

                            <span className='text-sm text-foreground'>
                                Error al cargar los períodos. Ingrese el ID manualmente.
                            </span>
                        </>
                    ) : (
                        <MultiSelectCombobox
                            multiple            = { false }
                            placeholder         = "Seleccionar un período"
                            defaultValues       = { section.period || '' }
                            onSelectionChange   = {( value ) => updateSectionPeriod( section.id, value as string )}
                            options             = { getAvailablePeriodsForSection( section.id ) }
                            isLoading           = { isLoadingPeriods }
                        />
                    )}
                </div>

                {/* Contadores de sesiones */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Cantidad por tipo de sesión</Label>

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
                        {Object.entries( Session ).map(([_, session]) => (
                            <SessionButton
                                session             = { session }
                                updateSessionCount  = { updateSessionCount }
                                setSessionCount     = { setSessionCount }
                                section             = { section }
                                showLabel           = { true }
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
