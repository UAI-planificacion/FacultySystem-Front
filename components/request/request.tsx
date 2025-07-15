"use client"

import { useState } from "react"

import { useQuery } from "@tanstack/react-query"

import { RequestList }          from "@/components/request/request-list"
import { RequestDetailView }    from "@/components/request-detail/request-detail"

import { KEY_QUERYS }   from "@/consts/key-queries";
import { type Request } from "@/types/request";
import { fetchApi }     from "@/services/fetch";


interface RequestsManagementProps {
    facultyId: string;
    enabled: boolean;
}


export function RequestsManagement({ facultyId, enabled }: RequestsManagementProps) {

    const { data, isLoading, isError } = useQuery({
        queryKey    : [ KEY_QUERYS.REQUESTS, facultyId ],
        queryFn     : () => fetchApi<Request[]>( { url: `requests/faculty/${facultyId}` } ),
        enabled,
    });
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

    const handleViewDetails = (request: Request) => {
        setSelectedRequest(request)
    }

    const handleBack = () => {
        setSelectedRequest(null)
    }


    return (
            isLoading 
            ? <p>Cargando...</p>
            : selectedRequest ? (
                <RequestDetailView
                    request  = { selectedRequest }
                    onBack      = { handleBack }
                />
            ) : (
                <RequestList
                    requests        = { data! }
                    onViewDetails   = { handleViewDetails }
                />
            )
    )
}
