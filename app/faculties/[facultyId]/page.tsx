"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                               from "@/components/ui/tabs";
import { StaffManagement }      from "@/components/staff/staff-management";
import { SubjectsManagement }   from "@/components/subject/subjects-management";
import RequestsManagement       from "@/components/request/request";


enum TabValue {
    SUBJECTS = "subjects",
    PERSONNEL = "personnel",
    REQUESTS = "requests"
}


export default function FacultyDetailsPage(): JSX.Element {
    const params                    = useParams();
    const router                    = useRouter(); 
    const searchParams              = useSearchParams();
    const facultyId                 = params.facultyId as string;
    const initialTab                = searchParams.get( 'tab' ) as TabValue || TabValue.SUBJECTS;
    const [activeTab, setActiveTab] = useState<TabValue>( initialTab );


    useEffect(() => {
        if ( !facultyId ) return;

        const currentParams = new URLSearchParams( searchParams.toString() );
        currentParams.set( 'tab', activeTab );
        router.replace( `?${currentParams.toString()}`, { scroll: false });
    }, [ activeTab, facultyId, router, searchParams ]);


    return (
        <div className="container mx-auto py-6 space-y-6">
            <h1 className="text-2xl font-bold">Facultad {facultyId}</h1>

            <Tabs
                value           = { activeTab }
                onValueChange   = { ( value: string ) => setActiveTab( value as TabValue ) }
                className       = "w-full"
            >
                <TabsList className="grid grid-cols-3 mb-4 h-12">
                    <TabsTrigger value={TabValue.REQUESTS} className="h-10 text-md">Solicitudes</TabsTrigger>

                    <TabsTrigger value={TabValue.PERSONNEL} className="h-10 text-md">Personal</TabsTrigger>

                    <TabsTrigger value={TabValue.SUBJECTS} className="h-10 text-md">Asignaturas</TabsTrigger>
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
            </Tabs>
        </div>
    );
}
