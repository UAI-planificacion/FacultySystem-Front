"use client"

import { useState, useMemo, useEffect, JSX } from "react";

import {
    useMutation,
    useQueryClient
}                   from "@tanstack/react-query";
import { toast }    from "sonner";

import {
    RequestForm,
    RequestFormValues
}                               from "@/components/request/request-form";

import { 
    RequestCardSkeletonGrid,
    RequestErrorCard 
}                               from "@/components/request/request-card-skeleton";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Card, CardContent }    from "@/components/ui/card";
import { RequestFilter }        from "@/components/request/request-filter";
import { RequestCard }          from "@/components/request/request-card";

import { type Request, Status, UpdateRequest }  from "@/types/request";
import { Method, fetchApi }                     from "@/services/fetch";
import { errorToast, successToast }             from "@/config/toast/toast.config";
import { KEY_QUERYS }                           from "@/consts/key-queries";


interface RequestListProps {
    requests        : Request[];
    onViewDetails   : ( request: Request ) => void;
    facultyId       : string;
    isLoading       : boolean;
    isError         : boolean;
}


type SortBy             = "status" | "staffCreate" | "staffUpdate" | "subjectId" | "createdAt";
type SortOrder          = "asc" | "desc";
type ConsecutiveFilter  = "ALL" | "TRUE" | "FALSE";


const startRequest = {id: 'test', subject: {id: 'test', name: 'test'}} as Request;


export function RequestList({
    requests,
    onViewDetails,
    facultyId,
    isLoading,
    isError
}: RequestListProps ): JSX.Element {
    const queryClient                               = useQueryClient();
    const [isOpen, setIsOpen]                       = useState( false );
    const [selectedRequest, setSelectedRequest]     = useState<Request>( startRequest );
    const [title, setTitle]                         = useState( "" );
    const [statusFilter, setStatusFilter]           = useState<Status | "ALL">( "ALL" );
    const [consecutiveFilter, setConsecutiveFilter] = useState<ConsecutiveFilter>( "ALL" );
    const [sortBy, setSortBy]                       = useState<SortBy>( "createdAt" );
    const [sortOrder, setSortOrder]                 = useState<SortOrder>( "desc" );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );


    useEffect(() => {
        setSelectedRequest( requests[0] || startRequest  );
    }, [requests]);


    const updateRequestApi = async ( updatedRequest: UpdateRequest ): Promise<Request>  =>
        fetchApi<Request>({ url: `requests/${updatedRequest.id}`, method: Method.PATCH, body: updatedRequest });


    const deleteRequestApi = async ( requestId: string ): Promise<Request> =>
        fetchApi<Request>({ url: `requests/${requestId}`, method: Method.DELETE });


    const updateRequestMutation = useMutation<Request, Error, UpdateRequest>({
        mutationFn: updateRequestApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUESTS] });
            setIsOpen( false );
            setSelectedRequest( startRequest );
            toast( 'Solicitud actualizada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al actualizar la solicitud: ${mutationError.message}`, errorToast )
    });


    const deleteRequestMutation = useMutation<Request, Error, string>({
        mutationFn: deleteRequestApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUESTS] });
            setIsDeleteDialogOpen( false );
            toast( 'Solicitud eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar solicitud: ${mutationError.message}`, errorToast )
    });


    const filteredAndSortedRequests = useMemo(() => {
        const filtered = requests.filter( request => {
            const matchesId = title === "" || request.title.toLowerCase().includes( title.toLowerCase() );
            const matchesStatus = statusFilter === "ALL" || request.status === statusFilter;
            const matchesConsecutive =
                consecutiveFilter === "ALL" ||
                ( consecutiveFilter === "TRUE" && request.isConsecutive ) ||
                ( consecutiveFilter === "FALSE" && !request.isConsecutive );

            return matchesId && matchesStatus && matchesConsecutive;
        });

        return filtered.sort(( a, b ) => {
            const [aValue, bValue] = {
                status      : [a.status, b.status],
                staffCreate : [a.staffCreate.name, b.staffCreate.name],
                staffUpdate : [a.staffUpdate?.name || "", b.staffUpdate?.name || ""],
                subjectId   : [a.subject.name, b.subject.name],
                createdAt   : [a.createdAt, b.createdAt],
            }[sortBy];

            if ( aValue < bValue ) return sortOrder === "asc" ? -1 : 1;
            if ( aValue > bValue ) return sortOrder === "asc" ? 1 : -1;

            return 0;
        })
    }, [requests, title, statusFilter, consecutiveFilter, sortBy, sortOrder]);


    const handleFormSubmit = ( formData: RequestFormValues ): void => {
        updateRequestMutation.mutate({
            ...formData,
            id: selectedRequest.id
        });
    };


    function onEdit( request: Request ): void {
        setSelectedRequest( request );
        setIsOpen(true );
    }


    function openDeleteDialog( id: string ): void {
        setSelectedRequest( requests.find(request => request.id === id) || startRequest );
        setIsDeleteDialogOpen( true );
    }


    return (
        <div className="space-y-4">
            {/* Filters */}
            <RequestFilter
                title                   = { title }
                setTitle                = { setTitle }
                statusFilter            = { statusFilter }
                setStatusFilter         = { setStatusFilter }
                consecutiveFilter       = { consecutiveFilter }
                setConsecutiveFilter    = { setConsecutiveFilter }
                sortBy                  = { sortBy }
                setSortBy               = { setSortBy }
                sortOrder               = { sortOrder }
                setSortOrder            = { setSortOrder }
            />

            {/* Results */}
            {isLoading ? (
                <RequestCardSkeletonGrid count={6} />
            ) : isError ? (
                <RequestErrorCard />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAndSortedRequests.map( request => (
                            <RequestCard
                                request         = { request }
                                key             = { request.id }
                                onViewDetails   = { () => onViewDetails( request )}
                                onEdit          = { () => onEdit( request )}
                                onDelete        = { () => openDeleteDialog( request.id )}
                            />
                        ))}
                    </div>

                    {filteredAndSortedRequests.length === 0 && (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-muted-foreground">No se encontraron solicitudes.</p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            <RequestForm
                isOpen      = { isOpen }
                onClose     = { () => setIsOpen( false )}
                onSubmit    = { handleFormSubmit }
                data        = { selectedRequest }
                facultyId   = { facultyId }
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => deleteRequestMutation.mutate( selectedRequest.id || '') }
                name        = { selectedRequest?.title || '' }
                type        = "la Solicitud (y todos sus detalles relacionados)"
            />
        </div>
    );
}
