'use client'

import React, { useState, useMemo } from 'react';
import { useParams, useRouter }     from "next/navigation";

import {
    Plus,
    Save,
    BrushCleaning,
    ArrowLeft
}                   from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format }   from "@formkit/tempo";

import {
    Session,
    SectionToCreate,
    SectionData,
    Section
}                       from '@/types/section.model';
import { KEY_QUERYS }   from '@/consts/key-queries';
import { fetchApi }     from '@/services/fetch';
import { ENV }          from '@/config/envs/env';
import { Period }       from '@/types/periods.model';

import { SectionCard }       from "@/components/section/section-card";
import { SectionTable }     from "@/components/section/section.table";
import { SectionAddedTable } from "@/components/section/section-added-table";
import { ViewMode }         from "@/components/shared/view-mode";
import { useViewMode }      from "@/hooks/use-view-mode";
import { Button }           from "@/components/ui/button";
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';


function formatDate( period : Period ): string {
    if ( !period.startDate || !period.endDate ) return '';

    return ` (${format( period.startDate, 'short' )} - ${format( period.endDate, 'short' )})`;
}


const emptySection: SectionData = {
    id              : Math.random().toString( 36 ).substring( 2 ),
    period          : '',
    sectionNumber   : 1,
    isNew           : true,
    sessionCounts   : {
        [Session.C]     : 0,
        [Session.A]     : 0,
        [Session.T]     : 0,
        [Session.L]     : 0,
    },
}


export default function SectionsPage() {
    const params    = useParams();
    const subjectId = params.id as string;
    const router    = useRouter();


    const { viewMode, onViewChange } = useViewMode({
        queryName   : 'view',
        defaultMode : 'cards'
    });


    const {
        data        : periods,
        isLoading   : isLoadingPeriods,
        isError     : isErrorPeriods
    } = useQuery<Period[]>({
        queryKey: [KEY_QUERYS.PERIODS],
        queryFn : () => fetchApi({
            isApi   : false,
            url     : `${ENV.ACADEMIC_SECTION}periods`
        }),
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

        if ( !usedNumbers.includes( targetNumber )) {
            return targetNumber;
        }

        // Find closest available number
        for ( let offset = 1; offset <= sections.length + 1; offset++ ) {
            const lower = targetNumber - offset;
            const higher = targetNumber + offset;

            if ( lower > 0 && !usedNumbers.includes( lower )) {
                return lower;
            }

            if ( !usedNumbers.includes( higher )) {
                return higher;
            }
        }

        return getNextAvailableSectionNumber();
    };


    const addSection = () => {
        const newSection = {
            ...emptySection,
            id              : Math.random().toString( 36 ).substring( 2 ),
            sectionNumber   : getNextAvailableSectionNumber()
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
                    [session]: Math.max( 0, section.sessionCounts[session] + delta )
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
                        periodId    : section.period.split( '-' )[0],
                        session     : session as Session,
                        code        : section.sectionNumber
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

        console.log( 'Secciones generadas:', generatedSections );
    };


	return (
        <main className="container mx-auto py-6 px-4 sm:px-5 min-h-[calc(100vh-74px)]">
			<header className=" space-y-2 sm:space-y-0 sm:flex justify-between gap-4 items-center w-full">
                <div className="flex items-center gap-4">
                    <Button
                        onClick = { () => router.back() }
                        size    = "icon"
                        variant = "secondary"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>

                    <h1 className="text-xl md:text-3xl font-bold">Secciones de la Asignatura { subjectId }</h1>
                </div>

                <div className="flex items-center gap-2">
                    <ViewMode
                        viewMode        = { viewMode }
                        onViewChange    = { onViewChange }
                    />

                    <Button
                        onClick     = { addSection }
                        className   = "items-center gap-2 w-full sm:w-auto"
                        disabled = { sections.length === periods?.length }
                    >
                        <Plus className="h-4 w-4" />
                        Agregar Sección
                    </Button>
                </div>
			</header>

            <Tabs defaultValue="add" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="add">Agregar Secciones</TabsTrigger>
                    <TabsTrigger value="show">Ver Secciones Existentes</TabsTrigger>
                </TabsList>

                <TabsContent value="add" className="mt-6">
                    <div className="h-[calc(100vh-350px)] sm:h-[calc(100vh-300px)] overflow-auto"> 
                        {viewMode === 'cards' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sections.map( section => (
                                    <SectionCard
                                        key                             = { section.id }
                                        section                         = { section }
                                        updateSectionNumber             = { updateSectionNumber }
                                        removeSection                   = { removeSection }
                                        removeDisabled                  = { sections.length === 1 }
                                        isErrorPeriods                  = { isErrorPeriods }
                                        updateSectionPeriod             = { updateSectionPeriod }
                                        getAvailablePeriodsForSection   = { getAvailablePeriodsForSection }
                                        isLoadingPeriods                = { isLoadingPeriods }
                                        updateSessionCount              = { updateSessionCount }
                                        setSessionCount                 = { setSessionCount }
                                    />
                                ))}
                            </div>
                        ) : (
                            <SectionTable
                                section                         = { sections }
                                updateSectionNumber             = { updateSectionNumber }
                                removeSection                   = { removeSection }
                                removeDisabled                  = { sections.length === 1 }
                                isErrorPeriods                  = { isErrorPeriods }
                                updateSectionPeriod             = { updateSectionPeriod }
                                getAvailablePeriodsForSection   = { getAvailablePeriodsForSection }
                                isLoadingPeriods                = { isLoadingPeriods }
                                updateSessionCount              = { updateSessionCount }
                                setSessionCount                 = { setSessionCount }
                            />
                        )}
                    </div>

                    <div className="grid sm:flex sm:justify-between space-y-2 sm:space-y-0 sm:gap-4 border-t-2 items-center sm:pt-2 mt-2">
                        <Button
                            onClick     = { () => setSections([emptySection])}
                            disabled    = { sections.length === 1 }
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
                </TabsContent>

                <TabsContent value="show" className="mt-6">
                    <SectionAddedTable
                        memoizedPeriods     = { memoizedPeriods }
                        isLoadingPeriods    = { isLoadingPeriods }
                        enabled             = { true }
                        subjectId           = { subjectId }
                    />
                </TabsContent>
            </Tabs> 
		</main>
	);
}
