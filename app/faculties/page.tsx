"use client"

import { useEffect, useState } from "react";

import { Building, Users, BookOpen, Plus, BookCopy } from "lucide-react";
import { toast } from "sonner"

import { Faculty, Person, Role, Subject } from "@/app/types";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                                                   from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FacultyForm }                              from "@/components/faculty/faculty-form";
import { FacultyCard }                              from "@/components/faculty/faculty-card";
import { SubjectsManagement }                       from "@/components/faculty/subjects-management";
import { PersonnelManagement }                      from "@/components/faculty/personnel-management";
import { Button }                                   from "@/components/ui/button";
import { StatisticCard }                            from "@/components/ui/statistic-card";
import { DeleteConfirmDialog }                      from "@/components/dialog/DeleteConfirmDialog";
import { useData }                                  from "@/hooks/use-data";


export default function FacultiesPage() {
    const {
        data: faculties,
        isLoading,
        isError,
    } = useData<Faculty>( 'faculties', 'faculties' );

    // State
    const [facultiesData, setFacultiesData]             = useState<Faculty[]>( [] );
    const [isFormOpen, setIsFormOpen]                   = useState( false );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [isManagementOpen, setIsManagementOpen]       = useState( false );
    const [editingFaculty, setEditingFaculty]           = useState<Faculty | undefined>( undefined );
    const [managingFaculty, setManagingFaculty]         = useState<Faculty | undefined>( undefined );
    const [deletingFacultyId, setDeletingFacultyId]     = useState<string | undefined>( undefined );
    const [activeManagementTab, setActiveManagementTab] = useState( "subjects" );


    useEffect(() => {
        if ( faculties ) {
            setFacultiesData( faculties );
        }
    }, [faculties]);

    // Handlers
    const handleCreateFaculty = ( data: Faculty ) => {
        setFacultiesData( [...facultiesData, data] );

        setIsFormOpen(false)
    }


    const handleUpdateFaculty = ( data: Faculty ) => {
        if ( !editingFaculty ) return;

        const updatedFaculties = faculties.map( faculty => {
            if ( faculty.id === editingFaculty.id ) {
                return {
                    ...faculty,
                    name        : data.name,
                    description : data.description,
                }
            }

            return faculty;
        })

        setFacultiesData( updatedFaculties );
        setEditingFaculty( undefined );
        setIsFormOpen( false );
    }


    const handleDeleteFaculty = () => {
        if ( !deletingFacultyId ) return;

        const updatedFaculties = faculties.filter( faculty => faculty.id !== deletingFacultyId );
        setFacultiesData( updatedFaculties );
        setDeletingFacultyId( undefined );
        setIsDeleteDialogOpen( false );
        toast.success( "Faculty deleted successfully" );
    }


    const handleUpdateManagedFaculty = (updatedFaculty: Faculty) => {
        const updatedFaculties = faculties.map( faculty => 
            faculty.id === updatedFaculty.id ? updatedFaculty : faculty
        )

        // setFaculties( updatedFaculties );

        // Also update the managing faculty state to reflect changes
        setManagingFaculty( updatedFaculty );
    }


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


    const openManageSubjects = (faculty: Faculty) => {
        setManagingFaculty(faculty)
        setActiveManagementTab("subjects")
        setIsManagementOpen(true)
    }


    const openManagePersonnel = (faculty: Faculty) => {
        setManagingFaculty(faculty)
        setActiveManagementTab("personnel")
        setIsManagementOpen(true)
    }

    const openManageRequests = (faculty: Faculty) => {
        setManagingFaculty(faculty)
        setActiveManagementTab("requests")
        setIsManagementOpen(true)
    }

    // Calculate statistics
    const totalFaculties    = 0;
    const totalSubjects     = 0;
    const totalPersonnel    = 0;
    const totalRequests     = 0;
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Facultades</h1>
                    <p className="text-muted-foreground">
                        Gestiona facultades, materias, centro de costos, y personal
                    </p>
                </div>

                <Button onClick={openNewFacultyForm} className="flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Crear Facultad
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatisticCard
                    title   = "Total de Facultades"
                    value   = { totalFaculties }
                    icon    = { <Building className="h-6 w-6" /> }
                />

                <StatisticCard
                    title   = "Total de Asignaturas"
                    value   = { totalSubjects }
                    icon    = { <BookOpen className="h-6 w-6" /> }
                />

                <StatisticCard
                    title   = "Total de Personal"
                    value   = { totalPersonnel }
                    icon    = { <Users className="h-6 w-6" /> }
                />

                <StatisticCard
                    title   = "Total de Solicitudes"
                    value   = { totalRequests }
                    icon    = { <BookCopy className="h-6 w-6" /> }
                />
            </div>

            {/* Faculty List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Facultades</h2>

                {facultiesData.length === 0 ? (
                    <div className="text-center p-12 border rounded-lg border-dashed">
                        <p className="text-muted-foreground">No se han creado facultades.</p>

                        <Button onClick={openNewFacultyForm} variant="outline" className="mt-4">
                            Crea tu primera facultad
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {facultiesData.map( faculty => (
                            <FacultyCard
                                key                 = { faculty.id }
                                faculty             = { faculty }
                                onEdit              = { openEditFacultyForm }
                                onDelete            = { openDeleteDialog }
                                onManageSubjects    = { openManageSubjects }
                                onManagePersonnel   = { openManagePersonnel }
                                onManageRequests    = { openManageRequests }
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Faculty Form Dialog */}
            <FacultyForm
                initialData = { editingFaculty }
                onSubmit    = { editingFaculty ? handleUpdateFaculty : handleCreateFaculty }
                isOpen      = { isFormOpen }
                onClose     = { () => setIsFormOpen( false )}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { handleDeleteFaculty }
                name        = { deletingFacultyId || '' }
                type        = "la Facultad"
            />

            {/* Management Dialog */}
            {managingFaculty && (
                <Dialog open={isManagementOpen} onOpenChange={setIsManagementOpen}>
                    <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle>
                                Manage {managingFaculty.name}
                            </DialogTitle>
                            <DialogDescription>
                                Configure subjects and personnel for this faculty
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs value={activeManagementTab} onValueChange={setActiveManagementTab} className="w-full">
                            <TabsList className="grid grid-cols-2 mb-4">
                                <TabsTrigger value="subjects">Subjects</TabsTrigger>

                                <TabsTrigger value="personnel">Personnel</TabsTrigger>
                            </TabsList>

                            <TabsContent value="subjects">
                                <SubjectsManagement 
                                    faculty={managingFaculty}
                                    onUpdate={handleUpdateManagedFaculty}
                                />
                            </TabsContent>

                            <TabsContent value="personnel">
                                <PersonnelManagement 
                                    faculty={managingFaculty}
                                    onUpdate={handleUpdateManagedFaculty}
                                />
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
