'use client'

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams }   from "next/navigation";

import { useMutation, useQueryClient }  from "@tanstack/react-query";
import { BrushCleaning, Plus, Save }    from "lucide-react";
import { v7 as uuid7 }                  from 'uuid';
import { toast }                        from "sonner";

import { Button }               from "@/components/ui/button";
import { PageLayout }           from "@/components/layout/page-layout";
import { SubjectSelect }        from '@/components/shared/item-select/subject-select';
import { SectionData, Session } from "@/types/section.model";
import { SectionCard }          from "@/components/section/section-card";

import {
    errorToast,
    successToast
}                           from "@/config/toast/toast.config";
import { SectionToCreate }  from '@/types/section.model';
import { KEY_QUERYS }       from '@/consts/key-queries';
import { fetchApi, Method } from '@/services/fetch';
import { useViewMode }      from "@/hooks/use-view-mode";


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

export default function OffersPage() {
    const queryClient               = useQueryClient();
    const router                    = useRouter();
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
        const usedNumbers = sections.map( section => section.sectionNumber ).sort(( a, b ) => a - b );

        for ( let i = 1; i <= usedNumbers.length + 1; i++ ) {
            if ( !usedNumbers.includes( i )) {
                return i;
            }
        }

        return usedNumbers.length + 1;
    };


    function getClosestAvailableNumber( targetNumber: number, excludeId?: string ): number {
        const usedNumbers = sections
            .filter( section => excludeId ? section.id !== excludeId : true )
            .map( section => section.sectionNumber );

        if ( !usedNumbers.includes( targetNumber )) {
            return targetNumber;
        }

        for ( let offset = 1; offset <= sections.length + 1; offset++ ) {
            const lower     = targetNumber - offset;
            const higher    = targetNumber + offset;

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
                url     : `Sections/create-massive-by-subject/${subjectId}`,
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
		<PageLayout 
			title="Gestión de Ofertas"
			// actions={
			// 	<Button onClick={ openNewGradeForm }>
			// 		<Plus className="mr-2 h-4 w-4" />
			// 		Crear Grado
			// 	</Button>
			// }
		>
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

                <Button
                    onClick     = { handleSave }
                    disabled    = { generatedSections.length === 0 }
                    className   = "flex items-center gap-2"
                >
                    <Save className="h-4 w-4" />
                    Crear Secciones ({ generatedSections.length })
                </Button>
            </div>

            <div className="mt-4">
                <Button
                    onClick     = { addSection }
                    className   = "mb-4"
                    variant     = "outline"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Sección
                </Button>

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

                <div className="mt-4 pt-4 border-t">
                    <Button
                        onClick     = { () => setSections([ emptySection ])}
                        disabled    = { sections.length === 1 }
                        className   = "mr-2"
                        variant     = "destructive"
                    >
                        <BrushCleaning className="h-4 w-4 mr-2" />
                        Limpiar Secciones
                    </Button>
                </div>
            </div>
		</PageLayout>
	);
}
