"use client"

import { useState, useMemo, useEffect } from "react";

import {
    Building,
    Users,
    BookOpen,
    Plus,
    BookCopy
}                   from "lucide-react";
import {
    useMutation,
    useQuery,
    useQueryClient
}                   from "@tanstack/react-query";
import { toast }    from "sonner";

import { FacultyForm }          from "@/components/faculty/faculty-form";
import { FacultyList }          from "@/components/faculty/faculty-list";
import { FacultyTable }         from "@/components/faculty/faculty-table";
import { Button }               from "@/components/ui/button";
import { StatisticCard }        from "@/components/ui/statistic-card";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Input }                from "@/components/ui/input";
import { ViewMode }             from "@/components/shared/view-mode";
import { DataPagination }       from "@/components/ui/data-pagination";
import { PageLayout }           from "@/components/layout/page-layout";

import {
    CreateFacultyInput,
    Faculty,
    FacultyResponse,
    UpdateFacultyInput
}                           from "@/types/faculty.model";
import {
    errorToast,
    successToast
}                           from "@/config/toast/toast.config";
import { Method, fetchApi } from "@/services/fetch";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { useViewMode }      from "@/hooks/use-view-mode";


export const updateFacultyTotal = ( 
    queryClient : ReturnType<typeof useQueryClient>, 
    facultyId   : string, 
    increment   : boolean,
    total       : string,
    number      : number  = 1
): void => {
    queryClient.setQueryData<FacultyResponse | undefined>(
        [ KEY_QUERYS.FACULTIES ],
        ( data : FacultyResponse | undefined ) => {
            if ( !data ) return data;

            const updatedFaculties = data.faculties.map(( faculty: Faculty ) => 
                faculty.id === facultyId
                    ? {
                        ...faculty,
                        [total]: faculty[total] + ( increment ? number : -1 )
                    }
                    : faculty
            );

            return {
                ...data,
                faculties: updatedFaculties
            };
        }
    );
};


export default function FacultiesPage() {
    const queryClient                   = useQueryClient();
    const { viewMode, onViewChange }    = useViewMode({ queryName: 'viewFaculty' });

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.FACULTIES ],
        queryFn     : () => fetchApi<FacultyResponse>({ url: `faculties` }),
    });


    const createFacultyApi = async ( newFacultyData: CreateFacultyInput ): Promise<Faculty>  =>
        fetchApi<Faculty>({
            url     : `faculties`,
            method  : Method.POST,
            body    : newFacultyData
        });


    const updateFacultyApi = async ( updatedFacultyData: UpdateFacultyInput ): Promise<Faculty>  =>
        fetchApi<Faculty>({
            url     : `faculties/${updatedFacultyData.id}`,
            method  : Method.PATCH,
            body    : updatedFacultyData
        });


    const deleteFacultyApi = async ( facultyId: string ): Promise<Faculty> =>
        fetchApi<Faculty>({ url: `faculties/${facultyId}`, method: Method.DELETE });


    const createFacultyMutation = useMutation<Faculty, Error, CreateFacultyInput>({
        mutationFn: createFacultyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.FACULTIES ]});
            setIsFormOpen( false );
            setEditingFaculty( undefined );
            toast( 'Facultad creada exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al crear facultad: ${mutationError.message}`, errorToast );
        },
    });


    const updateFacultyMutation = useMutation<Faculty, Error, UpdateFacultyInput>({
        mutationFn: updateFacultyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.FACULTIES ]});
            setIsFormOpen( false );
            setEditingFaculty( undefined );
            toast( 'Facultad actualizada exitosamente', successToast );
        },
        onError: (mutationError) => {
            toast( `Error al actualizar facultad: ${mutationError.message}`, errorToast );
        },
    });


    const deleteFacultyMutation = useMutation<Faculty, Error, string>({
        mutationFn: deleteFacultyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.FACULTIES] });
            setIsDeleteDialogOpen( false );
            toast( 'Facultad eliminada exitosamente', successToast );
        },
        onError: (mutationError) => {
            toast( `Error al eliminar facultad: ${mutationError.message}`, errorToast );
        },
    });


    const handleFormSubmit = ( formData: CreateFacultyInput | UpdateFacultyInput ) => {
        if ( editingFaculty ) {
            updateFacultyMutation.mutate({ ...formData, id: editingFaculty.id });
        } else {
            createFacultyMutation.mutate( formData as CreateFacultyInput );
        }
    };

    // State
    const [isFormOpen, setIsFormOpen]                   = useState( false );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [editingFaculty, setEditingFaculty]           = useState<Faculty | undefined>( undefined );
    const [deletingFacultyId, setDeletingFacultyId]     = useState<string | undefined>( undefined );
    const [filterText, setFilterText]                   = useState( "" );
    const [currentPage, setCurrentPage]                 = useState( 1 );
    const [itemsPerPage, setItemsPerPage]               = useState( 10 );

    // Filtered and paginated faculties
    const filteredFaculties = useMemo(() => {
        if ( !data?.faculties ) return [];
        return data.faculties.filter( faculty =>
            faculty.name.toLowerCase().includes( filterText.toLowerCase() )
        );
    }, [data?.faculties, filterText]);

    const paginatedFaculties = useMemo(() => {
        const startIndex    = ( currentPage - 1 ) * itemsPerPage;
        const endIndex      = startIndex + itemsPerPage;
        return filteredFaculties.slice( startIndex, endIndex );
    }, [ filteredFaculties, currentPage, itemsPerPage ]);

    const totalPages = Math.ceil( filteredFaculties.length / itemsPerPage );


    const openNewFacultyForm = () => {
        setEditingFaculty( undefined );
        setIsFormOpen( true );
    }


    const openEditFacultyForm = ( faculty: Faculty ) => {
        setEditingFaculty( faculty );
        setIsFormOpen( true );
    }


    const openDeleteDialog = ( id: string ) => {
        setDeletingFacultyId( id );
        setIsDeleteDialogOpen( true );
    }

    // Reset to first page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterText]);


    if ( isError ) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                Error al cargar las facultades.
            </div>
        );
    }

    return (
        <PageLayout 
            title   = "Gestión de Facultades"
            actions = {
                <Button onClick={ openNewFacultyForm }>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Facultad
                </Button>
            }
        >
            <div className="flex flex-col h-full space-y-4 overflow-hidden">
                {/* Statistics Cards */}
                <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <StatisticCard
                        title   = "Total de Facultades"
                        value   = { data?.faculties.length }
                        icon    = { <Building className="h-6 w-6" /> }
                    />

                    <StatisticCard
                        title   = "Total de Personal"
                        value   = { data?.totalStaff }
                        icon    = { <Users className="h-6 w-6" /> }
                    />

                    <StatisticCard
                        title   = "Total de Asignaturas"
                        value   = { data?.totalSubjects }
                        icon    = { <BookOpen className="h-6 w-6" /> }
                    />

                    <StatisticCard
                        title   = "Total de Ofertas"
                        value   = { data?.totalOffers }
                        icon    = { <BookCopy className="h-6 w-6" /> }
                    />

                    <StatisticCard
                        title   = "Total de Solicitudes"
                        value   = { data?.totalRequests }
                        icon    = { <BookCopy className="h-6 w-6" /> }
                    />
                </div>

                {/* Faculty List */}
                <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                    <div className="flex-shrink-0 w-full flex items-center justify-between gap-2">
                        <Input
                            type        = "search"
                            placeholder = "Buscar facultad por nombre..."
                            value       = { filterText }
                            onChange    = {( e ) => setFilterText( e.target.value )}
                            className   = "w-full max-w-md"
                        />

                        <ViewMode
                            viewMode        = { viewMode }
                            onViewChange    = { onViewChange }
                        />
                    </div>

                    {/* Faculty Content */}
                    <div className="flex-1 overflow-hidden">
                        { viewMode === 'cards' ? (
                            <FacultyList
                                faculties       = { paginatedFaculties }
                                isLoading       = { isLoading }
                                isError         = { isError }
                                onEdit          = { openEditFacultyForm }
                                onDelete        = { openDeleteDialog }
                                onNewFaculty    = { openNewFacultyForm }
                            />
                        ) : (
                            <FacultyTable
                                faculties       = { paginatedFaculties }
                                isLoading       = { isLoading }
                                isError         = { isError }
                                onEdit          = { openEditFacultyForm }
                                onDelete        = { openDeleteDialog }
                                onNewFaculty    = { openNewFacultyForm }
                            />
                        )}
                    </div>

                    {/* Pagination */}
                    { !isLoading && !isError && filteredFaculties.length > 0 && (
                        <div className="flex-shrink-0">
                            <DataPagination
                                currentPage             = { currentPage }
                                totalPages              = { totalPages }
                                totalItems              = { filteredFaculties.length }
                                itemsPerPage            = { itemsPerPage }
                                onPageChange            = { setCurrentPage }
                                onItemsPerPageChange    = { ( newItemsPerPage ) => {
                                    setItemsPerPage( newItemsPerPage );
                                    setCurrentPage( 1 );
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Faculty Form Dialog */}
            <FacultyForm
                initialData = { editingFaculty }
                onSubmit    = { handleFormSubmit }
                isOpen      = { isFormOpen }
                onClose     = { () => setIsFormOpen( false )}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => deleteFacultyMutation.mutate( deletingFacultyId || '' )}
                name        = { deletingFacultyId || '' }
                type        = "la Facultad"
            />
        </PageLayout>
    );
}
