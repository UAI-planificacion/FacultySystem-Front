"use client"

import { JSX, useEffect, useState, useMemo }        from "react";
import { useParams, useRouter, useSearchParams }    from 'next/navigation';

import {
    Album,
    ArrowLeft,
    BookCopy,
    BookOpen,
    Users
}                           from "lucide-react";
import { useQueryClient }   from '@tanstack/react-query';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                               from "@/components/ui/tabs";
import { StaffManagement }      from "@/components/staff/staff-management";
import { SubjectsManagement }   from "@/components/subject/subjects-management";
import { RequestsManagement }   from "@/components/request/request";
import { Button }               from "@/components/ui/button";
import { OfferManagement }      from "@/components/offer/offer-management";

import { FacultyResponse }      from "@/types/faculty.model";
import { KEY_QUERYS }           from "@/consts/key-queries";


enum TabValue {
    SUBJECTS    = "subjects",
    OFFERS      = "offers",
    PERSONNEL   = "personnel",
    REQUESTS    = "requests"
}


export default function FacultyDetailsPage(): JSX.Element {
    const params                    = useParams();
    const router                    = useRouter(); 
    const searchParams              = useSearchParams();
    const queryClient               = useQueryClient();
    const facultyId                 = params.facultyId as string;
    const initialTab                = searchParams.get( 'tab' ) as TabValue || TabValue.SUBJECTS;
    const [activeTab, setActiveTab] = useState<TabValue>( initialTab );

    /**
     * Obtiene el nombre de la facultad desde la caché de TanStack Query
     */
    const faculty = useMemo(() => {
        const facultiesData = queryClient.getQueryData<FacultyResponse>([ KEY_QUERYS.FACULTIES ]);
        const faculty       = facultiesData?.faculties.find( f => f.id === facultyId );
        return faculty;
    }, [ queryClient, facultyId ]);


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
                        Facultad { faculty?.name }
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
                        value       = { TabValue.PERSONNEL }
                        className   = "h-10 text-md gap-2"
                        title       = "Personal"
                    >
                        <Users className="h-5 w-5" />

                        <span className="hidden sm:block">Personal ({ faculty?.totalPersonnel || 0 })</span>
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
                        value       = { TabValue.OFFERS }
                        className   = "h-10 text-md gap-2"
                        title       = "Ofertas"
                        disabled    = {(faculty?.totalSubjects ?? 0 ) === 0 }
                    >
                        <Album className="h-5 w-5" />

                        <span className="hidden sm:block">Ofertas ({ faculty?.totalOffers || 0 })</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value       = { TabValue.REQUESTS }
                        className   = "h-10 text-md gap-2"
                        title       = "Solicitudes"
                        disabled    = {( faculty?.totalOffers ?? 0 ) === 0 }
                    >
                        <BookCopy className="h-5 w-5" />

                        <span className="hidden sm:block">Solicitudes ({ faculty?.totalRequests || 0 })</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={TabValue.REQUESTS}>
                    <RequestsManagement
                        facultyId   = { facultyId }
                        enabled     = { activeTab === TabValue.REQUESTS }
                    />
                </TabsContent>

                <TabsContent value={TabValue.SUBJECTS}>
                    <SubjectsManagement 
                        facultyId   = { facultyId }
                        enabled     = { activeTab === TabValue.SUBJECTS }
                    />
                </TabsContent>

                <TabsContent value={TabValue.PERSONNEL}>
                    <StaffManagement 
                        facultyId   = { facultyId }
                        enabled     = { activeTab === TabValue.PERSONNEL }
                    />
                </TabsContent>

                <TabsContent value={TabValue.OFFERS}>
                    <OfferManagement 
                        facultyId   = { facultyId }
                        enabled     = { activeTab === TabValue.OFFERS }
                    />
                </TabsContent>
            </Tabs>
        </main>
    );
}
