"use client"

import { useState } from "react"
import RequestList from "./request-list"
import RequestDetailView from "../request-detail/request-detail"
import { type Request, Status, SpaceType, Size, Nivel, Building } from "@/types/request"
import { useQuery } from "@tanstack/react-query"
import { KEY_QUERYS } from "@/consts/key-queries"
import { fetchData } from "@/services/fetch"

interface RequestsManagementProps {
    facultyId: string;
    enabled: boolean;
}

export default function RequestsManagement({ facultyId, enabled }: RequestsManagementProps) {

    const {
        data,
        isLoading,
        error,
        isError,
        refetch
    } = useQuery({
        queryKey    : [ KEY_QUERYS.REQUESTS, facultyId ],
        queryFn     : () => fetchData<Request[]>( `requests/faculty/${facultyId}` ),
        enabled,
    });


    // const [requests, setRequests] = useState<Request[]>(mockRequests)
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

    const handleViewDetails = (request: Request) => {
        setSelectedRequest(request)
    }

    const handleBack = () => {
        setSelectedRequest(null)
    }

    const handleUpdateRequest = (updatedRequest: Request) => {
        // setRequests((prev) => prev.map((req) => (req.id === updatedRequest.id ? updatedRequest : req)))
        setSelectedRequest(updatedRequest)
    }

    return (
            isLoading 
            ? <p>Cargando...</p>
            : selectedRequest ? (
                <RequestDetailView
                    request  = { selectedRequest }
                    onBack      = { handleBack }
                    // onUpdateRequest = { handleUpdateRequest }
                />
            ) : (
                <RequestList
                    requests        = { data! }
                    onViewDetails   = { handleViewDetails }
                />
            )
        // <div className="container mx-auto p-6">
            /* <div className="mb-6">
                <h1 className="text-3xl font-bold">Solicitudes de Facultad</h1>
                <p className="text-muted-foreground">Gestiona las solicitudes de espacios y recursos de la facultad</p>
            </div> */
        // </div>
    )
}
