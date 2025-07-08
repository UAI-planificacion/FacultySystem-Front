"use client"

import { useEffect, useState } from "react";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                               from "@/components/ui/tabs";
import { StaffManagement }  from "@/components/staff/staff-management";
import { SubjectsManagement }   from "@/components/subject/subjects-management";

import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { Faculty } from "@/types/faculty.model";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useData } from "@/hooks/use-data";
import { Subject } from "@/types/subject.model";
import { KEY_QUERYS } from "@/consts/key-queries";
import { ENV } from "@/config/envs/env";
import { Staff } from "@/types/staff.model";
import FacultyRequestsPage from "@/components/request/request";


enum TabValue {
    SUBJECTS = "subjects",
    PERSONNEL = "personnel",
    REQUESTS = "requests"
}


export default function FacultyDetailsPage(): JSX.Element {
    const params        = useParams();
    const queryClient   = useQueryClient();
    const router        = useRouter(); 
    const searchParams  = useSearchParams();

    const facultyId = params.facultyId as string;
    const initialTab = searchParams.get( 'tab' ) as TabValue || TabValue.SUBJECTS;

    const [activeTab, setActiveTab] = useState<TabValue>( initialTab );
    const [managingFaculty, setManagingFaculty] = useState<Faculty>( {} as Faculty );


    useEffect(() => {
        if ( !facultyId ) return;

        const currentParams = new URLSearchParams( searchParams.toString() );
        currentParams.set( 'tab', activeTab );
        router.replace( `?${currentParams.toString()}`, { scroll: false });
    }, [ activeTab, facultyId, router, searchParams ]);


    async function fetchData<T>( endpoint: string ): Promise<T> {
        const API_URL   = `${ENV.REQUEST_BACK_URL}${endpoint}`;
        const response  = await fetch( API_URL );
    
        return response.json();
    }



    const {
        data        : requests,
        isLoading   : isRequestsLoading,
        error       : requestsError,
        isError     : isRequestsError,
        refetch     : refetchRequests
    } = useQuery({
        queryKey    : [ KEY_QUERYS.REQUESTS, facultyId ],
        queryFn     : () => fetchData<Request[]>( `requests/faculty/${facultyId}` ),
        enabled     : activeTab === TabValue.REQUESTS,
    });


    const handleUpdateManagedFaculty = ( updatedFaculty: Faculty ) => {
        setManagingFaculty( updatedFaculty );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <h1 className="text-2xl font-bold">Facultad {facultyId}</h1>

            <Tabs
                value           = { activeTab }
                onValueChange   = { ( value: string ) => setActiveTab( value as TabValue ) }
                className       = "w-full"
            >
                <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value={TabValue.SUBJECTS}>Asignaturas</TabsTrigger>

                    <TabsTrigger value={TabValue.PERSONNEL}>Personal</TabsTrigger>

                    <TabsTrigger value={TabValue.REQUESTS}>Solicitudes</TabsTrigger>
                </TabsList>

                <TabsContent value={TabValue.SUBJECTS}>
                    <SubjectsManagement 
                        facultyId={facultyId}
                        enabled={activeTab === TabValue.SUBJECTS}
                    />
                </TabsContent>

                <TabsContent value={TabValue.PERSONNEL}>
                    <StaffManagement 
                        facultyId={facultyId}
                        enabled={activeTab === TabValue.PERSONNEL}
                    />
                </TabsContent>

                <TabsContent value={TabValue.REQUESTS}>
                    <FacultyRequestsPage />
                </TabsContent>

                {/* <TabsContent value="requests">
                    <RequestsManagement 
                        faculty={managingFaculty}
                        onUpdate={handleUpdateManagedFaculty}
                    />
                </TabsContent> */}
            </Tabs>
        </div>
    );
}
