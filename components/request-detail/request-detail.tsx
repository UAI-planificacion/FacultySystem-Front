"use client"

import { JSX, useState, useEffect, useMemo }    from "react";
import { useRouter, useSearchParams }           from "next/navigation";

import { Plus, Grid2x2, AlignJustify } from "lucide-react";

import {
    useMutation,
    useQuery,
    useQueryClient
}                   from "@tanstack/react-query";
import { toast }    from "sonner";

import {
    Tabs,
    TabsList,
    TabsTrigger
}                                   from "@/components/ui/tabs";
import { Button }                   from "@/components/ui/button";
import { DeleteConfirmDialog }      from "@/components/dialog/DeleteConfirmDialog";
import { RequestInfoCard }          from "@/components/request-detail/request-info-card";
import { RequestDetailForm }        from "@/components/request-detail/request-detail-form";
import { RequestDetailList }        from "@/components/request-detail/request-detail-list";
import { RequestDetailErrorCard }   from "@/components/request-detail/request-detail-card-skeleton";
import { RequestDetailTable }       from "@/components/request-detail/request-detail-table";
import { DataPagination }           from "@/components/ui/data-pagination";

import type { Module, Request } from "@/types/request";
import type { RequestDetail }   from "@/types/request-detail.model";
import { KEY_QUERYS }           from "@/consts/key-queries";
import { Method, fetchApi }     from "@/services/fetch";
import { Professor }            from "@/types/professor";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";


export type ViewDetailMode = "card" | "table";


interface RequestDetailViewProps {
    request : Request;
    onBack  : () => void;
}


const initialRequestDetail = {} as RequestDetail;


export function RequestDetailView({
    request,
    onBack,
}: RequestDetailViewProps ): JSX.Element {
    const queryClient   = useQueryClient();
    const router        = useRouter();
    const searchParams  = useSearchParams();

    const [currentPage, setCurrentPage]     = useState( 1 );
    const [itemsPerPage, setItemsPerPage]   = useState( 15 );
    const [viewDetail, setViewDetail]       = useState<ViewDetailMode>(
        (searchParams.get('viewDetail') as ViewDetailMode) || 'card'
    );


    useEffect(() => {
        const currentViewDetail = searchParams.get('viewDetail') as ViewDetailMode;

        if ( currentViewDetail && currentViewDetail !== viewDetail ) {
            setViewDetail( currentViewDetail );
        }
    }, [searchParams, viewDetail]);


    const handleViewDetailChange = (newViewDetail: ViewDetailMode) => {
        setViewDetail(newViewDetail);

        const params = new URLSearchParams(searchParams.toString());
        params.set('viewDetail', newViewDetail);
        router.replace(`?${params.toString()}`);
    };


    const {
        data        : modules,
        isLoading   : isLoadingModules,
        isError     : isErrorModules,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.MODULES ],
        queryFn     : () => fetchApi<Module[]>({ url: `${ENV.ACADEMIC_SECTION}modules/original`, isApi: false }),
    });


    const {
        data        : professors,
        isLoading   : isLoadingProfessors,
        isError     : isErrorProfessors,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.PROFESSORS ],
        queryFn     : () => fetchApi<Professor[]>({ url: `${ENV.ACADEMIC_SECTION}professors`, isApi: false }),
    });


    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.REQUEST_DETAIL, request.id ],
        queryFn     : () => fetchApi<RequestDetail[]>({ url:`request-details/request/${request.id}` }),
    });


    const [selectedDetail, setSelectedDetail]   = useState<RequestDetail>( initialRequestDetail );
    const [ isOpenEdit, setIsOpenEdit ]         = useState( false );
    const [ isOpenDelete, setIsOpenDelete ]     = useState( false );


    // Pagination logic
    const paginatedData = useMemo(() => {
        if ( !data ) return [];

        const startIndex    = ( currentPage - 1 ) * itemsPerPage;
        const endIndex      = startIndex + itemsPerPage;

        return data.slice(startIndex, endIndex);
    }, [data, currentPage, itemsPerPage]);


    const totalPages    = Math.ceil(( data?.length || 0 ) / itemsPerPage );
    const startIndex    = ( currentPage - 1 ) * itemsPerPage;
    const endIndex      = startIndex + itemsPerPage;


    function onEditRequesDetail( detail: RequestDetail ) {
        console.log('🚀 ~ file: request-detail.tsx:47 ~ detail:', detail)
        setIsOpenEdit( true );
        setSelectedDetail( detail );
    }


    const deleteRequestDetailApi = async ( requestId: string ): Promise<Request> =>
        fetchApi<Request>( {
            url:`request-details/${requestId}`,
            method: Method.DELETE
        } );


    const deleteRequestDetailMutation = useMutation<Request, Error, string>({
        mutationFn: deleteRequestDetailApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUEST_DETAIL, request.id] });
            setIsOpenDelete( false );
            setSelectedDetail( initialRequestDetail );
            toast( 'Solicitud eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar solicitud: ${mutationError.message}`, errorToast )
    });

    
    function openDeleteDialog( requestDetail: RequestDetail ): void {
        setSelectedDetail( requestDetail );
        setIsOpenDelete( true );
    }

    const onSuccess = (): void => {
        setIsOpenEdit( false );
        setSelectedDetail( initialRequestDetail );
    };

    function handlePageChange(page: number): void {
        setCurrentPage(page);
    }

    function handleItemsPerPageChange(newItemsPerPage: number): void {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    }


    return (
        <div className="space-y-4">
            {/* Request Info */}
            <RequestInfoCard
                request = { request }
                onBack  = { onBack }
            />

            {/* Request Details */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Detalles de la Solicitud ({data?.length ?? 0})</h2>

                    <div className="flex items-end gap-4">
                        <Tabs
                            value           = { viewDetail }
                            onValueChange   = {( value ) => handleViewDetailChange( value as ViewDetailMode )}
                        >
                            <TabsList className="px-1 py-0">
                                <TabsTrigger value="card">
                                    <Grid2x2 className="h-5 w-5" />
                                </TabsTrigger>

                                <TabsTrigger value="table">
                                    <AlignJustify className="h-5 w-5" />
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>


                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Detalle
                    </Button>
                    </div>
                </div>

                {isError ? (
                    <RequestDetailErrorCard />
                ) : (
                    <>
                        {viewDetail === 'card' ? (
                            <RequestDetailList
                                data                = { paginatedData }
                                isLoading           = { isLoading }
                                onEdit              = { onEditRequesDetail }
                                onDelete            = { openDeleteDialog }
                                professors          = { professors ?? [] }
                                isLoadingProfessors = { isLoadingProfessors }
                                isErrorProfessors   = { isErrorProfessors }
                                modules             = { modules ?? [] }
                                isLoadingModules    = { isLoadingModules }
                                isErrorModules      = { isErrorModules }
                            />
                        ) : (
                            <RequestDetailTable
                                data                = { paginatedData }
                                isLoading           = { isLoading }
                                onEdit              = { onEditRequesDetail }
                                onDelete            = { openDeleteDialog }
                                professors          = { professors ?? [] }
                                isLoadingProfessors = { isLoadingProfessors }
                                isErrorProfessors   = { isErrorProfessors }
                                modules             = { modules ?? [] }
                                isLoadingModules    = { isLoadingModules }
                                isErrorModules      = { isErrorModules }
                            />
                        )}

                        {/* Pagination */}
                        {!isLoading && !isError && data && data.length > 0 && (
                            <DataPagination
                                currentPage             = { currentPage }
                                totalPages              = { totalPages }
                                totalItems              = { data.length }
                                itemsPerPage            = { itemsPerPage }
                                onPageChange            = { handlePageChange }
                                onItemsPerPageChange    = { handleItemsPerPageChange }
                                startIndex              = { startIndex }
                                endIndex                = { Math.min(endIndex, data.length) }
                            />
                        )}
                    </>
                )}

                <RequestDetailForm
                    requestDetail       = { selectedDetail }
                    onSuccess           = { onSuccess }
                    onCancel            = { () => setIsOpenEdit( false )}
                    isOpen              = { isOpenEdit }
                    onClose             = { () => setIsOpenEdit( false )}
                    requestId           = { request.id }
                    professors          = { professors ?? [] }
                    isLoadingProfessors = { isLoadingProfessors }
                    isErrorProfessors   = { isErrorProfessors }
                    modules             = { modules ?? [] }
                    isLoadingModules    = { isLoadingModules }
                    isErrorModules      = { isErrorModules }
                />

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmDialog
                    isOpen      = { isOpenDelete }
                    onClose     = { () => setIsOpenDelete( false )}
                    onConfirm   = { () => deleteRequestDetailMutation.mutate( selectedDetail.id || '') }
                    name        = { selectedDetail.id || '' }
                    type        = "el Detalle"
                />
            </div>
        </div>
    );
}
