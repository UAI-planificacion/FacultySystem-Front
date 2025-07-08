"use client"

import { useState } from "react"

import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SubjectForm, SubjectFormValues } from "@/components/subject/subject-form"

import { Subject } from "@/types/subject.model"
import { useQuery } from "@tanstack/react-query"
import { KEY_QUERYS } from "@/consts/key-queries"
import { ENV } from "@/config/envs/env"
import { Input } from "../ui/input"
import { dateToString } from "@/lib/utils"
import { fetchData } from "@/services/fetch"


interface SubjectsManagementProps {
    facultyId: string;
    enabled: boolean;
}


export function SubjectsManagement({ facultyId, enabled }: SubjectsManagementProps) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingSubject, setEditingSubject] = useState<Subject | undefined>(undefined)
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: subjects,
        isLoading,
        error,
        isError,
        refetch
    } = useQuery({
        queryKey    : [ KEY_QUERYS.SUBJECTS, facultyId ],
        queryFn     : () => fetchData<Subject[]>( `subjects/all/${facultyId}` ),
        enabled     : enabled,
    });
    
    // const handleAddSubject = (data: SubjectFormValues) => {
    //     // Create a new subject with a unique ID
    //     const newSubject: Subject = {
    //         id: Date.now().toString(),
    //         ...data
    //     }

    //     // Create a new faculty object with the updated subjects array
    //     const updatedFaculty: Faculty = {
    //     ...faculty,
    //     subjects: [...faculty.subjects, newSubject]
    //     }

    //     // Update the faculty
    //     onUpdate(updatedFaculty)

    //     // Close the form
    //     setIsFormOpen(false)
    // }
    
    // const handleEditSubject = (data: SubjectFormValues) => {
    //     if (!editingSubject) return
        
    //     // Update the subject
    //     const updatedSubjects = faculty.subjects.map(subject => 
    //     subject.id === editingSubject.id ? { ...subject, ...data } : subject
    //     )
        
    //     // Create a new faculty object with the updated subjects array
    //     const updatedFaculty: Faculty = {
    //     ...faculty,
    //     subjects: updatedSubjects
    //     }
        
    //     // Update the faculty
    //     onUpdate(updatedFaculty)
        
    //     // Reset the editing state and close the form
    //     setEditingSubject(undefined)
    //     setIsFormOpen(false)
    // }
    
    // const handleDeleteSubject = (id: string) => {
    //     // Filter out the subject with the given ID
    //     const updatedSubjects = faculty.subjects.filter(subject => subject.id !== id)
        
    //     // Create a new faculty object with the updated subjects array
    //     const updatedFaculty: Faculty = {
    //     ...faculty,
    //     subjects: updatedSubjects
    //     }
        
    //     // Update the faculty
    //     onUpdate(updatedFaculty)
        
    //     // Show a success message
    //     toast.success("Subject deleted successfully")
    // }
    
    const openNewSubjectForm = () => {
        setEditingSubject(undefined)
        setIsFormOpen(true)
    }
    
    const openEditSubjectForm = (subject: Subject) => {
        setEditingSubject(subject)
        setIsFormOpen(true)
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Input
                        type        = "search"
                        placeholder = "Buscar asignatura..."
                        value       = {searchQuery}
                        className   = "w-full max-w-md"
                        onChange    = {(e) => setSearchQuery(e.target.value)}
                    />

                    <Button onClick={openNewSubjectForm} className="flex items-center">
                        <Plus className="h-4 w-4 mr-1" />
                        Crear Asignatura
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[calc(100vh-350px)]">
                    {
                        isLoading ? (
                            <div className="text-center p-8 text-muted-foreground">
                                Loading subjects...
                            </div>
                        ) : (
                            subjects!.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                No subjects have been added to this faculty yet.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>

                                            <TableHead>Nombre</TableHead>

                                            <TableHead>Fecha Inicio</TableHead>

                                            <TableHead>Fecha Fin</TableHead>

                                            <TableHead className="text-right">Alumnos</TableHead>

                                            <TableHead>Centro de Costo</TableHead>

                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {subjects!.map((subject) => (
                                            <TableRow key={subject.id}>
                                                <TableCell className="font-medium">{subject.id}</TableCell>

                                                <TableCell>{subject.name}</TableCell>

                                                <TableCell>{dateToString(subject.startDate)}</TableCell>

                                                <TableCell>{dateToString(subject.endDate)}</TableCell>

                                                <TableCell className="text-right">{subject.students}</TableCell>

                                                <TableCell>{subject.costCenterId}</TableCell>

                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditSubjectForm(subject)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            // onClick={() => handleDeleteSubject(subject.id)}
                                                            className="text-destructive hover:text-destructive/90"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )
                        )
                    }
                </ScrollArea>
            </CardContent>

            {/* Subject Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                    {editingSubject ? "Edit Subject" : "Add New Subject"}
                    </DialogTitle>
                    <DialogDescription>
                    {editingSubject 
                        ? "Update the details of an existing subject" 
                        : "Add a new subject to this faculty"
                    }
                    </DialogDescription>
                </DialogHeader>
                <SubjectForm
                    initialData={editingSubject}
                    // onSubmit={editingSubject ? handleEditSubject : handleAddSubject}
                    onSubmit={() => {}}
                    onCancel={() => setIsFormOpen(false)}
                />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
