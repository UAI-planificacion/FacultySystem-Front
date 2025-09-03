'use client'

import React, { useState, useMemo } from 'react';
import { useQuery }                 from '@tanstack/react-query';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
}                           from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                           from '@/components/ui/select';
import { ActionButton }     from '@/components/shared/action';
import { DataPagination }   from '@/components/ui/data-pagination';
import { Label }            from '@/components/ui/label';

import { Section }      from '@/types/section.model';
import { KEY_QUERYS }   from '@/consts/key-queries';
import { fetchApi }     from '@/services/fetch';
import { ENV }          from '@/config/envs/env';


interface Option {
    id      : string;
    label   : string;
    value   : string;
}


interface Props {
    onEdit?             : ( section: Section ) => void;
    onDelete?           : ( section: Section ) => void;
    subjectId           : string;
    enabled             : boolean;
    isLoadingPeriods    : boolean;
    memoizedPeriods     : Option[];
}


export function SectionAddedTable({
    onEdit,
    onDelete,
    enabled,
    subjectId,
    isLoadingPeriods,
    memoizedPeriods,
}: Props ) {
    const [codeFilter, setCodeFilter]       = useState<string>( '' );
    const [roomFilter, setRoomFilter]       = useState<string>( '' );
    const [dayFilter, setDayFilter]         = useState<string>( '' );
    const [periodFilter, setPeriodFilter]   = useState<string>( '' );
    const [currentPage, setCurrentPage]     = useState<number>( 1 );
    const [itemsPerPage, setItemsPerPage]   = useState<number>( 10 );


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

    // Handle edit action
    const handleEdit = ( section: Section ) => {
        if ( onEdit ) {
            onEdit( section );
        } else {
            console.log( 'Editar sección:', section );
        }
    };

    // Handle delete action
    const handleDelete = ( section: Section ) => {
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

    // Mock rooms data based on Space model
    const mockRooms = useMemo(() => [
        { id: 'room1', description: 'Sala A-101' },
        { id: 'room2', description: 'Sala A-102' },
        { id: 'room3', description: 'Sala B-201' },
        { id: 'room4', description: 'Sala B-202' },
        { id: 'room5', description: 'Sala C-301' },
        { id: 'room6', description: 'Laboratorio 1' },
        { id: 'room7', description: 'Laboratorio 2' },
        { id: 'room8', description: 'Auditorio Principal' },
    ], []);

    // Days of the week
    const daysOfWeek = useMemo(() => [
        { value: 'Lunes', label: 'Lunes' },
        { value: 'Martes', label: 'Martes' },
        { value: 'Miércoles', label: 'Miércoles' },
        { value: 'Jueves', label: 'Jueves' },
        { value: 'Viernes', label: 'Viernes' },
        { value: 'Sábado', label: 'Sábado' },
        { value: 'Domingo', label: 'Domingo' },
    ], []);

    // Filter and paginate sections
    const filteredAndPaginatedSections = useMemo(() => {
        if ( !sectionsData ) return { sections: [], totalItems: 0, totalPages: 0 };

        // Apply filters
        const filtered = sectionsData.filter(( section ) => {
            const matchesCode   = !codeFilter   || codeFilter   === 'all' || section.code.toString() === codeFilter;
            const matchesRoom   = !roomFilter   || roomFilter   === 'all' || section.room === roomFilter;
            const matchesDay    = !dayFilter    || dayFilter    === 'all' || section.day.toString() === dayFilter;
            const matchesPeriod = !periodFilter || periodFilter === 'all' || section.period.split( '-' )[0] === periodFilter;

            return matchesCode && matchesRoom && matchesDay && matchesPeriod;
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil( totalItems / itemsPerPage );

        // Apply pagination
        const startIndex = ( currentPage - 1 ) * itemsPerPage;
        const endIndex   = startIndex + itemsPerPage;
        const sections   = filtered.slice( startIndex, endIndex );

        return { sections, totalItems, totalPages };
    }, [ sectionsData, codeFilter, roomFilter, dayFilter, periodFilter, currentPage, itemsPerPage ]);

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage( 1 );
    }, [ codeFilter, roomFilter, dayFilter, periodFilter ]);

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

    return (
        <div className="w-full space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg">
                <div className="space-y-2">
                    <Label htmlFor="code-filter">Filtrar por Código</Label>
                    <Select value={codeFilter} onValueChange={setCodeFilter}>
                        <SelectTrigger id="code-filter">
                            <SelectValue placeholder="Seleccionar código" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los códigos</SelectItem>
                            {uniqueCodes.map(( code ) => (
                                <SelectItem key={code} value={code}>
                                    {code}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="room-filter">Filtrar por Sala</Label>
                    <Select value={roomFilter} onValueChange={setRoomFilter}>
                        <SelectTrigger id="room-filter">
                            <SelectValue placeholder="Seleccionar sala" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las salas</SelectItem>
                            {mockRooms.map(( room ) => (
                                <SelectItem key={room.id} value={room.description}>
                                    {room.description}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="day-filter">Filtrar por Día</Label>
                    <Select value={dayFilter} onValueChange={setDayFilter}>
                        <SelectTrigger id="day-filter">
                            <SelectValue placeholder="Seleccionar día" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los días</SelectItem>
                            {daysOfWeek.map(( day ) => (
                                <SelectItem key={day.value} value={day.value}>
                                    {day.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="period-filter">Filtrar por Período</Label>
                    <Select value={periodFilter} onValueChange={setPeriodFilter}>
                        <SelectTrigger id="period-filter">
                            <SelectValue placeholder="Seleccionar período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los períodos</SelectItem>
                            {!isLoadingPeriods && memoizedPeriods?.map(( period ) => (
                                <SelectItem key={period.id} value={period.value}>
                                    {period.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Sesión</TableHead>
                            <TableHead>Tamaño</TableHead>
                            <TableHead>Inscritos Corregidos</TableHead>
                            <TableHead>Inscritos Reales</TableHead>
                            <TableHead>Edificio Planificado</TableHead>
                            <TableHead>Sillas Disponibles</TableHead>
                            <TableHead>Sala</TableHead>
                            <TableHead>Profesor</TableHead>
                            <TableHead>Día</TableHead>
                            <TableHead>Módulo</TableHead>
                            <TableHead>Período</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndPaginatedSections.sections.map(( section ) => (
                            <TableRow key={section.id}>
                                <TableCell className="font-medium">{section.code}</TableCell>
                                <TableCell>{section.session}</TableCell>
                                <TableCell>{section.size}</TableCell>
                                <TableCell>{section.correctedRegistrants}</TableCell>
                                <TableCell>{section.realRegistrants}</TableCell>
                                <TableCell>{section.plannedBuilding}</TableCell>
                                <TableCell>{section.chairsAvailable}</TableCell>
                                <TableCell>{section.room}</TableCell>
                                <TableCell>{section.professorName}</TableCell>
                                <TableCell>{section.day}</TableCell>
                                <TableCell>{section.moduleId}</TableCell>
                                <TableCell>{section.period}</TableCell>
                                <TableCell className="text-right">
                                    <ActionButton
                                        editItem    = {handleEdit}
                                        deleteItem  = {handleDelete}
                                        item        = {section}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {filteredAndPaginatedSections.totalItems > 0 && (
                <DataPagination
                    currentPage             = { currentPage }
                    totalPages              = { filteredAndPaginatedSections.totalPages }
                    totalItems              = { filteredAndPaginatedSections.totalItems }
                    itemsPerPage            = { itemsPerPage }
                    onPageChange            = { setCurrentPage }
                    onItemsPerPageChange    = { setItemsPerPage }
                />
            )}
        </div>
    );
}
