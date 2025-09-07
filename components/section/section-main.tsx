'use client'

import React, { useState, useMemo, useEffect } from 'react';

import { Pencil }   from 'lucide-react';
import { useQuery } from '@tanstack/react-query';


import {
    Card,
    CardContent,
    CardFooter
}                               from '@/components/ui/card';
import { DataPagination }       from '@/components/ui/data-pagination';
import { Label }                from '@/components/ui/label';
import { Button }               from '@/components/ui/button';
import { MultiSelectCombobox }  from '@/components/shared/Combobox';
import { SectionGroupTable }    from '@/components/section/section-group';

import { Module, SizeResponse } from '@/types/request';
import { useSpace }             from '@/hooks/use-space';
import { Section, Session }     from '@/types/section.model';
import { Subject }              from '@/types/subject.model';
import { KEY_QUERYS }           from '@/consts/key-queries';
import { fetchApi }             from '@/services/fetch';
import { ENV }                  from '@/config/envs/env';
import { SectionGroup, Option } from './types';



interface Props {
    onEdit?             : ( section: Section ) => void;
    onDelete?           : ( section: Section ) => void;
    subjectId           : string;
    facultyId           : string;
    enabled             : boolean;
    isLoadingPeriods    : boolean;
    memoizedPeriods     : Option[];
}


export function SectionMain({
    onEdit,
    onDelete,
    enabled,
    subjectId,
    facultyId,
    isLoadingPeriods,
    memoizedPeriods,
}: Props ) {
    const [codeFilter, setCodeFilter]               = useState<string[]>( [] );
    const [roomFilter, setRoomFilter]               = useState<string[]>( [] );
    const [dayFilter, setDayFilter]                 = useState<string[]>( [] );
    const [periodFilter, setPeriodFilter]           = useState<string[]>( [] );
    const [statusFilter, setStatusFilter]           = useState<string[]>( [] );
    const [subjectFilter, setSubjectFilter]         = useState<string[]>( [] );
    const [sizeFilter, setSizeFilter]               = useState<string[]>( [] );
    const [sessionFilter, setSessionFilter]         = useState<string[]>( [] );
    const [moduleFilter, setModuleFilter]           = useState<string[]>( [] );
    const [selectedSections, setSelectedSections]   = useState<Set<string>>( new Set() );
    const [currentPage, setCurrentPage]             = useState<number>( 1 );
    const [itemsPerPage, setItemsPerPage]           = useState<number>( 10 );


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


    const uniqueCodes = useMemo(() => {
        if ( !sectionsData ) return [];

        const codes = Array.from(new Set( sectionsData.map( section => section.code.toString() )));

        return codes.sort();
    }, [ sectionsData ]);


    const {
        spaces      : rooms,
        isLoading   : isLoadingRooms,
        isError     : isErrorRooms
    } = useSpace({ enabled: true });


    const daysOfWeek = useMemo(() => [
        { value: '1', label: 'Lunes' },
        { value: '2', label: 'Martes' },
        { value: '3', label: 'Miércoles' },
        { value: '4', label: 'Jueves' },
        { value: '5', label: 'Viernes' },
        { value: '6', label: 'Sábado' },
        { value: '7', label: 'Domingo' },
    ], []);


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


    // if ( isLoadingSections ) {
    //     return (
    //         <div className="flex justify-center items-center p-8">
    //             <div className="text-lg">Cargando secciones...</div>
    //         </div>
    //     );
    // }


    // if ( isErrorSections ) {
    //     return (
    //         <div className="flex justify-center items-center p-8">
    //             <div className="text-lg text-red-500">Error al cargar las secciones</div>
    //         </div>
    //     );
    // }


    if ( !sectionsData || sectionsData.length === 0 ) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-lg text-gray-500">No hay secciones disponibles</div>
            </div>
        );
    }

    return (
        <div className="w-full mt-4">
            <div className="flex gap-4">
                {/* Table */}
                <Card className="flex-1">
                    <CardContent className="mt-5 overflow-x-auto overflow-y-auto h-[calc(100vh-300px)] w-full">
                        <SectionGroupTable
                            filteredAndPaginatedGroups  = { filteredAndPaginatedGroups }
                            sectionsData                = { sectionsData }
                            isLoadingSections           = { isLoadingSections }
                            isErrorSections             = { isErrorSections }
                            memoizedPeriods             = { memoizedPeriods }
                            sizes                       = { sizes }
                        />
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
        </div>
    );
}
