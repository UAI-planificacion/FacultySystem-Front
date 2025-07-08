"use client"

import { useState } from "react";

import { Building, Users, BookOpen, Plus, BookCopy } from "lucide-react";
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    CreateFacultyInput,
    Faculty,
    FacultyResponse,
    UpdateFacultyInput
} from "@/types/faculty.model";

import { FacultyForm }          from "@/components/faculty/faculty-form";
import { FacultyCard }          from "@/components/faculty/faculty-card";
import { Button }               from "@/components/ui/button";
import { StatisticCard }        from "@/components/ui/statistic-card";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { useData }              from "@/hooks/use-data";
import { Input }                from "@/components/ui/input";


import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";

import { fetchApi }     from "@/services/fetch";
import LoaderMini       from "@/icons/LoaderMini";
import { KEY_QUERYS }   from "@/consts/key-queries";


export default function FacultiesPage() {
    const queryClient = useQueryClient();
    const {
        data: facultyResponse,
        isLoading,
        isError,
    } = useData<FacultyResponse>([ KEY_QUERYS.FACULTIES ], 'faculties' );


    const createFacultyApi = async ( newFacultyData: CreateFacultyInput ): Promise<Faculty>  =>
        fetchApi<Faculty>( `${ENV.REQUEST_BACK_URL}faculties`, "POST", newFacultyData );


    const updateFacultyApi = async ( updatedFacultyData: UpdateFacultyInput ): Promise<Faculty>  =>
        fetchApi<Faculty>( `${ENV.REQUEST_BACK_URL}faculties/${updatedFacultyData.id}`, "PATCH", updatedFacultyData );


    const deleteFacultyApi = async ( facultyId: string ): Promise<Faculty> =>
        fetchApi<Faculty>( `${ENV.REQUEST_BACK_URL}faculties/${facultyId}`, "DELETE" );


    const createFacultyMutation = useMutation<Faculty, Error, CreateFacultyInput>({
        mutationFn: createFacultyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.FACULTIES] });
            setIsFormOpen(false);
            setEditingFaculty(undefined);
            toast('Facultad creada exitosamente', successToast );
        },
        onError: (mutationError) => {
            toast(`Error al crear facultad: ${mutationError.message}`, errorToast );
        },
    });


    const updateFacultyMutation = useMutation<Faculty, Error, UpdateFacultyInput>({
        mutationFn: updateFacultyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.FACULTIES] });
            setIsFormOpen(false);
            setEditingFaculty(undefined);
            toast('Facultad actualizada exitosamente', successToast );
        },
        onError: (mutationError) => {
            toast(`Error al actualizar facultad: ${mutationError.message}`, errorToast );
        },
    });


    const deleteFacultyMutation = useMutation<Faculty, Error, string>({
        mutationFn: deleteFacultyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.FACULTIES] });
            setIsDeleteDialogOpen(false);
            toast('Facultad eliminada exitosamente', successToast );
        },
        onError: (mutationError) => {
            toast(`Error al eliminar facultad: ${mutationError.message}`, errorToast );
        },
    });


    const handleFormSubmit = (formData: CreateFacultyInput | UpdateFacultyInput ) => {
        if (editingFaculty) {
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
    const [filterText, setFilterText] = useState( "" );


    const openNewFacultyForm = () => {
        setEditingFaculty(undefined)
        setIsFormOpen(true)
    }


    const openEditFacultyForm = (faculty: Faculty) => {
        setEditingFaculty(faculty)
        setIsFormOpen(true)
    }


    const openDeleteDialog = (id: string) => {
        setDeletingFacultyId(id)
        setIsDeleteDialogOpen(true)
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatisticCard
                    title   = "Total de Facultades"
                    value   = { facultyResponse?.faculties.length || 0 }
                    icon    = { <Building className="h-6 w-6" /> }
                />

                <StatisticCard
                    title   = "Total de Asignaturas"
                    value   = { facultyResponse?.totalSubjects || 0 }
                    icon    = { <BookOpen className="h-6 w-6" /> }
                />

                <StatisticCard
                    title   = "Total de Personal"
                    value   = { facultyResponse?.totalPersonnel || 0 }
                    icon    = { <Users className="h-6 w-6" /> }
                />

                <StatisticCard
                    title   = "Total de Solicitudes"
                    value   = { facultyResponse?.totalRequests || 0 }
                    icon    = { <BookCopy className="h-6 w-6" /> }
                />
            </div>

            {/* Faculty List */}
            <div className="space-y-4">
                <div className="w-full flex items-center justify-between">
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

                {
                    isLoading ? (
                        <LoaderMini />
                    ) : (
                        facultyResponse!.faculties.filter(faculty => 
                            faculty.name.toLowerCase().includes(filterText.toLowerCase())
                        ).length > 0 && facultyResponse!.faculties?.filter(faculty => 
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
                                {facultyResponse!.faculties
                                    .filter(faculty => 
                                        faculty.name.toLowerCase().includes(filterText.toLowerCase())
                                    )
                                    .map((faculty) => (
                                    <FacultyCard
                                        key                 = { faculty.id }
                                        faculty             = { faculty }
                                        onEdit              = { openEditFacultyForm }
                                        onDelete            = { openDeleteDialog }
                                    />
                                ))}
                            </div>
                        )
                    )
                }
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
                onConfirm   = { () => deleteFacultyMutation.mutate(deletingFacultyId || '') }
                name        = { deletingFacultyId || '' }
                type        = "la Facultad"
            />
        </div>
    );
}
