"use client"

import { useState } from "react"
import { Faculty, Person, Role } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { PersonnelForm, PersonnelFormValues } from "./personnel-form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface PersonnelManagementProps {
  faculty: Faculty
  onUpdate: (updatedFaculty: Faculty) => void
}

export function PersonnelManagement({ faculty, onUpdate }: PersonnelManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | undefined>(undefined)
  
  const handleAddPerson = (data: PersonnelFormValues) => {
    // Create a new person with a unique ID
    const newPerson: Person = {
      id: Date.now().toString(),
      ...data
    }
    
    // Create a new faculty object with the updated personnel array
    const updatedFaculty: Faculty = {
      ...faculty,
      personnel: [...faculty.personnel, newPerson]
    }
    
    // Update the faculty
    onUpdate(updatedFaculty)
    
    // Close the form
    setIsFormOpen(false)
  }
  
  const handleEditPerson = (data: PersonnelFormValues) => {
    if (!editingPerson) return
    
    // Update the person
    const updatedPersonnel = faculty.personnel.map(person => 
      person.id === editingPerson.id ? { ...person, ...data } : person
    )
    
    // Create a new faculty object with the updated personnel array
    const updatedFaculty: Faculty = {
      ...faculty,
      personnel: updatedPersonnel
    }
    
    // Update the faculty
    onUpdate(updatedFaculty)
    
    // Reset the editing state and close the form
    setEditingPerson(undefined)
    setIsFormOpen(false)
  }
  
  const handleDeletePerson = (id: string) => {
    // Filter out the person with the given ID
    const updatedPersonnel = faculty.personnel.filter(person => person.id !== id)
    
    // Create a new faculty object with the updated personnel array
    const updatedFaculty: Faculty = {
      ...faculty,
      personnel: updatedPersonnel
    }
    
    // Update the faculty
    onUpdate(updatedFaculty)
    
    // Show a success message
    toast.success("Personnel removed successfully")
  }
  
  const openNewPersonForm = () => {
    setEditingPerson(undefined)
    setIsFormOpen(true)
  }
  
  const openEditPersonForm = (person: Person) => {
    setEditingPerson(person)
    setIsFormOpen(true)
  }

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">
              Personnel for {faculty.name}
            </CardTitle>
            <CardDescription>
              Manage the personnel assigned to this faculty
            </CardDescription>
          </div>
          <Button onClick={openNewPersonForm} className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Add Personnel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {faculty.personnel.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No personnel have been assigned to this faculty yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty.personnel.map((person) => (
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
                          onClick={() => handleDeletePerson(person.id)}
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
          )}
        </ScrollArea>
      </CardContent>
      
      {/* Personnel Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingPerson ? "Edit Personnel" : "Add New Personnel"}
            </DialogTitle>
            <DialogDescription>
              {editingPerson 
                ? "Update the details of existing personnel" 
                : "Add a new person to this faculty"
              }
            </DialogDescription>
          </DialogHeader>
          <PersonnelForm
            initialData={editingPerson}
            onSubmit={editingPerson ? handleEditPerson : handleAddPerson}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}