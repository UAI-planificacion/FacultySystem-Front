"use client"

import { useState, useMemo, useEffect, JSX }    from "react";
import { useSearchParams, useRouter }           from "next/navigation";

import {
    useMutation,
    useQueryClient
}                   from "@tanstack/react-query";
import { toast }    from "sonner";

import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { RequestFilter }        from "@/components/request/request-filter";
import { RequestList }          from "@/components/request/request-list";
import { RequestTable }         from "@/components/request/request-table";
import { RequestForm }          from "@/components/request/request-form";
import { DataPagination }       from "@/components/ui/data-pagination";

import { type Request, Status }     from "@/types/request";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { KEY_QUERYS }               from "@/consts/key-queries";


interface RequestMainProps {
    requests        : Request[];
    onViewDetails   : ( request: Request ) => void;
    facultyId       : string;
    isLoading       : boolean;
    isError         : boolean;
}


type SortBy             = "title" | "consecutive" | "updatedAt";
type SortOrder          = "asc" | "desc";
type ConsecutiveFilter  = "ALL" | "TRUE" | "FALSE";
export type ViewMode    = "cards" | "table";


export function RequestMain({
    requests,
    onViewDetails,
    facultyId,
    isLoading,
    isError
}: RequestMainProps ): JSX.Element {
    const queryClient                                   = useQueryClient();
    const searchParams                                  = useSearchParams();
    const router                                        = useRouter();
    const [isFormOpen, setIsFormOpen]                  = useState( false );
    const [editingRequest, setEditingRequest]          = useState<Request | null>( null );
    const [title, setTitle]                            = useState( "" );
    const [statusFilter, setStatusFilter]              = useState<Status | "ALL">( "ALL" );
    const [consecutiveFilter, setConsecutiveFilter]    = useState<ConsecutiveFilter>( "ALL" );
    const [sortBy, setSortBy]                          = useState<SortBy>( "updatedAt" );
    const [sortOrder, setSortOrder]                    = useState<SortOrder>( "desc" );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]  = useState( false );
    const [deletingRequest, setDeletingRequest]        = useState<Request | null>( null );
    const [viewMode, setViewMode]                      = useState<ViewMode>(() => {
        const urlViewMode = searchParams.get('viewMode');
        return (urlViewMode === 'table' || urlViewMode === 'cards') ? urlViewMode : 'cards';
    });
    const [currentPage, setCurrentPage]                = useState( 1 );
    const [itemsPerPage, setItemsPerPage]              = useState( 15 );


    const deleteRequestApi = async ( requestId: string ): Promise<Request> =>
        fetchApi<Request>({ url: `requests/${requestId}`, method: Method.DELETE });


    const deleteRequestMutation = useMutation<Request, Error, string>({
        mutationFn: deleteRequestApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUESTS, facultyId] });
            setIsDeleteDialogOpen( false );
            setDeletingRequest( null );
            toast( 'Solicitud eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar solicitud: ${mutationError.message}`, errorToast )
    });


    const filteredAndSortedRequests = useMemo(() => {
        const filtered = requests.filter( request => {
            const matchesTitle = title === "" || request.title.toLowerCase().includes( title.toLowerCase() );
            const matchesStatus = statusFilter === "ALL" || request.status === statusFilter;
            const matchesConsecutive =
                consecutiveFilter === "ALL" ||
                ( consecutiveFilter === "TRUE" && request.isConsecutive ) ||
                ( consecutiveFilter === "FALSE" && !request.isConsecutive );

            return matchesTitle && matchesStatus && matchesConsecutive;
        });

        return filtered.sort(( a, b ) => {
            const [aValue, bValue] = {
                title       : [a.title, b.title],
                consecutive : [a.isConsecutive, b.isConsecutive],
                updatedAt   : [a.updatedAt, b.updatedAt],
            }[sortBy];

            if ( aValue < bValue ) return sortOrder === "asc" ? -1 : 1;
            if ( aValue > bValue ) return sortOrder === "asc" ? 1 : -1;

            return 0;
        })
    }, [requests, title, statusFilter, consecutiveFilter, sortBy, sortOrder]);


    const paginatedRequests = useMemo(() => {
        const startIndex = ( currentPage - 1 ) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAndSortedRequests.slice( startIndex, endIndex );
    }, [filteredAndSortedRequests, currentPage, itemsPerPage]);


    const totalPages    = Math.ceil( filteredAndSortedRequests.length / itemsPerPage );
    const startIndex    = ( currentPage - 1 ) * itemsPerPage;
    const endIndex      = startIndex + itemsPerPage;


    function handleEdit( request: Request ): void {
        setEditingRequest( request );
        setIsFormOpen( true );
    }


    function handleNewRequest(): void {
        setEditingRequest( null );
        setIsFormOpen( true );
    }


    function handleFormSuccess(): void {
        setIsFormOpen( false );
        setEditingRequest( null );
    }


    function handleDelete( request: Request ): void {
        setDeletingRequest( request );
        setIsDeleteDialogOpen( true );
    }


    function handleConfirmDelete(): void {
        if ( deletingRequest ) {
            deleteRequestMutation.mutate( deletingRequest.id );
        }
    }


    function handlePageChange( page: number ): void {
        setCurrentPage( page );
    }


    function handleItemsPerPageChange( newItemsPerPage: number ): void {
        setItemsPerPage( newItemsPerPage );
        setCurrentPage( 1 );
    }


    function handleViewModeChange( newViewMode: ViewMode ): void {
        setViewMode( newViewMode );

        const params = new URLSearchParams( searchParams.toString() );
        params.set( 'viewMode', newViewMode );
        router.replace( `?${params.toString()}` );
    }


    useEffect(() => {
        setCurrentPage( 1 );
    }, [title, statusFilter, consecutiveFilter, sortBy, sortOrder]);


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
                onNewRequest            = { handleNewRequest }
                viewMode                = { viewMode }
                setViewMode             = { handleViewModeChange }
            />

            {/* View Mode Tabs */}
            { viewMode === 'cards'
                ? <RequestList
                    requests            = { paginatedRequests }
                    onViewDetails       = { onViewDetails }
                    onEdit              = { handleEdit }
                    onDelete            = { handleDelete }
                    isLoading           = { isLoading }
                    isError             = { isError }
                />
                : <RequestTable
                    requests            = { paginatedRequests }
                    onViewDetails       = { onViewDetails }
                    onEdit              = { handleEdit }
                    onDelete            = { handleDelete }
                    isLoading           = { isLoading }
                    isError             = { isError }
                />
            }

            {/* Pagination */}
            { !isLoading && !isError && filteredAndSortedRequests.length > 0 && (
                <DataPagination
                    currentPage             = { currentPage }
                    totalPages              = { totalPages }
                    totalItems              = { filteredAndSortedRequests.length }
                    itemsPerPage            = { itemsPerPage }
                    onPageChange            = { handlePageChange }
                    onItemsPerPageChange    = { handleItemsPerPageChange }
                    startIndex              = { startIndex }
                    endIndex                = { endIndex }
                />
            )}

            {/* Request Form */}
            <RequestForm
                isOpen      = { isFormOpen }
                onClose     = { () => setIsFormOpen( false )}
                onSuccess   = { handleFormSuccess }
                request     = { editingRequest }
                facultyId   = { facultyId }
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { handleConfirmDelete }
                name        = { deletingRequest?.title || '' }
                type        = "la Solicitud (y todos sus detalles relacionados)"
            />
        </div>
    );
}
