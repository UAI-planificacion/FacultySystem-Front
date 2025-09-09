'use client'

import React, { useMemo, useState } from "react"

import { ChevronDown, ChevronRight, Plus }  from "lucide-react"
import { useMutation, useQueryClient }      from "@tanstack/react-query"
import { toast }                            from "sonner"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                                   from "@/components/ui/table"
import {
    SectionGroup,
    SessionCount,
}                                   from "@/components/section/types";
import { Button }                   from "@/components/ui/button"
import { Checkbox }                 from "@/components/ui/checkbox"
import { Badge }                    from "@/components/ui/badge"
import { ActiveBadge }              from "@/components/shared/active"
import { ActionButton }             from "@/components/shared/action"
import { ChangeStatusSection }      from "@/components/section/change-status"
import { SectionDetailExpanded }    from "@/components/section/section-detail.expanded"
import { DeleteConfirmDialog }      from "@/components/dialog/DeleteConfirmDialog"
import { SectionFormGroup }         from "@/components/section/section-form-group"

import { Section, Session } from "@/types/section.model"
import { fetchApi, Method } from "@/services/fetch"
import { KEY_QUERYS }       from "@/consts/key-queries"

import { errorToast, successToast } from "@/config/toast/toast.config"
import { ENV }                      from "@/config/envs/env"


interface PaginetedGroup {
    groups      : SectionGroup[];
    totalItems  : number;
    totalPages  : number;
}


interface Props {
    filteredAndPaginatedGroups  : PaginetedGroup;
    sectionsData                : Section[] | undefined;
    isLoadingSections           : boolean;
    isErrorSections             : boolean;
}


const getDayAbbreviation = ( day: number ): string => {
    const dayMap: { [key: number]: string } = {
        1: 'L',
        2: 'M',
        3: 'X',
        4: 'J',
        5: 'V',
        6: 'S',
        7: 'D'
    };

    return dayMap[day] || 'N/A';
};


export function SectionGroupTable({
    filteredAndPaginatedGroups,
    sectionsData,
    isLoadingSections,
    isErrorSections,
}: Props ) {
    const queryClient                                   = useQueryClient();
    const [ expandedGroups, setExpandedGroups ]         = useState<Set<string>>( new Set() );
    const [ selectedGroups, setSelectedGroups ]         = useState<Set<string>>( new Set() );
    const [ selectedSections, setSelectedSections ]     = useState<Set<string>>( new Set() );
    const [ selectedGroupEdit, setSelectedGroupEdit ]   = useState<SectionGroup | null>( null );
    const [ isEditDialogOpen, setIsEditDialogOpen ]     = useState<boolean>( false );
    const [ isOpenDelete, setIsOpenDelete ]             = useState( false );
    const [ selectedGroup, setSelectedGroup ]           = useState<SectionGroup | undefined>( undefined );


    function toggleGroupExpansion( groupId: string ): void {
        setExpandedGroups(( prev ) => {
            const newSet = new Set( prev );

            if ( newSet.has( groupId ) ) {
                newSet.delete( groupId );
            } else {
                newSet.add( groupId );
            }

            return newSet;
        });
    };


    const isGroupFullySelected = ( group: SectionGroup ): boolean =>
        selectedGroups.has( group.groupId );


    const groupedSections = useMemo(() => {
        const groups: { [key: string]: SectionGroup } = {};

        sectionsData?.forEach(( section ) => {
            const groupId = section.groupId;

            if ( !groups[groupId] ) {
                groups[groupId] = {
                    groupId         : groupId,
                    code            : section.code,
                    period          : section.period,
                    sessionCounts   : {
                        [Session.C] : 0,
                        [Session.A] : 0,
                        [Session.T] : 0,
                        [Session.L] : 0
                    },
                    schedule        : '',
                    isOpen          : !section.isClosed,
                    sections        : []
                };
            }

            groups[groupId].sections.push( section );
            groups[groupId].sessionCounts[section.session]++;
        } );

        // Generate schedule for each group
        Object.values( groups ).forEach( ( group ) => {
            const scheduleSet = new Set<string>();

            group.sections.forEach(( section ) => {
                const dayAbbr       = getDayAbbreviation( section?.day || 1 );
                const scheduleItem  = `${dayAbbr}-${section.moduleId}`;
                scheduleSet.add( scheduleItem );
            });

            group.schedule = Array.from( scheduleSet ).sort().join( ', ' );
        } );

        return Object.values( groups );
    }, [ sectionsData ] );


    function handleGroupSelection( groupId: string, checked: boolean ): void {
        setSelectedGroups( ( prev ) => {
            const newSet = new Set( prev );

            if ( checked ) {
                newSet.add( groupId );
            } else {
                newSet.delete( groupId );
            }

            return newSet;
        });

        // Auto-select/deselect all sections in the group
        const group = Object.values( groupedSections ).find( g => g.groupId === groupId );

        if ( !group ) return;

        setSelectedSections( ( prev ) => {
            const newSet = new Set( prev );

            group.sections.forEach( ( section ) => {
                if ( checked ) {
                    newSet.add( section.id );
                } else {
                    newSet.delete( section.id );
                }
            } );

            return newSet;
        });
    };


    function isGroupPartiallySelected( group: SectionGroup ): boolean {
        const groupSectionIds       = group.sections.map( s => s.id );
        const selectedGroupSections = groupSectionIds.filter( id => selectedSections.has( id ));

        return selectedGroupSections.length > 0 && selectedGroupSections.length < groupSectionIds.length;
    };


    function formatSessionCounts( sessionCounts: SessionCount ): string {
        const counts: string[] = [];

        if ( sessionCounts[Session.C] > 0 ) counts.push( `${sessionCounts[Session.C]}C` );
        if ( sessionCounts[Session.A] > 0 ) counts.push( `${sessionCounts[Session.A]}A` );
        if ( sessionCounts[Session.T] > 0 ) counts.push( `${sessionCounts[Session.T]}T` );
        if ( sessionCounts[Session.L] > 0 ) counts.push( `${sessionCounts[Session.L]}L` );

        return counts.join( ', ' );
    };


    function handleEditGroup( group: SectionGroup ): void {
        setSelectedGroupEdit( group );
        setIsEditDialogOpen( true );
    };


    function handleDeleteGroup( group: SectionGroup ): void {
        setSelectedGroup( group );
        setIsOpenDelete( true );
    };


    function handleSectionSelection( sectionId: string, groupId: string ): void {
        const isCurrentlySelected   = selectedSections.has( sectionId );
        const checked               = !isCurrentlySelected;

        setSelectedSections( ( prev ) => {
            const newSet = new Set( prev );

            if ( checked ) {
                newSet.add( sectionId );
            } else {
                newSet.delete( sectionId );
            }

            return newSet;
        } );

        // Check if we need to update group selection
        const group = groupedSections.find( g => g.groupId === groupId );

        if ( !group ) return;

        const groupSectionIds       = group.sections.map( s => s.id );
        const selectedGroupSections = groupSectionIds.filter( id => 
            checked
                ? ( selectedSections.has( id ) || id === sectionId )
                : ( selectedSections.has( id ) && id !== sectionId )
        );

        setSelectedGroups( ( prev ) => {
            const newSet = new Set( prev );

            if ( selectedGroupSections.length === groupSectionIds.length ) {
                newSet.add( groupId );
            } else {
                newSet.delete( groupId );
            }

            return newSet;
        });
    };


    function handleCloseEditDialog(): void {
        setIsEditDialogOpen( false );
        setSelectedGroupEdit( null );
    };


    const deleteGroupApi = async ( groupId: string ): Promise<void> =>
        fetchApi<void>( {
            isApi   : false,
            url     : `${ENV.ACADEMIC_SECTION}Sections/groupId/${groupId}`,
            method  : Method.DELETE
        });


    const deleteGroupMutation = useMutation<void, Error, string>({
        mutationFn: deleteGroupApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECCTIONS] });
            setIsOpenDelete( false );
            setSelectedGroup( undefined );
            toast( 'Grupo eliminado exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar grupo: ${mutationError.message}`, errorToast )
    });


    function handleConfirmDeleteGroup(): void {
        if ( selectedGroup && 'groupId' in selectedGroup ) {
            deleteGroupMutation.mutate( selectedGroup.groupId );
        }
    };


    return (
        <>
            <Table className="min-w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead className="w-12">Seleccionar</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Sesiones</TableHead>
                        <TableHead>Horario</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {isLoadingSections ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                                Cargando secciones...
                            </TableCell>
                        </TableRow>
                    ) : isErrorSections ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-red-500">
                                Error al cargar las secciones
                            </TableCell>
                        </TableRow>
                    ) : filteredAndPaginatedGroups.groups.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                {sectionsData && sectionsData.length > 0 
                                    ? 'No se encontraron grupos con los filtros aplicados' 
                                    : 'No hay grupos disponibles'
                                }
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredAndPaginatedGroups.groups.map(( group ) => (
                            <React.Fragment key={group.groupId}>
                                {/* Group Row */}
                                <TableRow className="">
                                    <TableCell>
                                        <Button
                                            variant     = "outline"
                                            size        = "sm"
                                            onClick     = {() => toggleGroupExpansion( group.groupId )}
                                            className   = "p-1 h-8 w-8"
                                        >
                                            {expandedGroups.has( group.groupId )
                                                ? <ChevronDown className="h-4 w-4" />
                                                : <ChevronRight className="h-4 w-4" />
                                            }
                                        </Button>
                                    </TableCell>

                                    <TableCell>
                                        <Checkbox
                                            checked         = { isGroupFullySelected( group ) }
                                            onCheckedChange = {( checked ) => handleGroupSelection( group.groupId, checked as boolean )}
                                            className       = { isGroupPartiallySelected( group ) ? "data-[state=unchecked]:bg-blue-100 w-5 h-5" : " w-5 h-5" }
                                            aria-label      = "Seleccionar grupo"
                                            disabled        = { !group.isOpen }
                                        />
                                    </TableCell>

                                    <TableCell className="font-medium">{ group.code }</TableCell>

                                    <TableCell>
                                        <Badge variant="outline">
                                            { formatSessionCounts( group.sessionCounts )}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>{ group.schedule }</TableCell>

                                    <TableCell>{ group.period }</TableCell>

                                    <TableCell>
                                        <ActiveBadge
                                            isActive        = { group.isOpen }
                                            activeText      = "Abierto"
                                            inactiveText    = "Cerrado"
                                        />
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                title   = "Agregar Sección"
                                                size    = "icon"
                                                variant = "outline"
                                                onClick = { () => {} }
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>

                                            <ActionButton
                                                editItem        = {() => handleEditGroup( group )}
                                                deleteItem      = {() => handleDeleteGroup( group )}
                                                item            = { group }
                                                isDisabledEdit  = { !group.isOpen }
                                            />

                                            <ChangeStatusSection group = { group } />
                                        </div>
                                    </TableCell>
                                </TableRow>

                                {/* Expanded Sections */}
                                {expandedGroups.has( group.groupId ) && (
                                    <SectionDetailExpanded
                                        group               = { group }
                                        selectedSections    = { selectedSections }
                                        handleSectionSelection = { handleSectionSelection }
                                    />
                                )}
                            </React.Fragment>
                        ))
                    )}
                </TableBody>
            </Table>

            <SectionFormGroup
                isOpen              = { isEditDialogOpen }
                onClose             = { handleCloseEditDialog }
                group               = { selectedGroupEdit }
                existingGroups      = { groupedSections }
            />

            <DeleteConfirmDialog
                isOpen      = { isOpenDelete }
                onClose     = { () => setIsOpenDelete( false )}
                onConfirm   = { handleConfirmDeleteGroup }
                name        = { selectedGroup && 'code' in selectedGroup ? `${selectedGroup.code} ${selectedGroup.period}` : '' }
                type        = { "el Grupo" }
            />
        </>
    );
}
