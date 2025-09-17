'use client'

import { JSX, useState } from "react";

import { useMutation, useQueryClient }  from "@tanstack/react-query";
import { toast }                        from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                               from "@/components/ui/table"
import { ActionButton }         from "@/components/shared/action";
import { Badge }                from "@/components/ui/badge";
import { Checkbox }             from "@/components/ui/checkbox";
import { SessionName }          from "@/components/section/session-name";
import { SectionForm }          from "@/components/section/section-form";
import { SectionGroup }         from "@/components/section/types";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";

import { Section }                  from "@/types/section.model";
import { fetchApi, Method }         from "@/services/fetch";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { errorToast, successToast } from "@/config/toast/toast.config";


interface Props {
    group                   : SectionGroup;
    selectedSections        : Set<string>
    handleSectionSelection  : ( sectionId: string, groupId: string ) => void;
}


const days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
];


export function SectionDetailExpanded({
    group,
    selectedSections,
    handleSectionSelection
}: Props ): JSX.Element {
    const queryClient                                   = useQueryClient();
    const [isEditSection, setIsEditSection]             = useState<boolean>( false );
    const [selectedSectionEdit, setSelectedSectionEdit] = useState<Section | null>( null );
    const [isOpenAlert, setIsOpenAlert]                 = useState<boolean>( false );
    const [selectedAlert, setSelectedAlert]             = useState<Section | undefined>( undefined );


    const handleCloseSectionDialog = () => {
        setIsEditSection( false );
        setSelectedSectionEdit( null );
    };


    const handleSaveSection = ( updatedSection: Section ) => {
        console.log( 'Save section:', updatedSection );
        setIsEditSection( false );
        setSelectedSectionEdit( null );
    };


    const handleEdit = ( section: Section ) => {
        setSelectedSectionEdit( section );
        setIsEditSection( true );
    };


    const deleteSectionApi = async ( sectionId: string ): Promise<void> =>
        fetchApi<void>( {
            url     : `Sections/${sectionId}`,
            method  : Method.DELETE
        });


        const deleteSectionMutation = useMutation<void, Error, string>({
        mutationFn: deleteSectionApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECCTIONS] });
            setIsOpenAlert( false );
            setSelectedAlert( undefined );
            toast( 'Sección eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar sección: ${mutationError.message}`, errorToast )
    });


    const handleConfirmDeleteSection = () => {
        if ( selectedAlert ) {
            deleteSectionMutation.mutate( selectedAlert.id );
        }
    };


    function handleDelete( section: Section ) {
        setSelectedAlert( section );
        setIsOpenAlert( true );
    }


    return (
        <>
            <TableRow>
                <TableCell colSpan={9} className="p-0">
                    <div className="border-l-4 ml-16">
                        <Table>
                            <TableHeader>
                                <TableRow className="">
                                    <TableHead className="w-12">Seleccionar</TableHead>
                                    <TableHead className="pl-12">Sesión</TableHead>
                                    <TableHead>Tamaño</TableHead>
                                    <TableHead>Sala</TableHead>
                                    <TableHead>Profesor</TableHead>
                                    <TableHead>Día</TableHead>
                                    <TableHead>Módulo</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {group.sections.map(( section ) => (
                                    <TableRow key={section.id} className="border-l-4 border-transparent">
                                        <TableCell className="w-12">
                                            <Checkbox
                                                checked         = { selectedSections.has( section.id ) }
                                                onCheckedChange = {() => handleSectionSelection( section.id, group.groupId )}
                                                aria-label      = "Seleccionar sección"
                                                className       = "w-5 h-5"
                                                disabled        = { !group.isOpen }
                                            />
                                        </TableCell>

                                        <TableCell className="pl-12">
                                            <SessionName session={ section.session } />
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant={section.size ? 'default': 'outline'}>
                                                { section.size ?? '-' }
                                            </Badge>
                                        </TableCell>

                                        <TableCell>{ section.room ?? '-' }</TableCell>

                                        <TableCell>{ section.professor?.name ?? '-' }</TableCell>

                                        <TableCell>{ days[(section.day?.id ?? -1) - 1] ?? '-' }</TableCell>

                                        <TableCell title={ section.module?.code ? `M${section.module.code}${ section.module.diference ? `-${section.module.diference}` : '' } ${section.module.startHour}:${section.module.endHour}` : '' }>
                                            { section.module?.code ? `M${section.module.code} ${ section.module.diference ? `-${section.module.diference}` : '' }` : '-' }
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <ActionButton
                                                editItem            = {() => handleEdit( section )}
                                                deleteItem          = {() => handleDelete( section )}
                                                item                = { section }
                                                isDisabledEdit      = { !group.isOpen }
                                                isDisabledDelete    = { !group.isOpen }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TableCell>
            </TableRow>

            {/* Edit Section Dialog */}
            <SectionForm
                isOpen  = { isEditSection }
                onClose = { handleCloseSectionDialog }
                section = { selectedSectionEdit }
                onSave  = { handleSaveSection }
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen      = { isOpenAlert }
                onClose     = { () => setIsOpenAlert( false )}
                onConfirm   = { handleConfirmDeleteSection }
                name        = { selectedAlert ? `${selectedAlert.code} - ${selectedAlert.session}` : '' }
                type        = { "la Sección" }
            />
        </>
    );
}
