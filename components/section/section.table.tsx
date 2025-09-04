'use client'

import { Trash2 } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
}                               from "@/components/ui/table";
import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Button }               from "@/components/ui/button";
import { Input }                from "@/components/ui/input";
import { SessionButton }        from "@/components/section/session-button";

import { SectionData, Session } from "@/types/section.model";
import { Props, sessionColors } from "./section.config";



export function SectionTable({
    section: sections,
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
    sections = sections as SectionData[];

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Sección</TableHead>

                        <TableHead className="min-w-[250px]">Período</TableHead>

                        <TableHead className="min-w-[120px]">
                            <div className="flex gap-2 items-center">
                                <div className={`w-3 h-3 rounded-full ${sessionColors[Session.C]}`} />
                                Cátedra
                            </div>
                        </TableHead>

                        <TableHead className="min-w-[120px]">
                            <div className="flex gap-2 items-center">
                                <div className={`w-3 h-3 rounded-full ${sessionColors[Session.A]}`} />
                                Ayudantía
                            </div>
                        </TableHead>

                        <TableHead className="min-w-[120px]">
                            <div className="flex gap-2 items-center">
                                <div className={`w-3 h-3 rounded-full ${sessionColors[Session.T]}`} />
                                Taller
                            </div>
                        </TableHead>

                        <TableHead className="min-w-[120px]">
                            <div className="flex gap-2 items-center">
                                <div className={`w-3 h-3 rounded-full ${sessionColors[Session.L]}`} />
                                Laboratorio
                            </div>
                        </TableHead>

                        <TableHead className="w-[80px]">Acciones</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {sections.map((section) => (
                        <TableRow key={section.id}>
                            {/* Número de Sección */}
                            <TableCell>
                                <Input
                                    type        = "number"
                                    min         = "1"
                                    max         = "200"
                                    value       = { section.sectionNumber }
                                    className   = "w-16 h-8 text-center"
                                    onChange    = {( e ) => updateSectionNumber( section.id, parseInt( e.target.value ) || 1 )}
                                />
                            </TableCell>

                            {/* Período */}
                            <TableCell>
                                {isErrorPeriods ? (
                                    <div className="space-y-1">
                                        <Input
                                            placeholder = "ID del período"
                                            onChange    = {( event ) => updateSectionPeriod( section.id, event.target.value )}
                                            className   = "h-8"
                                        />

                                        <span className="text-xs text-muted-foreground">
                                            Error al cargar los períodos. Ingrese el ID manualmente.
                                        </span>
                                    </div>
                                ) : (
                                    <MultiSelectCombobox
                                        multiple            = { false }
                                        placeholder         = "Seleccionar período"
                                        defaultValues       = { section.period || '' }
                                        onSelectionChange   = {( value ) => updateSectionPeriod( section.id, value as string )}
                                        options             = { getAvailablePeriodsForSection( section.id )}
                                        isLoading           = { isLoadingPeriods }
                                    />
                                )}
                            </TableCell>

                            {/* Sesiones */}
                            {Object.entries(Session).map(([_, session]) => (
                                <TableCell key={session} className="p-2">
                                    <SessionButton
                                        session             = { session }
                                        updateSessionCount  = { updateSessionCount }
                                        setSessionCount     = { setSessionCount }
                                        section             = { section }
                                        showLabel           = { false }
                                    />
                                </TableCell>
                            ))}

                            {/* Acciones */}
                            <TableCell>
                                <Button
                                    variant     = "destructive"
                                    size        = "sm"
                                    onClick     = {() => removeSection( section.id )}
                                    disabled    = { removeDisabled }
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
