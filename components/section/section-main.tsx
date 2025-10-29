'use client'

import React, { useState, useMemo, useEffect }  from 'react';
import { useRouter }                            from 'next/navigation';

import {
    BrushCleaning,
    Filter,
    Pencil,
    Trash
}                   from 'lucide-react';
import {
	useMutation,
	useQuery,
	useQueryClient
}                   from '@tanstack/react-query';
import { toast }    from 'sonner';

import {
    Card,
    CardContent,
    CardFooter
}                                   from '@/components/ui/card';
import { DataPagination }           from '@/components/ui/data-pagination';
import { Label }                    from '@/components/ui/label';
import { Button }                   from '@/components/ui/button';
import { MultiSelectCombobox }      from '@/components/shared/Combobox';
import { SubjectSelect }            from '@/components/shared/item-select/subject-select';
import { SizeSelect }               from '@/components/shared/item-select/size-select';
import { PeriodSelect }             from '@/components/shared/item-select/period-select';
import { SpaceSelect }              from '@/components/shared/item-select/space-select';
import { SessionSelect }            from '@/components/shared/item-select/session-select';
import { ModuleSelect }             from '@/components/shared/item-select/module-select';
import { ProfessorSelect }          from '@/components/shared/item-select/professor-select';
import { DaySelect }                from '@/components/shared/item-select/days-select';
import { SectionTable }             from '@/components/section/section-table';
import { SessionMassiveUpdateForm } from '@/components/session/session-massive-update-form';

import { KEY_QUERYS }               from '@/consts/key-queries';
import { fetchApi, Method }         from '@/services/fetch';
import { OfferSection }             from '@/types/offer-section.model';
import { errorToast, successToast } from '@/config/toast/toast.config';
import { DeleteConfirmDialog }      from '@/components/dialog/DeleteConfirmDialog';


interface Props {
    onEdit?         : ( section: OfferSection ) => void;
    onDelete?       : ( section: OfferSection ) => void;
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
    const router                                    = useRouter();
    const queryClient                               = useQueryClient();
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
    const [groupIdFilter, setGroupIdFilter]         = useState<string[]>(() => searchParams.get('groupId')?.split(',').filter(Boolean) || []);
    const [selectedSections, setSelectedSections]   = useState<Set<string>>( new Set() );
    const [currentPage, setCurrentPage]             = useState<number>( 1 );
    const [itemsPerPage, setItemsPerPage]           = useState<number>( 10 );
    const [isEditSection, setIsEditSection]         = useState<boolean>( false );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>( false );

    // Function to update URL with filter parameters
    const updateUrlParams = ( filterName: string, values: string[] ) => {
        const params = new URLSearchParams( searchParams.toString() );

        if ( values.length > 0 ) {
            params.set( filterName, values.join( ',' ));
        } else {
            params.delete( filterName );
        }

        router.push( `/sections?${params.toString()}` );
    };


    const {
        data        : sectionsData = [],
        isLoading   : isLoadingSections,
        isError     : isErrorSections
    } = useQuery<OfferSection[]>({
        queryKey: [ KEY_QUERYS.SECTIONS ],
        queryFn : () => fetchApi({ url     : 'Sections' }),
        enabled,
    });


    const uniqueCodes = useMemo(() => {
        if ( !sectionsData || sectionsData.length === 0 ) return [];

        const codes = Array.from( new Set( sectionsData.map( section => section.code.toString() )));

        return codes.sort();
    }, [ sectionsData ]);

    // Filter and paginate sections
    const filteredAndPaginatedSections = useMemo(() => {
        if ( !sectionsData || sectionsData.length === 0 ) return { sections: [], totalItems: 0, totalPages: 0 };

        // Apply filters
        const filtered = sectionsData.filter(( section ) => {
            const matchesGroupId    = groupIdFilter.length === 0 || groupIdFilter.includes( section.groupId );
            const matchesCode       = codeFilter.length     === 0 || codeFilter.includes( section.code.toString() );
            const matchesRoom       = roomFilter.length     === 0 || section.sessions.spaceIds.some( spaceId => roomFilter.includes( spaceId ));
            const matchesDay        = dayFilter.length      === 0 || section.sessions.dayIds.some( dayId => dayFilter.includes( dayId.toString() ));
            const matchesPeriod     = periodFilter.length   === 0 || periodFilter.includes( section.period.id );
            const matchesStatus     = statusFilter.length   === 0 || statusFilter.includes( section.isClosed ? 'closed' : 'open' );
            const matchesSubject    = subjectFilter.length  === 0 || subjectFilter.includes( section.subject.id );
            const matchesSize       = sizeFilter.length     === 0 || sizeFilter.includes( section.spaceSizeId || '' );
            const matchesSession    = sessionFilter.length  === 0 || sessionFilter.some( sessionType => {
                if ( sessionType === 'C' ) return section.lecture > 0;
                if ( sessionType === 'A' ) return section.tutoringSession > 0;
                if ( sessionType === 'T' ) return section.workshop > 0;
                if ( sessionType === 'L' ) return section.laboratory > 0;

                return false;
            });

            const matchesModule     = moduleFilter.length       === 0 || section.sessions.moduleIds.some( moduleId => moduleFilter.includes( moduleId.toString() ));
            const matchesProfessor  = professorFilter.length    === 0 || section.sessions.professorIds.some( professorId => professorFilter.includes( professorId ));

            return matchesGroupId && matchesCode && matchesRoom && matchesDay && matchesPeriod && matchesStatus && matchesSubject && matchesSize && matchesSession && matchesModule && matchesProfessor;
        });

        // Apply pagination
        const totalItems = filtered.length;
        const totalPages = Math.ceil( totalItems / itemsPerPage );
        const startIndex = ( currentPage - 1 ) * itemsPerPage;
        const endIndex   = startIndex + itemsPerPage;
        const sections   = filtered.slice( startIndex, endIndex );

        return { sections, totalItems, totalPages };
    }, [ sectionsData, groupIdFilter, codeFilter, roomFilter, dayFilter, periodFilter, statusFilter, subjectFilter, sizeFilter, sessionFilter, moduleFilter, professorFilter, currentPage, itemsPerPage ]);


    useEffect(() => {
        setCurrentPage( 1 );
    }, [ groupIdFilter, codeFilter, roomFilter, dayFilter, periodFilter, statusFilter, subjectFilter, sizeFilter, sessionFilter, moduleFilter, professorFilter, itemsPerPage ]);

	/**
	 * API call para eliminar sesiones masivamente
	 */
	const deleteSessionsApi = async ( sessionIds: string ): Promise<void> =>
		fetchApi<void>({
			url     : `sessions/massive/${sessionIds}`,
			method  : Method.DELETE
		});

	/**
	 * Mutación para eliminar sesiones masivamente
	 */
	const deleteSessionsMutation = useMutation<void, Error, string>({
		mutationFn: deleteSessionsApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECTIONS] });
			setIsDeleteDialogOpen( false );
			setSelectedSections( new Set() );
			toast( 'Sesiones eliminadas exitosamente', successToast );
		},
		onError: ( mutationError ) => {
			toast( `Error al eliminar sesiones: ${mutationError.message}`, errorToast );
		},
	});

	/**
	 * Abre el diálogo de confirmación para eliminar sesiones
	 */
	function handleOpenDeleteSessions(): void {
		if ( selectedSections.size === 0 ) return;
		setIsDeleteDialogOpen( true );
	}

	/**
	 * Confirma y ejecuta la eliminación masiva de sesiones
	 */
	function handleConfirmDeleteSessions(): void {
		const sessionIds = Array.from( selectedSections ).join( ',' );
		deleteSessionsMutation.mutate( sessionIds );
	}


    return (
        <>
        <div className="w-full mt-4">
            <div className="flex gap-4">
                {/* Table */}
                <Card className="flex-1">
                    <CardContent className="mt-5 overflow-x-auto overflow-y-auto h-[calc(100vh-300px)] w-full">
                        <SectionTable
                            sections                    = { filteredAndPaginatedSections.sections }
                            isLoading                   = { isLoadingSections }
                            isError                     = { isErrorSections }
                            selectedSessions            = { selectedSections }
                            onSelectedSessionsChange    = { setSelectedSections }
                        />
                    </CardContent>

                    {/* Pagination */}
                    {filteredAndPaginatedSections.totalItems > 0 && (
                        <div className="p-4 border-t">
                            <DataPagination
                                currentPage             = { currentPage }
                                totalPages              = { filteredAndPaginatedSections.totalPages }
                                totalItems              = { filteredAndPaginatedSections.totalItems }
                                itemsPerPage            = { itemsPerPage }
                                onPageChange            = { setCurrentPage }
                                onItemsPerPageChange    = { setItemsPerPage }
                            />
                        </div>
                    )}
                </Card>

                {/* Filters Sidebar */}
                <Card className="w-80 flex-shrink-0">
                    <CardContent className="p-4 h-[calc(100vh-380px)] overflow-y-auto space-y-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />

                            <h3 className="text-lg font-semibold">Filtros</h3>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code-filter">Filtrar por Números</Label>

                            <MultiSelectCombobox
                                options             = { uniqueCodes.map( code => ({ label: code, value: code }))}
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
                                setGroupIdFilter( [] );
                                setCodeFilter( [] );
                                setRoomFilter( [] );
                                setDayFilter( [] );
                                setPeriodFilter( [] );
                                setStatusFilter( [] );
                                setSubjectFilter( [] );
                                setSizeFilter( [] );
                                setSessionFilter( [] );
                                setModuleFilter( [] );
                                setProfessorFilter( [] );
                                router.push( '/sections' );
                            }}
                        >
                            <BrushCleaning className="w-5 h-5" />
                            Limpiar filtros
                        </Button>
                    </CardContent>

                    <CardFooter className="grid space-y-4">
                        <Button
                            onClick     = { handleOpenDeleteSessions }
                            className   = "gap-2 w-full"
                            disabled    = { selectedSections.size === 0 }
                            variant     = "destructive"
                        >
                            <Trash className="w-4 h-4" />

                            Eliminar sesiones ({ selectedSections.size })
                        </Button>

                        <Button
                            onClick     = {() => setIsEditSection( true )}
                            className   = "gap-2 w-full"
                            disabled    = { selectedSections.size === 0 }
                        >
                            <Pencil className="w-4 h-4" />

                            Modificar sesiones ({ selectedSections.size })
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>

        <SessionMassiveUpdateForm
            isOpen      = { isEditSection }
            onClose     = { () => setIsEditSection( false ) }
            ids         = { Array.from( selectedSections ) }
            onSuccess   = { () => {
                queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECTIONS] });
            }}
        />

		{/* Delete Confirmation Dialog */}
		<DeleteConfirmDialog
			isOpen      = { isDeleteDialogOpen }
			onClose     = { () => setIsDeleteDialogOpen( false ) }
			onConfirm   = { handleConfirmDeleteSessions }
			name        = { `${selectedSections.size} sesiones seleccionadas` }
			type        = "las sesiones"
		/>
		</>
	);
}
