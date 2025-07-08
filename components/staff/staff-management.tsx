"use client"

import { useState } from "react"

import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast }                from "sonner";


import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
}                       from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                       from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                       from "@/components/ui/table"
import {
    PersonnelForm,
    PersonnelFormValues
}                       from "@/components/staff/staff-form"
import { Button }       from "@/components/ui/button"
import { Badge }        from "@/components/ui/badge"
import { ScrollArea }   from "@/components/ui/scroll-area"
import { Role, Staff } from "@/types/staff.model";
import { useQuery } from "@tanstack/react-query";
import { KEY_QUERYS } from "@/consts/key-queries";
import { fetchData } from "@/services/fetch";
import { Input } from "../ui/input";


enum BadgeVariant {
    DEFAULT     = 'default',
    SECONDARY   = 'secondary',
    OUTLINE     = 'outline'
}


interface StaffManagementProps {
    facultyId: string;
    enabled: boolean;
}

export function StaffManagement({ facultyId, enabled }: StaffManagementProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data,
        isLoading,
        error,
        isError,
        refetch
    } = useQuery({
        queryKey    : [ KEY_QUERYS.STAFF, facultyId ],
        queryFn     : () => fetchData<Staff[]>( `staff/all/${facultyId}` ),
        enabled
    });



    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingPerson, setEditingPerson] = useState<Staff | undefined>(undefined)

    // const handleAddPerson = (data: PersonnelFormValues) => {
    //     // Create a new person with a unique ID
    //     const newPerson: Staff = {
    //         id: Date.now().toString(),
    //         ...data
    //     }

    //     // Create a new faculty object with the updated personnel array
    //     const updatedFaculty: Faculty = {
    //         ...faculty,
    //         personnel: [...faculty.personnel, newPerson]
    //     }

    //     // Update the faculty
    //     onUpdate(updatedFaculty)

    //     // Close the form
    //     setIsFormOpen(false)
    // }


    // const handleEditPerson = (data: PersonnelFormValues) => {
    //     if (!editingPerson) return

    //     // Update the person
    //     const updatedPersonnel = faculty.personnel.map(person => 
    //     person.id === editingPerson.id ? { ...person, ...data } : person
    //     )

    //     // Create a new faculty object with the updated personnel array
    //     const updatedFaculty: Faculty = {
    //         ...faculty,
    //         personnel: updatedPersonnel
    //     }

    //     // Update the faculty
    //     onUpdate(updatedFaculty)

    //     // Reset the editing state and close the form
    //     setEditingPerson(undefined)
    //     setIsFormOpen(false)
    // }


    // const handleDeletePerson = (id: string) => {
    //     // Filter out the person with the given ID
    //     const updatedPersonnel = faculty.personnel.filter(person => person.id !== id)

    //     // Create a new faculty object with the updated personnel array
    //     const updatedFaculty: Faculty = {
    //         ...faculty,
    //         personnel: updatedPersonnel
    //     }

    //     // Update the faculty
    //     onUpdate(updatedFaculty)

    //     // Show a success message
    //     toast.success("Personal eliminado exitosamente")
    // }


    const openNewPersonForm = () => {
        setEditingPerson( undefined );
        setIsFormOpen( true );
    }


    const openEditPersonForm = ( person: Staff ) => {
        setEditingPerson( person );
        setIsFormOpen( true );
    }


    const getRoleBadgeVariant = ( role: Role ): BadgeVariant => ({
        admin   : BadgeVariant.DEFAULT,
        editor  : BadgeVariant.SECONDARY,
        viewer  : BadgeVariant.OUTLINE,
    })[role] || BadgeVariant.OUTLINE


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

                    <Button onClick={openNewPersonForm} className="flex items-center">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Personal
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[400px]">
                    {
                        isLoading ? (
                            <div className="text-center p-8 text-muted-foreground">
                                Cargando personal...
                            </div>
                        ) : (
                            data!.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    Aún no se ha asignado personal a esta facultad.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>

                                            <TableHead>Cargo</TableHead>

                                            <TableHead>Correo Electrónico</TableHead>

                                            <TableHead>Rol</TableHead>

                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {data!.map((person) => (
                                            <TableRow key={person.id}>
                                                <TableCell className="font-medium">{person.name}</TableCell>
                                                <TableCell>{person.position}</TableCell>
                                                <TableCell>{person.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getRoleBadgeVariant(person.role)}>
                                                        {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditPersonForm(person)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            // onClick={() => handleDeletePerson(person.id)}
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

            {/* Personnel Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPerson ? "Editar Personal" : "Agregar Nuevo Personal"}
                        </DialogTitle>

                        <DialogDescription>
                            {editingPerson 
                                ? "Actualice los datos del personal existente" 
                                : "Agregue una nueva persona a esta facultad"
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <PersonnelForm
                        initialData = { editingPerson }
                        // onSubmit    = { editingPerson ? handleEditPerson : handleAddPerson }
                        onSubmit    = { () => {} }
                        onCancel    = { () => setIsFormOpen( false )}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
