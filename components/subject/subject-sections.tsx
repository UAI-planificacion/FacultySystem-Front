'use client';

import React, { useState, useMemo } from 'react';

import { Plus, Save, Trash2, BrushCleaning } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                           from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                           from '@/components/ui/select';
import { Button }           from '@/components/ui/button';
import { Label }            from '@/components/ui/label';
import { SessionButton }    from '@/components/section/session-button';
import { SectionTable }     from '@/components/section/secction-table';

import { Session, SectionToCreate, SectionData } from '@/types/section.model';


const periods = [
    '4008-Semestre 1',
    '4014-Trimestre 2',
    '7002-Semestre 1',
    '4024-Semestre 2',
    '5001-Trimestre 1',
];


const emptySection : SectionData = {
    id              : Math.random().toString(36).substring(2),
    period          : '',
    sessionCounts   : {
        [Session.C]: 0,
        [Session.A]: 0,
        [Session.T]: 0,
        [Session.L]: 0,
    },
}


export default function SectionCreator() {
    const [sections, setSections] = useState<SectionData[]>([ emptySection ]);

    const newSection = {
        ...emptySection,
        id: Math.random().toString( 36 ).substring( 2 )
    };

    const addSection = () => {
        setSections( prev => [ ...prev, newSection ]);
    };


    const removeSection = ( sectionId: string ) => {
        setSections( prev => prev.filter( section => section.id !== sectionId ));
    };


    const updateSectionPeriod = ( sectionId: string, period: string ) => {
        setSections( prev => prev.map( section =>
            section.id === sectionId 
            ? { ...section, period }
            : section
        ));
    };


    const updateSessionCount = ( sectionId: string, session: Session, delta: number ) => {
        setSections(prev => prev.map(section => 
            section.id === sectionId 
            ? {
                ...section,
                sessionCounts: {
                ...section.sessionCounts,
                [session]: Math.max(0, section.sessionCounts[session] + delta)
                }
            }
            : section
        ));
    };


    const setSessionCount = ( sectionId: string, session: Session, value: string ) => {
        const count = parseInt( value ) || 0;

        setSections( prev => prev.map( section =>
            section.id === sectionId 
            ? {
                ...section,
                sessionCounts: {
                    ...section.sessionCounts,
                    [session]: Math.max(0, count)
                }
            }
            : section
        ));
    };


    const generatedSections = useMemo(() => {
        const result: SectionToCreate[] = [];

        sections.forEach(section => {
            if ( !section.period ) return;

            Object.entries( section.sessionCounts ).forEach(([ session, count ]) => {
                for ( let i = 0; i < count; i++ ) {
                    result.push({
                        period  : section.period.split('-')[0],
                        session : session as Session,
                    });
                }
            });
        });

        return result;
    }, [sections]);


    const handleSave = () => {
        if ( generatedSections.length === 0 ) {
            return;
        }

        console.log('Secciones generadas:', generatedSections);
    };

    return (
        <>
            <Card className="h-[calc(100vh-220px)]">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Creador de Secciones Académicas
                        </div>

                        <Button
                            onClick={addSection}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Agregar Sección
                        </Button>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {sections.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />

                            <p className="text-lg mb-2">No hay secciones creadas</p>

                            <p className="text-sm">Haz clic en "Agregar Sección" para comenzar</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-4 h-[calc(100vh-400px)] overflow-auto">
                                {sections.map((section, index) => (
                                    <Card key={section.id} className="border-2 hover:shadow-lg transition-all duration-200">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">
                                                    Sección {index + 1}
                                                </CardTitle>

                                                <Button
                                                    variant     = "destructive"
                                                    size        = "icon"
                                                    onClick     = {() => removeSection( section.id )}
                                                    disabled    = { sections.length === 1 }
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {/* Selector de período para esta sección */}
                                            <div className="space-y-2">
                                                <Label>Período para esta sección</Label>

                                                <Select 
                                                    value           = { section.period }
                                                    onValueChange   = {( value ) => updateSectionPeriod( section.id, value )}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un período" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {periods.map((period) => (
                                                            <SelectItem key={period} value={period}>
                                                                {period}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Contadores de sesiones */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium">Cantidad por tipo de sesión</Label>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {Object.entries(Session).map(([key, session]) => (
                                                        <SessionButton
                                                            session             = { session }
                                                            updateSessionCount  = { updateSessionCount }
                                                            setSessionCount     = { setSessionCount }
                                                            section             = { section }
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">
                                        Secciones a Crear
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <SectionTable generatedSections={ generatedSections }/>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Botones de acción */}
                    {sections.length > 0 && (
                        <div className="flex justify-between gap-4">
                            <Button
                                onClick     = { () => setSections([emptySection])}
                                disabled    = { generatedSections.length === 0 }
                                className   = "flex items-center gap-2"
                                variant     = "destructive"
                            >
                                <BrushCleaning className="h-4 w-4" />

                                Limpiar Secciones
                            </Button>

                            <Button
                                onClick     = { handleSave }
                                disabled    = { generatedSections.length === 0 }
                                className   = "flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Crear Secciones ({ generatedSections.length })
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
