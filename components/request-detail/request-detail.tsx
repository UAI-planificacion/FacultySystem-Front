"use client"

import { useState } from "react"

import {
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    User,
    Calendar,
    MapPin,
    Users,
    Building2,
} from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
}                           from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
}                           from "@/components/ui/card";
import { Badge }            from "@/components/ui/badge";
import { Button }           from "@/components/ui/button";
import RequestDetailForm    from "@/components/request-detail/request-detail-form";
import {RequestInfoCard} from "@/components/request-detail/request-info-card";

import { type Request, type RequestDetail, Status } from "@/types/request";
import { useQuery } from "@tanstack/react-query";
import { KEY_QUERYS } from "@/consts/key-queries";
import { fetchData } from "@/services/fetch";
import { RequestDetailCard } from "./request-detail-card";


interface RequestDetailViewProps {
    request : Request;
    onBack  : () => void;
    // onUpdateRequest : (request: Request) => void
}


export default function RequestDetailView({
    request,
    onBack,
    // onUpdateRequest
}: RequestDetailViewProps ): JSX.Element {

    const {
        data,
        isLoading,
        error,
        isError,
        refetch
    } = useQuery({
        queryKey    : [ KEY_QUERYS.REQUEST_DETAIL, request.id ],
        queryFn     : () => fetchData<RequestDetail[]>( `request-details/request/${request.id}` ),
        // enabled,
    });


    const [editingDetail, setEditingDetail] = useState<RequestDetail | null>(null)
    const [isAddingDetail, setIsAddingDetail] = useState(false)

    // function handleAddDetail(
    //     detail: Omit<RequestDetail, "id" | "requestId" | "createdAt" | "updatedAt">
    // ): void {
    //     const newDetail: RequestDetail = {
    //         ...detail,
    //         id: `temp_${Date.now()}`,
    //         requestId: request.id,
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //     }

    //     const updatedRequest = {
    //         ...request,
    //         details: [...request.details, newDetail],
    //     }

    //     onUpdateRequest( updatedRequest );
    //     setIsAddingDetail( false );
    // }

    // function handleUpdateDetail( updatedDetail: RequestDetail ): void {
    //     const updatedRequest = {
    //         ...request,
    //         details: request.details.map((detail) => (detail.id === updatedDetail.id ? updatedDetail : detail)),
    //     }

    //     onUpdateRequest( updatedRequest );
    //     setEditingDetail( null );
    // }


    // function handleDeleteDetail( detailId: string ): void {
    //     const updatedRequest = {
    //         ...request,
    //         details: request.details.filter(( detail ) => detail.id !== detailId ),
    //     }

    //     onUpdateRequest( updatedRequest );
    // }


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

                    <Dialog open={isAddingDetail} onOpenChange={setIsAddingDetail}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Detalle
                            </Button>
                        </DialogTrigger>

                        {/* <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Agregar Nuevo Detalle</DialogTitle>
                            </DialogHeader>

                            <RequestDetailForm onSubmit={handleAddDetail} onCancel={() => setIsAddingDetail(false)} />
                        </DialogContent> */}
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.map((detail) => (
                        <RequestDetailCard
                            key={detail.id}
                            detail={detail}
                            setEditingDetail={setEditingDetail}
                        />
                    ))}
                </div>

                {data?.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-muted-foreground">No hay detalles para esta solicitud.</p>

                            <Button className="mt-4" onClick={() => setIsAddingDetail(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Primer Detalle
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
