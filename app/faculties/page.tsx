"use client"

import { useState } from "react";

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

import { FacultyForm }              from "@/components/faculty/faculty-form";
import { FacultyCard }              from "@/components/faculty/faculty-card";
import { FacultyCardSkeletonGrid }  from "@/components/faculty/faculty-card-skeleton";
import { Button }                   from "@/components/ui/button";
import { StatisticCard }            from "@/components/ui/statistic-card";
import { DeleteConfirmDialog }      from "@/components/dialog/DeleteConfirmDialog";
import { Input }                    from "@/components/ui/input";

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


export default function FacultiesPage() {
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.FACULTIES ],
        queryFn     : () => fetchApi<FacultyResponse>({ url: `faculties` }),
    });


    const createFacultyApi = async ( newFacultyData: CreateFacultyInput ): Promise<Faculty>  =>
        fetchApi<Faculty>({ url: `faculties`, method: Method.POST, body: newFacultyData });


    const updateFacultyApi = async ( updatedFacultyData: UpdateFacultyInput ): Promise<Faculty>  =>
        fetchApi<Faculty>({ url: `faculties/${updatedFacultyData.id}`, method: Method.PATCH, body: updatedFacultyData });


    const deleteFacultyApi = async ( facultyId: string ): Promise<Faculty> =>
        fetchApi<Faculty>({ url: `faculties/${facultyId}`, method: Method.DELETE });


    const createFacultyMutation = useMutation<Faculty, Error, CreateFacultyInput>({
        mutationFn: createFacultyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.FACULTIES] });
            setIsFormOpen( false );
            setEditingFaculty( undefined );
            toast('Facultad creada exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast(`Error al crear facultad: ${mutationError.message}`, errorToast );
        },
    });


    const updateFacultyMutation = useMutation<Faculty, Error, UpdateFacultyInput>({
        mutationFn: updateFacultyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.FACULTIES] });
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
            toast(`Error al eliminar facultad: ${mutationError.message}`, errorToast );
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


    if ( isError ) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                Error al cargar las facultades.
            </div>
        );
    }

    return (
        <main className="container mx-auto py-6 px-2 sm:px-5 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatisticCard
                    title   = "Total de Facultades"
                    value   = { data?.faculties.length }
                    icon    = { <Building className="h-6 w-6" /> }
                />

                <StatisticCard
                    title   = "Total de Asignaturas"
                    value   = { data?.totalSubjects }
                    icon    = { <BookOpen className="h-6 w-6" /> }
                />

                <StatisticCard
                    title   = "Total de Personal"
                    value   = { data?.totalPersonnel }
                    icon    = { <Users className="h-6 w-6" /> }
                />

                <StatisticCard
                    title   = "Total de Solicitudes"
                    value   = { data?.totalRequests }
                    icon    = { <BookCopy className="h-6 w-6" /> }
                />
            </div>

            {/* Faculty List */}
            <div className="space-y-4">
                <div className="w-full flex items-center justify-between gap-2">
                    <Input
                        type        = "search"
                        placeholder = "Buscar facultad por nombre..."
                        value       = { filterText }
                        onChange    = {( e ) => setFilterText( e.target.value )}
                        className   = "w-full max-w-md"
                    />

                    <Button onClick={openNewFacultyForm} className="flex items-center">
                        <Plus className="h-4 w-4 mr-1" />
                        Crear Facultad
                    </Button>
                </div>

                {isLoading ? (
                    <FacultyCardSkeletonGrid count={12} />
                ) : (
                    data!.faculties.filter(faculty => 
                        faculty.name.toLowerCase().includes(filterText.toLowerCase())
                    ).length > 0 && data!.faculties?.filter(faculty => 
                        faculty.name.toLowerCase().includes(filterText.toLowerCase())
                    ).length === 0 ? (
                        <div className="text-center p-12 border rounded-lg border-dashed">
                            <p className="text-muted-foreground">No se han creado facultades.</p>

                            <Button onClick={openNewFacultyForm} variant="outline" className="mt-4">
                                Crea tu primera facultad
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data!.faculties.filter( faculty =>
                                faculty.name.toLowerCase().includes( filterText.toLowerCase() )
                            ).map( faculty => (
                                <FacultyCard
                                    key         = { faculty.id }
                                    faculty     = { faculty }
                                    onEdit      = { openEditFacultyForm }
                                    onDelete    = { openDeleteDialog }
                                />
                            ))}
                        </div>
                    )
                )}
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
        </main>
    );
}
