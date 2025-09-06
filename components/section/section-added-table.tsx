'use client'

import React, { useState, useMemo, useEffect } from 'react';

import {
    Ban,
    CircleCheckBig,
    ChevronDown,
    ChevronRight,
    Pencil
}                   from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
}                               from '@/components/ui/table';
import { DataPagination }       from '@/components/ui/data-pagination';
import { Label }                from '@/components/ui/label';
import { Badge }                from '@/components/ui/badge';
import { ActiveBadge }          from '@/components/shared/active';
import { SessionName }          from '@/components/section/session-name';
import { Card, CardContent, CardFooter }    from '@/components/ui/card';
import { Button }               from '@/components/ui/button';
import { MultiSelectCombobox }  from '@/components/shared/Combobox';
import { Checkbox }             from '@/components/ui/checkbox';
import { ActionButton }         from '@/components/shared/action';
import { SectionFormGroup }     from '@/components/section/section-form-group';
import { SectionForm }          from '@/components/section/section-form';
import { useSpace }             from '@/hooks/use-space';

import { Section, Session } from '@/types/section.model';
import { Subject }          from '@/types/subject.model';
import { Module, SizeResponse } from '@/types/request';
import { Size }             from '@/types/request-detail.model';
import { KEY_QUERYS }       from '@/consts/key-queries';
import { fetchApi, Method }         from '@/services/fetch';
import { ENV }              from '@/config/envs/env';
import { DeleteConfirmDialog } from '../dialog/DeleteConfirmDialog';
import { toast } from 'sonner';
import { errorToast, successToast } from '@/config/toast/toast.config';


interface Option {
    id      : string;
    label   : string;
    value   : string;
}

interface SessionCount {
    [Session.C] : number;
    [Session.A] : number;
    [Session.T] : number;
    [Session.L] : number;
}


interface SectionGroup {
    groupId         : string;
    code            : number;
    period          : string;
    sessionCounts   : SessionCount;
    schedule        : string;
    isOpen          : boolean;
    sections        : Section[];
}


interface Props {
    onEdit?             : ( section: Section ) => void;
    onDelete?           : ( section: Section ) => void;
    subjectId           : string;
    facultyId           : string;
    enabled             : boolean;
    isLoadingPeriods    : boolean;
    memoizedPeriods     : Option[];
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

/// 2 Tamaño, para editar por grupo
    type AlertType = 'group'| 'section' | 'close' | undefined;


export function SectionAddedTable({
    onEdit,
    onDelete,
    enabled,
    subjectId,
    facultyId,
    isLoadingPeriods,
    memoizedPeriods,
}: Props ) {
    // const queryClient                           = useQueryClient();
    const [codeFilter, setCodeFilter]                   = useState<string[]>( [] );
    const [roomFilter, setRoomFilter]                   = useState<string[]>( [] );
    const [dayFilter, setDayFilter]                     = useState<string[]>( [] );
    const [periodFilter, setPeriodFilter]               = useState<string[]>( [] );
    const [statusFilter, setStatusFilter]               = useState<string[]>( [] );
    const [subjectFilter, setSubjectFilter]             = useState<string[]>( [] );
    const [sizeFilter, setSizeFilter]                   = useState<string[]>( [] );
    const [sessionFilter, setSessionFilter]             = useState<string[]>( [] );
    const [moduleFilter, setModuleFilter]               = useState<string[]>( [] );
    const [expandedGroups, setExpandedGroups]           = useState<Set<string>>( new Set() );
    const [selectedGroups, setSelectedGroups]           = useState<Set<string>>( new Set() );
    const [selectedSections, setSelectedSections]       = useState<Set<string>>( new Set() );
    const [currentPage, setCurrentPage]                 = useState<number>( 1 );
    const [itemsPerPage, setItemsPerPage]               = useState<number>( 10 );
    const [isEditDialogOpen, setIsEditDialogOpen]       = useState<boolean>( false );
    const [selectedGroupEdit, setSelectedGroupEdit]     = useState<SectionGroup | null>( null );
    const [isEditSection, setIsEditSection]             = useState<boolean>( false );
    const [selectedSectionEdit, setSelectedSectionEdit] = useState<Section | null>( null );
    const [ isOpenAlert, setIsOpenAlert ]               = useState( false );
    const [selectedAlert, setSelectedAlert]             = useState<Section | SectionGroup | undefined>( undefined );
    const [alertType, setAlertType]                     = useState<AlertType>( undefined );


    const {
        data        : sectionsData,
        isLoading   : isLoadingSections,
        isError     : isErrorSections
    } = useQuery<Section[]>({
        enabled,
        queryKey: [ KEY_QUERYS.SECCTIONS, subjectId ],
        queryFn : () => fetchApi({
            isApi   : false,
            url     : `${ENV.ACADEMIC_SECTION}Sections/subjectId/${subjectId}`,
        }),
    });


    const {
        data        : subjects,
        isLoading   : isLoadingSubjects,
        isError     : isErrorSubjects
    } = useQuery<Subject[]>({
        queryKey: [KEY_QUERYS.SUBJECTS, facultyId],
        queryFn : () => fetchApi({ url: `subjects/all/${facultyId}` }),
        enabled: !!facultyId,
    });


    const {
        data        : sizes,
        isLoading   : isLoadingSizes,
        isError     : isErrorSizes,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.SIZE ],
        queryFn     : () => fetchApi<SizeResponse[]>({ url: `${ENV.ACADEMIC_SECTION}sizes`, isApi: false }),
    });


    const {
        data        : modules,
        isLoading   : isLoadingModules,
        isError     : isErrorModules,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.MODULES ],
        queryFn     : () => fetchApi<Module[]>({ url: `${ENV.ACADEMIC_SECTION}modules/original`, isApi: false }),
    });


    // Handle edit action
    const handleEdit = ( section: Section ) => {
        setSelectedSectionEdit( section );
        setIsEditSection( true );
    };


    // Handle delete action
    const handleClosed = ( section: Section, isClosed: boolean ) => {
        if ( onDelete ) {
            onDelete( section );
        } else {
            console.log( 'Eliminar sección:', section );
        }
    };

    // Get unique codes from sections data
    const uniqueCodes = useMemo(() => {
        if ( !sectionsData ) return [];
        const codes = Array.from(new Set( sectionsData.map( section => section.code.toString() )));
        return codes.sort();
    }, [ sectionsData ]);

    // Use space hook for rooms
    const {
        spaces      : rooms,
        isLoading   : isLoadingRooms,
        isError     : isErrorRooms
    } = useSpace({ enabled: true });

    // Days of the week
    const daysOfWeek = useMemo(() => [
        { value: '1', label: 'Lunes' },
        { value: '2', label: 'Martes' },
        { value: '3', label: 'Miércoles' },
        { value: '4', label: 'Jueves' },
        { value: '5', label: 'Viernes' },
        { value: '6', label: 'Sábado' },
        { value: '7', label: 'Domingo' },
    ], []);

    // Helper function to get day abbreviation
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

    // Group sections by groupId
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


    // Function to format session counts
    const formatSessionCounts = ( sessionCounts: SessionCount ): string => {
        const counts: string[] = [];

        if ( sessionCounts[Session.C] > 0 ) counts.push( `${sessionCounts[Session.C]}C` );
        if ( sessionCounts[Session.A] > 0 ) counts.push( `${sessionCounts[Session.A]}A` );
        if ( sessionCounts[Session.T] > 0 ) counts.push( `${sessionCounts[Session.T]}T` );
        if ( sessionCounts[Session.L] > 0 ) counts.push( `${sessionCounts[Session.L]}L` );

        return counts.join( ', ' );
    };


    // Function to toggle group expansion
    const toggleGroupExpansion = ( groupId: string ) => {
        setExpandedGroups( ( prev ) => {
            const newSet = new Set( prev );
            if ( newSet.has( groupId ) ) {
                newSet.delete( groupId );
            } else {
                newSet.add( groupId );
            }
            return newSet;
        } );
    };


    // Group action handlers
    const handleEditGroup = ( group: SectionGroup ) => {
        setSelectedGroupEdit( group );
        setIsEditDialogOpen( true );
    };


    const handleToggleGroupStatus = ( group: SectionGroup ) => {
        // TODO: Implement group status toggle functionality
        console.log( 'Toggle group status:', group );
        setAlertType( "close" );
        setSelectedAlert( group );
        setIsOpenAlert( true );
        // setIsOpenClosed( true );
    };


    const handleDeleteGroup = ( group: SectionGroup ) => {
        // TODO: Implement group delete functionality
        setAlertType( "group" );
        setSelectedAlert( group );
        setIsOpenAlert( true );
        console.log( 'Delete group:', group );
        // setSelectedGroup( group );
        // setIsOpenClosed( true );
    };


    // Handle form dialog close
    const handleCloseEditDialog = () => {
        setIsEditDialogOpen( false );
        setSelectedGroupEdit( null );
    };


    // Handle group save
    const handleSaveGroup = ( updatedGroup: SectionGroup ) => {
        // TODO: Implement API call to update group
        console.log( 'Saving updated group:', updatedGroup );
        // Here you would typically make an API call to update the group
        // After successful update, you might want to refetch the sections data
    };


    const handleCloseSectionDialog = () => {
        setIsEditSection( false );
        setSelectedSectionEdit( null );
    };


    const handleSaveSection = ( updatedSection: Section ) => {
        console.log( 'Save section:', updatedSection );
        // TODO: Implement save section functionality
        setIsEditSection( false );
        setSelectedSectionEdit( null );
    };


    // Selection handlers
    const handleGroupSelection = ( groupId: string, checked: boolean ) => {
        setSelectedGroups( ( prev ) => {
            const newSet = new Set( prev );
            if ( checked ) {
                newSet.add( groupId );
            } else {
                newSet.delete( groupId );
            }
            return newSet;
        } );

        // Auto-select/deselect all sections in the group
        const group = Object.values( groupedSections ).find( g => g.groupId === groupId );
        if ( group ) {
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
            } );
        }
    };


    const handleSectionSelection = ( sectionId: string, groupId: string ) => {
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

        if ( group ) {
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
        }
    };


    // Check if group is partially selected
    const isGroupPartiallySelected = ( group: SectionGroup ): boolean => {
        const groupSectionIds       = group.sections.map( s => s.id );
        const selectedGroupSections = groupSectionIds.filter( id => selectedSections.has( id ));

        return selectedGroupSections.length > 0 && selectedGroupSections.length < groupSectionIds.length;
    };


    // Check if all sections in group are selected
    const isGroupFullySelected = ( group: SectionGroup ): boolean => {
        return selectedGroups.has( group.groupId );
    };


    // Filter and paginate groups
    const filteredAndPaginatedGroups = useMemo(() => {
        if ( !groupedSections ) return { groups: [], totalItems: 0, totalPages: 0 };

        // Apply filters
        const filtered = groupedSections.filter(( group ) => {
            const matchesCode       = codeFilter.length     === 0 || codeFilter.includes( group.code.toString() );
            const matchesRoom       = roomFilter.length     === 0 || group.sections.some( section => roomFilter.includes( section.room || '' ));
            const matchesDay        = dayFilter.length      === 0 || group.sections.some( section => dayFilter.includes( section.day?.toString() || '' ));
            const matchesPeriod     = periodFilter.length   === 0 || periodFilter.includes( group.period?.split( '-' )[0] || '' );
            const matchesStatus     = statusFilter.length   === 0 || statusFilter.includes( group.isOpen ? 'open' : 'closed' );
            const matchesSubject    = subjectFilter.length  === 0 || group.sections.some( section => subjectFilter.includes( section.subjectId || '' ));
            const matchesSize       = sizeFilter.length     === 0 || group.sections.some( section => sizeFilter.includes( section.size || '' ));
            const matchesSession    = sessionFilter.length  === 0 || group.sections.some( section => sessionFilter.includes( section.session ));
            const matchesModule     = moduleFilter.length   === 0 || group.sections.some( section => moduleFilter.includes( section.moduleId?.toString() || '' ));

            return matchesCode && matchesRoom && matchesDay && matchesPeriod && matchesStatus && matchesSubject && matchesSize && matchesSession && matchesModule;
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil( totalItems / itemsPerPage );

        // Apply pagination
        const startIndex = ( currentPage - 1 ) * itemsPerPage;
        const endIndex   = startIndex + itemsPerPage;
        const groups     = filtered.slice( startIndex, endIndex );

        return { groups, totalItems, totalPages };
    }, [ groupedSections, codeFilter, roomFilter, dayFilter, periodFilter, statusFilter, subjectFilter, sizeFilter, sessionFilter, moduleFilter, currentPage, itemsPerPage ]);


    useEffect(() => {
        setCurrentPage( 1 );
    }, [ codeFilter, roomFilter, dayFilter, periodFilter, statusFilter, subjectFilter, sizeFilter, sessionFilter, moduleFilter, itemsPerPage ]);


    if ( isLoadingSections ) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-lg">Cargando secciones...</div>
            </div>
        );
    }


    if ( isErrorSections ) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-lg text-red-500">Error al cargar las secciones</div>
            </div>
        );
    }


    if ( !sectionsData || sectionsData.length === 0 ) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-lg text-gray-500">No hay secciones disponibles</div>
            </div>
        );
    }


    function handleDelete(  section: Section) {
        console.log("🚀 ~ file: section-added-table.tsx:425 ~ section:", section)

        setAlertType( 'section' );
        setSelectedAlert( section );
        setIsOpenAlert( true );
    }


    // const deleteRequestDetailApi = async ( requestId: string ): Promise<Request> =>
    //     fetchApi<Request>( {
    //         url     :`request-details/${requestId}`,
    //         method  : Method.DELETE
    //     } );


    // const deleteRequestDetailMutation = useMutation<Request, Error, string>({
    //     mutationFn: deleteRequestDetailApi,
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECCTIONS] });
    //         setIsOpenAlert( false );
    //         setSelectedAlert( undefined );
    //         toast( 'Solicitud eliminada exitosamente', successToast );
    //     },
    //     onError: ( mutationError ) => toast( `Error al eliminar solicitud: ${mutationError.message}`, errorToast )
    // });


    return (
        <div className="w-full mt-4">
            <div className="flex gap-4">
                {/* Table */}
                <Card className="flex-1">
                    <CardContent className="mt-5 overflow-x-auto overflow-y-auto h-[calc(100vh-300px)] w-full">
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
                                                    activeText      = "Abierta"
                                                    inactiveText    = "Cerrada"
                                                />
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <ActionButton
                                                        editItem    = {() => handleEditGroup( group )}
                                                        deleteItem  = {() => handleDeleteGroup( group )}
                                                        item        = { group }
                                                    />

                                                    <Button
                                                        title       = { group.isOpen ? "Cerrar Grupo" : "Abrir Grupo" }
                                                        variant     = "outline"
                                                        size        = "icon"
                                                        onClick     = {() => handleToggleGroupStatus( group )}
                                                        aria-label  = { group.isOpen ? "Cerrar grupo" : "Abrir grupo" }
                                                    >
                                                        { group.isOpen
                                                            ? <Ban className="h-4 w-4 text-red-500" />
                                                            : <CircleCheckBig className="h-4 w-4 text-green-500" />
                                                        }
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded Sections */}
                                        {expandedGroups.has( group.groupId ) && (
                                            <TableRow>
                                                <TableCell colSpan={8} className="p-0">
                                                    <div className="border-l-4">
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

                                                                        <TableCell>{ section.professorName ?? 'Sin profesor' }</TableCell>

                                                                        <TableCell>{ days[(section.day ?? -1) - 1] ?? '-' }</TableCell>

                                                                        <TableCell>{ section.moduleId ? `M${section.moduleId}` : '-' }</TableCell>

                                                                        <TableCell className="text-right">
                                                                            <ActionButton
                                                                                editItem    = {() => handleEdit( section )}
                                                                                deleteItem  = {() => handleDelete( section )}
                                                                                item        = { section }
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    </CardContent>

                    {/* Pagination */}
                    {filteredAndPaginatedGroups.totalItems > 0 && (
                        <div className="p-4 border-t">
                            <DataPagination
                                currentPage             = { currentPage }
                                totalPages              = { filteredAndPaginatedGroups.totalPages }
                                totalItems              = { filteredAndPaginatedGroups.totalItems }
                                itemsPerPage            = { itemsPerPage }
                                onPageChange            = { setCurrentPage }
                                onItemsPerPageChange    = { setItemsPerPage }
                            />
                        </div>
                    )}
                </Card>

                {/* Filters Sidebar */}
                <Card className="w-80 flex-shrink-0">
                    <CardContent className="p-4 h-[calc(100vh-280px)] overflow-y-auto space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Filtros</h3>

                        <div className="space-y-2">
                            <Label htmlFor="code-filter">Filtrar por Código</Label>

                            <MultiSelectCombobox
                                options             = { uniqueCodes.map(code => ({ label: code, value: code })) }
                                defaultValues       = { codeFilter }
                                onSelectionChange   = {( value ) => setCodeFilter( value as string[] )}
                                placeholder         = "Seleccionar códigos"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="room-filter">Filtrar por Sala</Label>

                            <MultiSelectCombobox
                                options             = { rooms || [] }
                                defaultValues       = { roomFilter }
                                onSelectionChange   = {( value ) =>setRoomFilter( value as string[] )}
                                placeholder         = "Seleccionar salas"
                                disabled            = { isLoadingRooms }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="day-filter">Filtrar por Día</Label>

                            <MultiSelectCombobox
                                options             = { daysOfWeek.map( day => ({ label: day.label, value: day.value }))}
                                defaultValues       = { dayFilter }
                                onSelectionChange   = {( value ) => setDayFilter( value as string[] )}
                                placeholder         = "Seleccionar días"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="period-filter">Filtrar por Período</Label>

                            <MultiSelectCombobox
                                options             = { memoizedPeriods?.map(period => ({ label: period.label, value: period.value })) || [] }
                                defaultValues       = { periodFilter }
                                onSelectionChange   = {( value ) =>setPeriodFilter( value as string[] )}
                                placeholder         = "Seleccionar períodos"
                                disabled            = { isLoadingPeriods }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status-filter">Filtrar por Estado</Label>

                            <MultiSelectCombobox
                                defaultValues       = { statusFilter }
                                onSelectionChange   = {( value )  => setStatusFilter( value as string[] )}
                                placeholder         = "Seleccionar estados"
                                options             = {[
                                    { label: 'Abiertas', value: 'open' },
                                    { label: 'Cerradas', value: 'closed' }
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject-filter">Filtrar por Asignatura</Label>

                            <MultiSelectCombobox
                                options             = { subjects?.map(subject => ({ label: subject.name, value: subject.id })) || [] }
                                defaultValues       = { subjectFilter }
                                onSelectionChange   = {( value ) => setSubjectFilter( value as string[] )}
                                placeholder         = "Seleccionar asignaturas"
                                disabled            = { isLoadingSubjects }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="size-filter">Filtrar por Tamaño</Label>

                            <MultiSelectCombobox
                                options             = { sizes?.map(size => ({ label: size.detail, value: size.id })) || [] }
                                defaultValues       = { sizeFilter }
                                onSelectionChange   = {( value ) => setSizeFilter( value as string[] )}
                                placeholder         = "Seleccionar tamaños"
                                disabled            = { isLoadingSizes }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="session-filter">Filtrar por Sesión</Label>

                            <MultiSelectCombobox
                                options             = {[
                                    { label: 'Cátedra', value: Session.C },
                                    { label: 'Ayudantía', value: Session.A },
                                    { label: 'Taller', value: Session.T },
                                    { label: 'Laboratorio', value: Session.L }
                                ]}
                                defaultValues       = { sessionFilter }
                                onSelectionChange   = {( value ) => setSessionFilter( value as string[] )}
                                placeholder         = "Seleccionar sesiones"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="module-filter">Filtrar por Módulo</Label>

                            <MultiSelectCombobox
                                options             = { modules?.map(module => ({ label: `${module.name} (${module.code})`, value: module.id.toString() })) || [] }
                                defaultValues       = { moduleFilter }
                                onSelectionChange   = {( value ) => setModuleFilter( value as string[] )}
                                placeholder         = "Seleccionar módulos"
                                disabled            = { isLoadingModules }
                            />
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button
                            onClick     = {() => console.log('****Seleccionado')}
                            className   = "gap-2 w-full"
                        >
                            <Pencil className="w-4 h-4" />

                            Modificar secciones ({ selectedSections.size })
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Edit Group Dialog */}
            <SectionFormGroup
                isOpen              = { isEditDialogOpen }
                onClose             = { handleCloseEditDialog }
                group               = { selectedGroupEdit }
                memoizedPeriods     = { memoizedPeriods }
                sizes               = { sizes || [] }
                existingGroups      = { groupedSections }
                onSave              = { handleSaveGroup }
            />

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
                onConfirm   = { () => {}}
                // onConfirm   = { () => deleteRequestDetailMutation.mutate( alertType === 'close' ? selectedAlert?.groupId : (selectedAlert as any)?.id )}
                name        = { alertType !== 'close' ? (selectedAlert as any)?.id :  `${ selectedAlert?.code } ${ selectedAlert?.period }` }
                type        = { alertType !== 'close' ? "la Sección" : "el Grupo" }
                isDeleted   = { alertType !== 'close' }
            />
        </div>
    );
}
