"use client"

import { useState } from "react"
import { Faculty, Person, Role, Subject } from "@/app/types"
import { FacultyForm, FacultyFormValues } from "@/components/faculty/faculty-form"
import { FacultyCard } from "@/components/faculty/faculty-card"
import { SubjectsManagement } from "@/components/faculty/subjects-management"
import { PersonnelManagement } from "@/components/faculty/personnel-management"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatisticCard } from "@/components/ui/statistic-card"
import { Building, Users, BookOpen, DollarSign, Plus } from "lucide-react"
import { toast } from "sonner"

export default function FacultiesPage() {
    // State
    const [faculties, setFaculties] = useState<Faculty[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isManagementOpen, setIsManagementOpen] = useState(false)
    const [editingFaculty, setEditingFaculty] = useState<Faculty | undefined>(undefined)
    const [managingFaculty, setManagingFaculty] = useState<Faculty | undefined>(undefined)
    const [deletingFacultyId, setDeletingFacultyId] = useState<string | undefined>(undefined)
    const [activeManagementTab, setActiveManagementTab] = useState("subjects")
    
    // Handlers
    const handleCreateFaculty = (data: FacultyFormValues) => {
        const newFaculty: Faculty = {
        id: Date.now().toString(),
        name: data.name,
        code: data.code,
        description: data.description,
        subjects: [],
        personnel: [],
        }

        setFaculties([...faculties, newFaculty])
        setIsFormOpen(false)
        toast.success("Faculty created successfully")
    }
    
    const handleUpdateFaculty = (data: FacultyFormValues) => {
        if (!editingFaculty) return

        const updatedFaculties = faculties.map((faculty) => {
        if (faculty.id === editingFaculty.id) {
            return {
            ...faculty,
            name: data.name,
            code: data.code,
            description: data.description,
            }
        }
        return faculty
        })
        
        setFaculties(updatedFaculties)
        setEditingFaculty(undefined)
        setIsFormOpen(false)
        toast.success("Faculty updated successfully")
    }
    
    const handleDeleteFaculty = () => {
        if (!deletingFacultyId) return
        
        const updatedFaculties = faculties.filter((faculty) => faculty.id !== deletingFacultyId)
        setFaculties(updatedFaculties)
        setDeletingFacultyId(undefined)
        setIsDeleteDialogOpen(false)
        toast.success("Faculty deleted successfully")
    }
    
    const handleUpdateManagedFaculty = (updatedFaculty: Faculty) => {
        const updatedFaculties = faculties.map((faculty) => 
        faculty.id === updatedFaculty.id ? updatedFaculty : faculty
        )
        
        setFaculties(updatedFaculties)
        
        // Also update the managing faculty state to reflect changes
        setManagingFaculty(updatedFaculty)
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
    
    // Calculate statistics
    const totalFaculties = faculties.length
    const totalSubjects = faculties.reduce((total, faculty) => total + faculty.subjects.length, 0)
    const totalPersonnel = faculties.reduce((total, faculty) => total + faculty.personnel.length, 0)
    const totalCostCenters = faculties.reduce((total, faculty) => {
        return total + faculty.subjects.filter(subject => subject.costCenter).length
    }, 0)

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatisticCard
                    title="Total de Facultades"
                    value={totalFaculties}
                    icon={<Building className="h-6 w-6" />}
                />

                <StatisticCard
                    title="Total de Materias"
                    value={totalSubjects}
                    icon={<BookOpen className="h-6 w-6" />}
                />

                <StatisticCard
                    title="Total de Personal"
                    value={totalPersonnel}
                    icon={<Users className="h-6 w-6" />}
                />
            </div>

            {/* Faculty List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Facultades</h2>

                {faculties.length === 0 ? (
                    <div className="text-center p-12 border rounded-lg border-dashed">
                        <p className="text-muted-foreground">No se han creado facultades.</p>

                        <Button onClick={openNewFacultyForm} variant="outline" className="mt-4">
                            Crea tu primera facultad
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {faculties.map( faculty => (
                            <FacultyCard
                                key                 = { faculty.id }
                                faculty             = { faculty }
                                onEdit              = { openEditFacultyForm }
                                onDelete            = { openDeleteDialog }
                                onManageSubjects    = { openManageSubjects }
                                onManagePersonnel   = { openManagePersonnel }
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Faculty Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingFaculty ? "Edit Faculty" : "Create New Faculty"}
                        </DialogTitle>

                        <DialogDescription>
                            {editingFaculty
                                ? "Update the details of an existing faculty"
                                : "Fill in the details to create a new faculty"
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <FacultyForm
                        initialData={editingFaculty}
                        onSubmit={editingFaculty ? handleUpdateFaculty : handleCreateFaculty}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this faculty?</AlertDialogTitle>

                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the faculty
                            and all associated subjects and personnel assignments.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction onClick={handleDeleteFaculty} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
    )
}