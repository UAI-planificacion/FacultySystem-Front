'use client'

import { useState } from "react";

import { Ban, CircleCheckBig }          from "lucide-react";
import { useMutation, useQueryClient }  from "@tanstack/react-query";
import { toast }                        from "sonner";

import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Button }               from "@/components/ui/button";

import { fetchApi, Method }         from "@/services/fetch";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { OfferSection }             from "@/types/offer-section.model";
import { ENV }                      from "@/config/envs/env";


interface Props {
    section : OfferSection;
}


export function ChangeStatusSection({
    section
}: Props ) {
    const queryClient                       = useQueryClient();
    const [ isOpenAlert, setIsOpenAlert ]   = useState( false );


    const updateSectionApi = async (): Promise<any> =>
        fetchApi({
            url     : `${ENV.ENDPOINT_SECTIONS}changeStatus/${section.id}`,
            method  : Method.PATCH,
        });


    const updateSectionMutation = useMutation({
        mutationFn  : updateSectionApi,
        onSuccess   : () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECTIONS] });
            const isOpen = section.isClosed
            toast( `Sección ${ isOpen ? 'Cerrada' : 'Abierta' } exitosamente`, successToast );
            setIsOpenAlert( false );
        },
        onError: ( mutationError: any ) => toast( `Error al cambiar el estado de la sección: ${mutationError.message}`, errorToast )
    });


    const handleToggleSectionStatus = ( ) => {
        updateSectionMutation.mutate();
    };


    return (
        <>
            <Button
                title       = { section.isClosed ? "Abrir Sección" : "Cerrar Sección" }
                variant     = "outline"
                size        = "icon"
                onClick     = { () => setIsOpenAlert( true )}
                aria-label  = { section.isClosed ? "Abrir sección" : "Cerrar sección" }
            >
                { !section.isClosed
                    ? <Ban className="h-4 w-4 text-red-500" />
                    : <CircleCheckBig className="h-4 w-4 text-green-500" />
                }
            </Button>

            <DeleteConfirmDialog
                isOpen      = { isOpenAlert }
                onClose     = { () => setIsOpenAlert( false )}
                onConfirm   = { handleToggleSectionStatus }
                name        = { `SSEC: ${ section.subject.id }-${ section.code }` }
                type        = { "la Sección" }
                isDeleted   = { false }
                isClosed    = { section.isClosed }
            />
        </>
    );
}
