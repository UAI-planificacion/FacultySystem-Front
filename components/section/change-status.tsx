'use client'

import { JSX, useState } from "react";

import {
    Ban,
    CircleCheckBig,
    CircleDot
}                                       from "lucide-react";
import { useMutation, useQueryClient }  from "@tanstack/react-query";
import { toast }                        from "sonner";

import { DropdownMenuItem }     from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Button }               from "@/components/ui/button";

import { fetchApi, Method }         from "@/services/fetch";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { OfferSection }             from "@/types/offer-section.model";
import { ENV }                      from "@/config/envs/env";


interface Props {
    section             : OfferSection;
    selectedSections?   : Set<string>;
    onDeselectSection?  : ( sectionId: string ) => void;
}


export function ChangeStatusSection({
    section,
    selectedSections,
    onDeselectSection
}: Props ): JSX.Element {
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

            // Si se está cerrando la sección (actualmente abierta) y está seleccionada, deseleccionarla
            if ( !section.isClosed && selectedSections?.has( section.id ) && onDeselectSection ) {
                onDeselectSection( section.id );
            }
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
                onSelect    = {( e ) => e.preventDefault()}
                onClick     = {( e ) => {
                    e.preventDefault();
                    setIsOpenAlert( true );
                }}
            >
                {/* <CircleDot className="h-4 w-4" /> */}
                <Ban className="h-4 w-4 text-red-500" />

                {/* { !section.isClosed
                    ? (
                        <>
                            <span>Cerrar Sección</span>
                            <Ban className="h-4 w-4 text-red-500" />
                        </>
                    )
                    : (
                        <>
                            <span>Abrir Sección</span>
                            <CircleCheckBig className="h-4 w-4 text-green-500" />
                        </>
                    )
                } */}
            </Button>

            {/* <DropdownMenuItem
                title       = { section.isClosed ? "Abrir Sección" : "Cerrar Sección" }
                onClick     = {( e ) => {
                    e.preventDefault();
                    setIsOpenAlert( true );
                }}
                onSelect    = {( e ) => e.preventDefault()}
                className   = "cursor-pointer gap-2"
            >
                <CircleDot className="h-4 w-4" />

                { !section.isClosed
                    ? (
                        <>
                            <span>Cerrar Sección</span>
                            <Ban className="h-4 w-4 text-red-500" />
                        </>
                    )
                    : (
                        <>
                            <span>Abrir Sección</span>
                            <CircleCheckBig className="h-4 w-4 text-green-500" />
                        </>
                    )
                }
            </DropdownMenuItem> */}

            <DeleteConfirmDialog
                isOpen      = { isOpenAlert }
                onClose     = { () => setIsOpenAlert( false )}
                onConfirm   = { handleToggleSectionStatus }
                name        = { `SSEC: ${ section.subject.id }-${ section.code }` }
                type        = { "la Sección" }
                isDeleted   = { false }
                confirmText = { section.isClosed ? "Abrir" : "Cerrar" }
                secondText  = { section.isClosed ? "abrirá" : "cerrará" }
            />
        </>
    );
}
