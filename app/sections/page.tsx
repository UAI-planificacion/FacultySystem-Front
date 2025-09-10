'use client'

import React, { useState, useMemo, useEffect }  from 'react';
import { useRouter, useSearchParams }           from "next/navigation";

import {
    Plus,
    Save,
    BrushCleaning,
    ArrowLeft,
    Boxes
}                       from 'lucide-react';
import {
    useMutation,
    useQueryClient
}                       from '@tanstack/react-query';
import { toast }        from "sonner";
import { v7 as uuid7 }  from 'uuid';

import {
    Tabs,
    TabsTrigger,
    TabsList
}                           from '@/components/ui/tabs';
import { SectionCard }      from "@/components/section/section-card";
import { SectionTable }     from "@/components/section/section.table";
import { SectionMain }      from "@/components/section/section-main";
import { ViewMode }         from "@/components/shared/view-mode";
import { Button }           from "@/components/ui/button";
import { SubjectSelect }    from '@/components/shared/item-select/subject-select';

import {
    Session,
    SectionToCreate,
    SectionData,
}                           from '@/types/section.model';
import {
    errorToast,
    successToast
}                           from "@/config/toast/toast.config";
import { KEY_QUERYS }       from '@/consts/key-queries';
import { fetchApi, Method } from '@/services/fetch';
import { ENV }              from '@/config/envs/env';
import { useViewMode }      from "@/hooks/use-view-mode";


type TabType = 'add' | 'show';


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
    const queryClient               = useQueryClient();
    const router                    = useRouter();
    const [tab, setTab]             = useState<TabType>( "show" );
    const searchParams              = useSearchParams();
    const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
    const [sections, setSections]   = useState<SectionData[]>([ emptySection ]);


    useEffect(() => {
        const initialSubjectId = searchParams.get( 'subject' )?.split( ',' ).filter( Boolean )[0] || undefined;
        setSubjectId( initialSubjectId );
    }, []);


    const { viewMode, onViewChange } = useViewMode({
        queryName   : 'view',
        defaultMode : 'cards'
    });


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
                queryKey: [ KEY_QUERYS.SECCTIONS ]
            });

            const newSection = {
                ...emptySection,
                id : uuid7(),
            }

            setSections([ newSection ]);
            setTab( 'show' );
            toast( 'Secciones creadas exitosamente', successToast );
        },
        onError: ( error ) => {
            console.error( 'Error creating sections:', error );
            toast( 'Error al crear secciones', errorToast );
        }
    });


    function handleSave(): void {
        if ( !subjectId ) {
            toast( 'Debe seleccionar una asignatura', errorToast );
            return;
        }

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
                        Administrador de Secciones
                    </h1>
                </div>

                <Tabs
                    value           = { tab }
                    onValueChange   = {( value ) => setTab( value as TabType )}
                >
                    <TabsList>
                        <TabsTrigger value="show" className="gap-1.5">
                            <Boxes className="h-5 w-5" />

                            <span className='hidden md:flex'>Grupos</span>
                        </TabsTrigger>

                        <TabsTrigger value="add" className='gap-1.5'>
                            <Plus className="h-5 w-5" />

                            <span className='hidden md:flex'>Agregar</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs> 
			</header>

            { tab === 'add' ? ( <>
                <div className="flex items-center gap-2 justify-end mt-4">
                    <div className="flex-1">
                        <SubjectSelect
                            placeholder         = "Seleccione una asignatura"
                            defaultValues       = { subjectId }
                            onSelectionChange   = {( value ) => {
                                const newValues = value as string;
                                setSubjectId(newValues);
                            }}
                            multiple = { false }
                        />
                    </div>

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
                                    updateSectionPeriod = { updateSectionPeriod }
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
                            updateSectionPeriod = { updateSectionPeriod }
                            updateSessionCount  = { updateSessionCount }
                            setSessionCount     = { setSessionCount }
                        />
                    )}
                </div>

                <div className="grid sm:flex sm:justify-between space-y-2 sm:space-y-0 sm:gap-4 border-t-2 items-center sm:pt-2 mt-2">
                    <Button
                        onClick     = { () => setSections([ emptySection ])}
                        disabled    = { sections.length === 1 }
                        className   = "flex items-center gap-2"
                        variant     = "destructive"
                    >
                        <BrushCleaning className="h-4 w-4" />

                        Limpiar Secciones
                    </Button>

                    <div className="flex gap-2 items-center">
                        {/* <SubjectSelect
                            placeholder         = "Seleccione una asignatura"
                            defaultValues       = { subjectId }
                            onSelectionChange   = {( value ) => {
                                const newValues = value as string;
                                setSubjectId(newValues);
                            }}
                            multiple = { false }
                        /> */}

                        <Button
                            onClick     = { handleSave }
                            disabled    = { generatedSections.length === 0 }
                            className   = "flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Crear Secciones ({ generatedSections.length })
                        </Button>
                    </div>
                </div>
                </> )
                : (
                    <SectionMain
                        enabled         = { true }
                        searchParams    = { searchParams }
                    />
                )
            }
		</main>
	);
}
