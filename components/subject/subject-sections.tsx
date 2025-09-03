'use client';

import React, { useState, useMemo } from 'react';

import {
    Plus,
    Save,
    Trash2,
    BrushCleaning
}                   from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                               from '@/components/ui/card';
import { Button }               from '@/components/ui/button';
import { Label }                from '@/components/ui/label';
import { SessionButton }        from '@/components/section/session-button';
import { MultiSelectCombobox }  from '@/components/shared/Combobox';
import { Input }                from '@/components/ui/input';

import {
    Session,
    SectionToCreate,
    SectionData
}                       from '@/types/section.model';
import { Period }       from '@/types/periods.model';
import { KEY_QUERYS }   from '@/consts/key-queries';
import { fetchApi }     from '@/services/fetch';
import { ENV }          from '@/config/envs/env';


const emptySection : SectionData = {
    id              : Math.random().toString(36).substring(2),
    period          : '',
    sectionNumber   : 1,
    isNew : true,
    sessionCounts   : {
        [Session.C]: 0,
        [Session.A]: 0,
        [Session.T]: 0,
        [Session.L]: 0,
    },
}
import { format }       from "@formkit/tempo";

interface Props {
    subjectId: string;
}
function formatDate( period : Period ) {
    if ( !period.startDate || !period.endDate ) return '';

    return ` (${format( period.startDate, 'short' )} - ${format( period.endDate, 'short' )})`;
}


export function SectionCreator({
    subjectId
}: Props ) {
    const {
        data        : periods,
        isLoading   : isLoadingPeriods,
        isError     : isErrorPeriods
    } = useQuery<Period[]>({
        queryKey: [KEY_QUERYS.PERIODS],
        queryFn: () => fetchApi({ isApi: false, url: `${ENV.ACADEMIC_SECTION}periods` }),
    });

    const memoizedPeriods = useMemo(() => {
        return periods?.map( period => ({
            id      : period.id,
            label   : `${period.id} - ${ period.name }${ formatDate( period )}`,
            value   : period.id
        }) ) ?? [];
    }, [periods]);


    const getAvailablePeriodsForSection = ( currentSectionId: string ) => {
        const selectedPeriods = sections
            .filter( section => section.id !== currentSectionId && section.period )
            .map( section => section.period );

        return memoizedPeriods.filter( period => !selectedPeriods.includes( period.value ));
    };

    const [sections, setSections] = useState<SectionData[]>([ emptySection ]);

    // Get the next available section number
    const getNextAvailableSectionNumber = () => {
        const usedNumbers = sections.map( section => section.sectionNumber ).sort( ( a, b ) => a - b );
        
        for ( let i = 1; i <= usedNumbers.length + 1; i++ ) {
            if ( !usedNumbers.includes( i ) ) {
                return i;
            }
        }
        
        return usedNumbers.length + 1;
    };

    // Get closest available number when there's a conflict
    const getClosestAvailableNumber = ( targetNumber: number, excludeId?: string ) => {
        const usedNumbers = sections
            .filter( section => excludeId ? section.id !== excludeId : true )
            .map( section => section.sectionNumber );
        
        if ( !usedNumbers.includes( targetNumber ) ) {
            return targetNumber;
        }
        
        // Find closest available number
        for ( let offset = 1; offset <= sections.length + 1; offset++ ) {
            const lower = targetNumber - offset;
            const higher = targetNumber + offset;
            
            if ( lower > 0 && !usedNumbers.includes( lower ) ) {
                return lower;
            }
            
            if ( !usedNumbers.includes( higher ) ) {
                return higher;
            }
        }
        
        return getNextAvailableSectionNumber();
    };

    const addSection = () => {
        const newSection = {
            ...emptySection,
            id: Math.random().toString( 36 ).substring( 2 ),
            sectionNumber: getNextAvailableSectionNumber()
        };
        
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

    const updateSectionNumber = ( sectionId: string, newNumber: number ) => {
        const validNumber = getClosestAvailableNumber( newNumber, sectionId );
        
        setSections( prev => prev.map( section =>
            section.id === sectionId 
            ? { ...section, sectionNumber: validNumber }
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
                        periodId  : section.period.split('-')[0],
                        session : session as Session,
                        code  : section.sectionNumber,
                    });
                }
            });
        });

        return result;
    }, [sections]);


    function handleSave(): void {
        if ( generatedSections.length === 0 ) {
            return;
        }

        console.log('Secciones generadas:', generatedSections);
    };


    return (
        <>
            <Card className="h-auto md:h-[calc(100vh-220px)]">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Creador de Secciones Académicas
                        </div>

                        <Button
                            onClick     = { addSection }
                            className   = "flex items-center gap-2"
                            disabled    = { getAvailablePeriodsForSection( memoizedPeriods[0]?.id ).length === 0 }
                        >
                            <Plus className="h-4 w-4" />
                            Agregar Sección
                        </Button>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-4 h-[calc(100vh-1000px)] md:h-[calc(100vh-400px)] overflow-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sections.map( section => (
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
                                                        showLabel           = {true}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="grid sm:flex sm:justify-between space-y-2 sm:gap-4 ">
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
                </CardContent>
            </Card>
        </>
    );
}
