'use client'

import React, { useState, useMemo } from 'react';
import { useParams, useRouter }     from "next/navigation";

import {
    Plus,
    Save,
    BrushCleaning,
    ArrowLeft,
    Eye
}                   from 'lucide-react';
import {
    useQuery,
    useMutation,
    useQueryClient
}                       from '@tanstack/react-query';
import { format }       from "@formkit/tempo";
import { toast }        from "sonner";
import { v7 as uuid7 }  from 'uuid';

import {
    Tabs,
    TabsTrigger,
    TabsList
}                       from '@/components/ui/tabs';
import { SectionCard }  from "@/components/section/section-card";
import { SectionTable } from "@/components/section/section.table";
import { SectionMain }  from "@/components/section/section-main";
import { ViewMode }     from "@/components/shared/view-mode";
import { Button }       from "@/components/ui/button";

import {
    Session,
    SectionToCreate,
    SectionData,
}                           from '@/types/section.model';
import {
    errorToast,
    successToast
}                           from "@/config/toast/toast.config";
import { Subject }          from '@/types/subject.model';
import { KEY_QUERYS }       from '@/consts/key-queries';
import { fetchApi, Method } from '@/services/fetch';
import { ENV }              from '@/config/envs/env';
import { Period }           from '@/types/periods.model';
import { useViewMode }      from "@/hooks/use-view-mode";


type TabType = 'add' | 'show';


function formatDate( period : Period ): string {
    if ( !period.startDate || !period.endDate ) return '';

    return ` (${format( period.startDate, 'short' )} - ${format( period.endDate, 'short' )})`;
}


const emptySection: SectionData = {
    id              : uuid7(),
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
    const [tab, setTab] = useState<TabType>( "add" );
    const params        = useParams();
    const subjectId     = params.id as string;
    const router        = useRouter();


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

    const {
        data        : subjectData,
        isLoading   : isLoadingSubject,
        isError     : isErrorSubject
    } = useQuery<Subject>({
        queryKey: [KEY_QUERYS.SUBJECTS, subjectId],
        queryFn : () => fetchApi({ url: `subjects/${subjectId}` }),
        enabled: !!subjectId,
    });


    const memoizedPeriods = useMemo(() => {
        return periods?.map( period => ({
            id      : period.id,
            label   : `${period.id} - ${ period.name }${ formatDate( period )}`,
            value   : period.id
        }) ) ?? [];
    }, [periods]);


    const [sections, setSections] = useState<SectionData[]>([ emptySection ]);


    const getNextAvailableSectionNumber = () => {
        const usedNumbers = sections.map( section => section.sectionNumber ).sort( ( a, b ) => a - b );

        for ( let i = 1; i <= usedNumbers.length + 1; i++ ) {
            if ( !usedNumbers.includes( i ) ) {
                return i;
            }
        }

        return usedNumbers.length + 1;
    };


    const getClosestAvailableNumber = ( targetNumber: number, excludeId?: string ) => {
        const usedNumbers = sections
            .filter( section => excludeId ? section.id !== excludeId : true )
            .map( section => section.sectionNumber );

        if ( !usedNumbers.includes( targetNumber )) {
            return targetNumber;
        }

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


    function addSection(): void {
        const newSection = {
            ...emptySection,
            id              : uuid7(),
            sectionNumber   : getNextAvailableSectionNumber()
        };

        setSections( prev => [ ...prev, newSection ]);
    };


    const removeSection = ( sectionId: string ) => {
        setSections( prev => prev.filter( section => section.id !== sectionId ));
    };


    function updateSectionPeriod( sectionId: string, period: string ): void {
        setSections( prev => prev.map( section =>
            section.id === sectionId 
            ? { ...section, period }
            : section
        ));
    };


    function updateSectionNumber( sectionId: string, newNumber: number ): void {
        const validNumber = getClosestAvailableNumber( newNumber, sectionId );
        
        setSections( prev => prev.map( section =>
            section.id === sectionId 
            ? { ...section, sectionNumber: validNumber }
            : section
        ));
    };


    function updateSessionCount( sectionId: string, session: Session, delta: number ): void {
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


    function setSessionCount( sectionId: string, session: Session, value: string ): void {
        const count = parseInt( value ) || 0;

        setSections( prev => prev.map( section =>
            section.id === sectionId 
            ? {
                ...section,
                sessionCounts: {
                    ...section.sessionCounts,
                    [session]: Math.max( 0, count )
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
                        code        : section.sectionNumber,
                        groupId     : section.id
                    });
                }
            });
        });

        return result;
    }, [sections]);


    const queryClient = useQueryClient();


    const createSectionsMutation = useMutation({
        mutationFn: async ( sectionsToCreate: SectionToCreate[] ) => {
            return fetchApi({
                isApi   : false,
                url     : `${ENV.ACADEMIC_SECTION}Sections/create-massive-by-subject/${subjectId}`,
                method  : Method.POST,
                body    : sectionsToCreate
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ KEY_QUERYS.SECCTIONS, subjectId ]
            });

            setSections([ emptySection ]);
            setTab( 'show' );
            toast( 'Secciones creadas exitosamente', successToast );
        },
        onError: ( error ) => {
            console.error( 'Error creating sections:', error );
            toast( 'Error al crear secciones', errorToast );
        }
    });

    function handleSave(): void {
        if ( generatedSections.length === 0 ) {
            return;
        }
        console.log("🚀 ~ file: page.tsx:268 ~ generatedSections:", generatedSections)

        createSectionsMutation.mutate( generatedSections );
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

                    <h1 className="text-xl md:text-3xl font-bold">
                        Secciones de la Asignatura { subjectId }
                    </h1>
                </div>

                <Tabs
                    defaultValue    = { tab }
                    onValueChange   = {( value ) => setTab( value as TabType )}
                >
                    <TabsList>
                        <TabsTrigger value="add" className='gap-1.5'>
                            <Plus className="h-5 w-5" />

                            <span className='hidden md:flex'>Agregar Secciones</span>
                        </TabsTrigger>

                        <TabsTrigger value="show" className="gap-1.5">
                            <Eye className='h-5 w-5' />

                            <span className='hidden md:flex'>Ver Secciones Existentes</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs> 
			</header>

            { tab === 'add' ? ( <>
                <div className="flex items-center gap-2 justify-end mt-4">
                    <ViewMode
                        viewMode        = { viewMode }
                        onViewChange    = { onViewChange }
                    />

                    <Button
                        onClick     = { addSection }
                        className   = "items-center gap-2 w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Agregar Sección
                    </Button>
                </div>

                <div className="h-[calc(100vh-350px)] sm:h-[calc(100vh-330px)] overflow-auto space-y-4 mt-4">
                    { viewMode === 'cards' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sections.map( section => (
                                <SectionCard
                                    key                 = { section.id }
                                    section             = { section }
                                    updateSectionNumber = { updateSectionNumber }
                                    removeSection       = { removeSection }
                                    removeDisabled      = { sections.length === 1 }
                                    isErrorPeriods      = { isErrorPeriods }
                                    updateSectionPeriod = { updateSectionPeriod }
                                    periods             = { memoizedPeriods}
                                    isLoadingPeriods    = { isLoadingPeriods }
                                    updateSessionCount  = { updateSessionCount }
                                    setSessionCount     = { setSessionCount }
                                />
                            ))}
                        </div>
                    ) : (
                        <SectionTable
                            section             = { sections }
                            updateSectionNumber = { updateSectionNumber }
                            removeSection       = { removeSection }
                            removeDisabled      = { sections.length === 1 }
                            isErrorPeriods      = { isErrorPeriods }
                            updateSectionPeriod = { updateSectionPeriod }
                            periods             = { memoizedPeriods}
                            isLoadingPeriods    = { isLoadingPeriods }
                            updateSessionCount  = { updateSessionCount }
                            setSessionCount     = { setSessionCount }
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
                </> )
                : (
                    <SectionMain
                        memoizedPeriods     = { memoizedPeriods }
                        isLoadingPeriods    = { isLoadingPeriods }
                        enabled             = { true }
                        subjectId           = { subjectId }
                        facultyId           = { subjectData?.facultyId || '' }
                    />
                )
            }
		</main>
	);
}
