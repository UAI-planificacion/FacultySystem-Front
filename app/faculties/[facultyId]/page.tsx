"use client"

import { JSX, useEffect, useState, useMemo }        from "react";
import { useParams, useRouter, useSearchParams }    from 'next/navigation';

import {
    Album,
    ArrowLeft,
    BookCopy,
    BookOpen,
    CalendarCog,
    Users
}                                   from "lucide-react";
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                                   from "@/components/ui/tabs";
import { StaffManagement }          from "@/components/staff/staff-management";
import { SubjectsManagement }       from "@/components/subject/subjects-management";
import { RequestsManagement }       from "@/components/request/request-management";
import { PlanningChangeManagement } from "@/components/planning-change/planning-change-management";
import { Button }                   from "@/components/ui/button";

import { Faculty, FacultyResponse } from "@/types/faculty.model";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { fetchApi }                 from "@/services/fetch";


enum TabValue {
    SUBJECTS        = "subjects",
    STAFF           = "staff",
    REQUESTS        = "requests",
    PLANNING_CHANGE = "planning-change"
}


export default function FacultyDetailsPage(): JSX.Element {
    const params                    = useParams();
    const router                    = useRouter(); 
    const searchParams              = useSearchParams();
    const queryClient               = useQueryClient();
    const facultyId                 = params.facultyId as string;
    const initialTab                = searchParams.get( 'tab' ) as TabValue || TabValue.SUBJECTS;
    const [activeTab, setActiveTab] = useState<TabValue>( initialTab );

    // Estado para forzar re-renders cuando cambie la caché
    const [, forceUpdate] = useState({});

    // Query para obtener datos de facultades
    const { data: facultiesData } = useQuery<FacultyResponse>({
        queryKey    : [ KEY_QUERYS.FACULTIES ],
        queryFn     : () => fetchApi({ url: 'faculties' }),
        staleTime   : 5 * 60 * 1000
    });

    // Suscribirse a cambios en la caché para forzar actualizaciones
    useEffect(() => {
        const unsubscribe = queryClient.getQueryCache().subscribe(( event ) => {
            if ( 
                event?.query?.queryKey?.[0] === KEY_QUERYS.FACULTIES && 
                event?.type === 'updated' 
            ) {
                forceUpdate({});
            }
        });

        return unsubscribe;
    }, [ queryClient ]);

    const facultyFromCache = useMemo(() => {
        const currentData = queryClient.getQueryData<FacultyResponse>([ KEY_QUERYS.FACULTIES ]);
        return currentData?.faculties.find( f => f.id === facultyId );
    }, [ queryClient, facultyId, facultiesData ]);


    const {
        data        : individualFaculty,
        isLoading   : isLoadingIndividual,
    } = useQuery<Faculty>({
        queryKey    : [ KEY_QUERYS.FACULTIES, facultyId ],
        queryFn     : () => fetchApi({ url: `faculties/${facultyId}` }),
        enabled     : !facultyFromCache,
        staleTime   : 5 * 60 * 1000
    });


    const faculty = facultyFromCache || individualFaculty;


    useEffect(() => {
        if ( !facultyId ) return;

        const currentParams = new URLSearchParams( searchParams.toString() );
        currentParams.set( 'tab', activeTab );
        router.replace( `?${currentParams.toString()}`, { scroll: false });
    }, [ activeTab, facultyId, router, searchParams ]);


    return (
        <main className="container mx-auto py-6 space-y-4 px-4 min-h-[calc(100vh-74px)]">
            <div className="flex items-center gap-4">
                <Button
                    variant   = "secondary"
                    onClick   = { () => router.back() }
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>

                <div className="grid">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
                        Facultad { faculty?.name || ( isLoadingIndividual ? 'Cargando...' : facultyId )}
                    </h1>

                    <span className="text-[11px] text-muted-foreground">
                        { facultyId }
                    </span>
                </div>
            </div>

            <Tabs
                value           = { activeTab }
                onValueChange   = {( value: string ) => setActiveTab( value as TabValue )}
                className       = "w-full"
            >
                <TabsList className="grid grid-cols-4 mb-4 h-12">
                    <TabsTrigger
                        value       = { TabValue.STAFF }
                        className   = "h-10 text-md gap-2"
                        title       = "Personal"
                    >
                        <Users className="h-5 w-5" />

                        <span className="hidden sm:block">Personal ({ faculty?.totalStaff || 0 })</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value       = { TabValue.SUBJECTS }
                        className   = "h-10 text-md gap-2"
                        title       = "Asignaturas"
                    >
                        <BookOpen className="h-5 w-5" />

                        <span className="hidden sm:block">Asignaturas ({ faculty?.totalSubjects || 0 })</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value       = { TabValue.REQUESTS }
                        className   = "h-10 text-md gap-2"
                        title       = "Solicitudes"
                    >
                        <BookCopy className="h-5 w-5" />

                        <span className="hidden sm:block">Solicitudes ({ faculty?.totalRequests || 0 })</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value       = { TabValue.PLANNING_CHANGE }
                        className   = "h-10 text-md gap-2"
                        title       = "Planificación"
                    >
                        <CalendarCog className="h-5 w-5" />

                        <span className="hidden sm:block">Cambio de Plan. ({ faculty?.totalPlanningChanges || 0 })</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={TabValue.STAFF}>
                    <StaffManagement 
                        facultyId   = { facultyId }
                        enabled     = { activeTab === TabValue.STAFF }
                    />
                </TabsContent>

                <TabsContent value={TabValue.SUBJECTS}>
                    <SubjectsManagement 
                        facultyId   = { facultyId }
                        enabled     = { activeTab === TabValue.SUBJECTS }
                    />
                </TabsContent>

                <TabsContent value={TabValue.REQUESTS}>
                    <RequestsManagement
                        facultyId   = { facultyId }
                        enabled     = { activeTab === TabValue.REQUESTS }
                    />
                </TabsContent>

                <TabsContent value={TabValue.PLANNING_CHANGE}>
                    <PlanningChangeManagement
                        facultyId   = { facultyId }
                        enabled     = { activeTab === TabValue.PLANNING_CHANGE }
                    />
                </TabsContent>
            </Tabs>
        </main>
    );
}
