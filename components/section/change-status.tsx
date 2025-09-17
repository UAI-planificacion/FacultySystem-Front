'use client'

import { useState } from "react";

import { Ban, CircleCheckBig }          from "lucide-react";
import { useMutation, useQueryClient }  from "@tanstack/react-query";
import { toast }                        from "sonner";

import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Button }               from "@/components/ui/button";
import { SectionGroup }         from "@/components/section/types";

import { fetchApi, Method }         from "@/services/fetch";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { errorToast, successToast } from "@/config/toast/toast.config";


interface Props {
    group: SectionGroup;
}


export function ChangeStatusSection({
    group
}: Props ) {
    const queryClient                       = useQueryClient();
    const [ isOpenAlert, setIsOpenAlert ]   = useState( false );


    const updateGroupApi = async (): Promise<any> =>
        fetchApi({
            url     : `Sections/changeStatus/${group.groupId}`,
            method  : Method.PATCH,
        });


    const updateGroupMutation = useMutation({
        mutationFn  : updateGroupApi,
        onSuccess   : () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECCTIONS] });
            const isOpen = group.isOpen
            toast( `Grupo ${ isOpen ? 'Cerrado' : 'Abierto' } exitosamente`, successToast );
            setIsOpenAlert( false );
        },
        onError: ( mutationError: any ) => toast( `Error al actualizar el grupo: ${mutationError.message}`, errorToast )
    });


    const handleToggleGroupStatus = ( ) => {
        updateGroupMutation.mutate();
    };


    return (
        <>
            <Button
                title       = { group.isOpen ? "Cerrar Grupo" : "Abrir Grupo" }
                variant     = "outline"
                size        = "icon"
                onClick     = { () => setIsOpenAlert( true )}
                aria-label  = { group.isOpen ? "Cerrar grupo" : "Abrir grupo" }
            >
                { group.isOpen
                    ? <Ban className="h-4 w-4 text-red-500" />
                    : <CircleCheckBig className="h-4 w-4 text-green-500" />
                }
            </Button>

            <DeleteConfirmDialog
                isOpen      = { isOpenAlert }
                onClose     = { () => setIsOpenAlert( false )}
                onConfirm   = { handleToggleGroupStatus }
                name        = { `${ group.code } ${ group.period }` }
                type        = { "el Grupo" }
                isDeleted   = { false }
                isClosed    = { !group.isOpen }
            />
        </>
    );
}
