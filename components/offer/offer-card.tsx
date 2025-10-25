'use client'

import { Trash2 } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader
}                           from "@/components/ui/card";
import { Button }           from "@/components/ui/button";
import { Input }            from "@/components/ui/input";
import { Label }            from "@/components/ui/label";
import { SessionButton }    from "@/components/session/session-button";
import { PeriodSelect }     from "@/components/shared/item-select/period-select";
import { Props }            from "../section/section.config";

import { SectionData, Session } from "@/types/section.model";


export function OfferCard({
    section,
    updateSectionNumber,
    removeSection,
    removeDisabled,
    updateSectionPeriod,
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
                                // updateSectionNumber( section.id, newNumber );
                            }}
                            className   = "w-20 h-8 text-center"
                        />
                    </div>

                    <Button
                        variant     = "destructive"
                        size        = "icon"
                        // onClick     = {() => removeSection( section.id )}
                        onClick     = {() => {}}
                        disabled    = { removeDisabled }
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <PeriodSelect
                    placeholder         = "Seleccionar un período"
                    defaultValues       = { section.period || '' }
                    // onSelectionChange   = {( value ) => updateSectionPeriod( section.id, value as string )}
                    onSelectionChange   = {( value ) => {}}
                    multiple            = { false }
                />

                <div className="space-y-3">
                    <Label className="text-sm font-medium">Cantidad por tipo de sesión</Label>

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
                        {/* {Object.entries( Session ).map(([_, session], index) => (
                            <SessionButton
                                key                 = { `${section.id}-${index}` }
                                session             = { session }
                                updateSessionCount  = { updateSessionCount }
                                setSessionCount     = { setSessionCount }
                                section             = { null}
                                showLabel           = { true }
                            />
                        ))} */}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
