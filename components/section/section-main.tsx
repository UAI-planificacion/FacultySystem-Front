'use client'

import React, { useState, useMemo, useEffect }  from 'react';
import { useRouter }                            from 'next/navigation';

import {
    BrushCleaning,
    Filter,
    Pencil
}                   from 'lucide-react';
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
import { SubjectSelect }        from '@/components/shared/item-select/subject-select';
import { SizeSelect }           from '@/components/shared/item-select/size-select';
import { PeriodSelect }         from '@/components/shared/item-select/period-select';
import { SpaceSelect }          from '@/components/shared/item-select/space-select';
import { SessionSelect }        from '@/components/shared/item-select/session-select';
import { ModuleSelect }         from '@/components/shared/item-select/module-select';
import { ProfessorSelect }      from '@/components/shared/item-select/professor-select';
import { DaySelect }            from '@/components/shared/item-select/days-select';
import { SectionForm }          from '@/components/section/section-form';
import { SectionGroup }         from '@/components/section/types';

import { Section, Session } from '@/types/section.model';
import { KEY_QUERYS }       from '@/consts/key-queries';
import { fetchApi }         from '@/services/fetch';
import { ENV }              from '@/config/envs/env';


interface Props {
    onEdit?         : ( section: Section ) => void;
    onDelete?       : ( section: Section ) => void;
    enabled         : boolean;
    searchParams    : URLSearchParams;
}


const stateOptions = [
    { label: 'Abiertas', value: 'open' },
    { label: 'Cerradas', value: 'closed' }
];


export function SectionMain({
    onEdit,
    onDelete,
    enabled,
    searchParams,
}: Props ) {
    const router = useRouter();
    // Initialize filters from URL search params
    const [codeFilter, setCodeFilter]               = useState<string[]>(() => searchParams.get('code')?.split(',').filter(Boolean) || []);
    const [roomFilter, setRoomFilter]               = useState<string[]>(() => searchParams.get('room')?.split(',').filter(Boolean) || []);
    const [dayFilter, setDayFilter]                 = useState<string[]>(() => searchParams.get('day')?.split(',').filter(Boolean) || []);
    const [periodFilter, setPeriodFilter]           = useState<string[]>(() => searchParams.get('period')?.split(',').filter(Boolean) || []);
    const [statusFilter, setStatusFilter]           = useState<string[]>(() => searchParams.get('status')?.split(',').filter(Boolean) || []);
    const [subjectFilter, setSubjectFilter]         = useState<string[]>(() => searchParams.get('subject')?.split(',').filter(Boolean) || []);
    const [sizeFilter, setSizeFilter]               = useState<string[]>(() => searchParams.get('size')?.split(',').filter(Boolean) || []);
    const [sessionFilter, setSessionFilter]         = useState<string[]>(() => searchParams.get('session')?.split(',').filter(Boolean) || []);
    const [moduleFilter, setModuleFilter]           = useState<string[]>(() => searchParams.get('module')?.split(',').filter(Boolean) || []);
    const [professorFilter, setProfessorFilter]     = useState<string[]>(() => searchParams.get('professor')?.split(',').filter(Boolean) || []);
    const [selectedSections, setSelectedSections]   = useState<Set<string>>( new Set() );
    const [currentPage, setCurrentPage]             = useState<number>( 1 );
    const [itemsPerPage, setItemsPerPage]           = useState<number>( 10 );
    const [isEditSection, setIsEditSection]         = useState<boolean>( false );

    // Function to update URL with filter parameters
    const updateUrlParams = (filterName: string, values: string[]) => {
        const params = new URLSearchParams(searchParams.toString());

        if (values.length > 0) {
            params.set(filterName, values.join(','));
        } else {
            params.delete(filterName);
        }

        router.push(`/sections?${params.toString()}`);
    };


    const {
        data        : sectionsData,
        isLoading   : isLoadingSections,
        isError     : isErrorSections
    } = useQuery<Section[]>({
        enabled,
        queryKey: [ KEY_QUERYS.SECCTIONS ],
        queryFn : () => fetchApi({
            isApi   : false,
            url     : `${ENV.ACADEMIC_SECTION}Sections`,
        }),
    });


    const uniqueCodes = useMemo(() => {
        if ( !sectionsData ) return [];

        const codes = Array.from(new Set( sectionsData.map( section => section.code.toString() )));

        return codes.sort();
    }, [ sectionsData ]);


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
                    period          : `${section.period.id}-${section.period.name}`,
                    subjectId       : section.subject.id,
                    subjectName     : section.subject.name,
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
                const dayAbbr       = getDayAbbreviation( section?.day?.id || 1 );
                const scheduleItem  = `${dayAbbr}-${section.module?.id}`;
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
            const matchesCode       = codeFilter.length         === 0 || codeFilter.includes( group.code.toString() );
            const matchesRoom       = roomFilter.length         === 0 || group.sections.some( section => roomFilter.includes( section.room || '' ));
            const matchesDay        = dayFilter.length          === 0 || group.sections.some( section => dayFilter.includes( section.day?.toString() || '' ));
            const matchesPeriod     = periodFilter.length       === 0 || periodFilter.includes( group.period?.split( '-' )[0] || '' );
            const matchesStatus     = statusFilter.length       === 0 || statusFilter.includes( group.isOpen ? 'open' : 'closed' );
            const matchesSubject    = subjectFilter.length      === 0 || group.sections.some( section => subjectFilter.includes( section.subject?.id || '' ));
            const matchesSize       = sizeFilter.length         === 0 || group.sections.some( section => sizeFilter.includes( section.size || '' ));
            const matchesSession    = sessionFilter.length      === 0 || group.sections.some( section => sessionFilter.includes( section.session ));
            const matchesModule     = moduleFilter.length       === 0 || group.sections.some( section => moduleFilter.includes( section.module?.id?.toString() || '' ));
            const matchesProfessor  = professorFilter.length    === 0 || group.sections.some( section => professorFilter.includes( section.professor?.id || '' ));

            return matchesCode && matchesRoom && matchesDay && matchesPeriod && matchesStatus && matchesSubject && matchesSize && matchesSession && matchesModule && matchesProfessor;
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil( totalItems / itemsPerPage );

        // Apply pagination
        const startIndex = ( currentPage - 1 ) * itemsPerPage;
        const endIndex   = startIndex + itemsPerPage;
        const groups     = filtered.slice( startIndex, endIndex );

        return { groups, totalItems, totalPages };
    }, [ groupedSections, codeFilter, roomFilter, dayFilter, periodFilter, statusFilter, subjectFilter, sizeFilter, sessionFilter, moduleFilter, professorFilter, currentPage, itemsPerPage ]);


    useEffect(() => {
        setCurrentPage( 1 );
    }, [ codeFilter, roomFilter, dayFilter, periodFilter, statusFilter, subjectFilter, sizeFilter, sessionFilter, moduleFilter, professorFilter, itemsPerPage ]);


    return (
        <>
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
                            groupedSections             = { groupedSections }
                            selectedSections            = { selectedSections }
                            onSelectedSectionsChange    = { setSelectedSections }
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
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />

                            <h3 className="text-lg font-semibold">Filtros</h3>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code-filter">Filtrar por Números</Label>

                            <MultiSelectCombobox
                                options             = { uniqueCodes.map(code => ({ label: code, value: code })) }
                                defaultValues       = { codeFilter }
                                placeholder         = "Seleccionar Números"
                                onSelectionChange   = {( value ) => {
                                    const newValues = value as string[];
                                    setCodeFilter( newValues );
                                    updateUrlParams( 'code', newValues );
                                }}
                            />
                        </div>

                        <SpaceSelect
                            label               = "Filtrar por Espacios"
                            defaultValues       = { roomFilter }
                            onSelectionChange   = {( value ) => {
                                const newValues = value as string[];
                                setRoomFilter(newValues);
                                updateUrlParams('room', newValues);
                            }}
                        />

                        <DaySelect
                            label               = "Filtrar por Días"
                            defaultValues       = { dayFilter }
                            onSelectionChange   = {( value ) => {
                                const newValues = value as string[];
                                setDayFilter( newValues );
                                updateUrlParams( 'day', newValues );
                            }}
                        />

                        <PeriodSelect
                            label               = "Filtrar por Períodos"
                            defaultValues       = { periodFilter }
                            onSelectionChange   = {( value ) => {
                                const newValues = value as string[];
                                setPeriodFilter( newValues );
                                updateUrlParams( 'period', newValues );
                            }}
                        />

                        <div className="space-y-2">
                            <Label htmlFor="status-filter">Filtrar por Estados</Label>

                            <MultiSelectCombobox
                                defaultValues       = { statusFilter }
                                placeholder         = "Seleccionar estados"
                                options             = { stateOptions }
                                onSelectionChange   = {( value ) => {
                                    const newValues = value as string[];
                                    setStatusFilter( newValues );
                                    updateUrlParams( 'status', newValues );
                                }}
                            />
                        </div>

                        <SubjectSelect
                            label               = "Filtrar por Asignaturas"
                            defaultValues       = { subjectFilter }
                            onSelectionChange   = {( value ) => {
                                const newValues = value as string[];
                                setSubjectFilter( newValues );
                                updateUrlParams( 'subject', newValues );
                            }}
                        />

                        <SizeSelect
                            label               = "Filtrar por Tamaños"
                            defaultValues       = { sizeFilter }
                            onSelectionChange   = {( value ) => {
                                const newValues = value as string[];
                                setSizeFilter( newValues );
                                updateUrlParams( 'size', newValues );
                            }}
                        />

                        <SessionSelect
                            label               = "Filtrar por Sesiones"
                            defaultValues       = { sessionFilter }
                            onSelectionChange   = {( value ) => {
                                const newValues = value as string[];
                                setSessionFilter( newValues );
                                updateUrlParams( 'session', newValues );
                            }}
                        />

                        <ModuleSelect
                            label               = "Filtrar por Módulos"
                            defaultValues       = { moduleFilter }
                            onSelectionChange   = {( value ) => {
                                const newValues = value as string[];
                                setModuleFilter( newValues );
                                updateUrlParams( 'module', newValues );
                            }}
                        />

                        <ProfessorSelect
                            label               = "Filtrar por Profesores"
                            defaultValues       = { professorFilter }
                            onSelectionChange   = {( value ) => {
                                const newValues = value as string[];
                                setProfessorFilter( newValues );
                                updateUrlParams( 'professor', newValues );
                            }}
                        />

                        <Button
                            variant     = "outline"
                            className   = "w-full gap-2"
                            onClick     = {() => {
                                setCodeFilter([]);
                                setRoomFilter([]);
                                setDayFilter([]);
                                setPeriodFilter([]);
                                setStatusFilter([]);
                                setSubjectFilter([]);
                                setSizeFilter([]);
                                setSessionFilter([]);
                                setModuleFilter([]);
                                setProfessorFilter([]);
                            }}
                        >
                            <BrushCleaning className="w-5 h-5" />

                            Limpiar filtros
                        </Button>
                    </CardContent>

                    <CardFooter>
                        <Button
                            onClick     = {() => setIsEditSection( true )}
                            className   = "gap-2 w-full"
                        >
                            <Pencil className="w-4 h-4" />

                            Modificar secciones ({ selectedSections.size })
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>

         {/* Edit Section Dialog */}
        <SectionForm
            isOpen  = { isEditSection }
            onClose = { () => setIsEditSection( false ) }
            section = { null }
            onSave  = { () => {} }
            ids     = { Array.from( selectedSections )}
        />

        </>
    );
}
