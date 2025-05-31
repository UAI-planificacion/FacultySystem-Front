"use client"

import { useState } from "react"
import { Faculty, Subject } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { SubjectForm, SubjectFormValues } from "./subject-form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface SubjectsManagementProps {
  faculty: Faculty
  onUpdate: (updatedFaculty: Faculty) => void
}

export function SubjectsManagement({ faculty, onUpdate }: SubjectsManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>(undefined)
  
  const handleAddSubject = (data: SubjectFormValues) => {
    // Create a new subject with a unique ID
    const newSubject: Subject = {
      id: Date.now().toString(),
      ...data
    }
    
    // Create a new faculty object with the updated subjects array
    const updatedFaculty: Faculty = {
      ...faculty,
      subjects: [...faculty.subjects, newSubject]
    }
    
    // Update the faculty
    onUpdate(updatedFaculty)
    
    // Close the form
    setIsFormOpen(false)
  }
  
  const handleEditSubject = (data: SubjectFormValues) => {
    if (!editingSubject) return
    
    // Update the subject
    const updatedSubjects = faculty.subjects.map(subject => 
      subject.id === editingSubject.id ? { ...subject, ...data } : subject
    )
    
    // Create a new faculty object with the updated subjects array
    const updatedFaculty: Faculty = {
      ...faculty,
      subjects: updatedSubjects
    }
    
    // Update the faculty
    onUpdate(updatedFaculty)
    
    // Reset the editing state and close the form
    setEditingSubject(undefined)
    setIsFormOpen(false)
  }
  
  const handleDeleteSubject = (id: string) => {
    // Filter out the subject with the given ID
    const updatedSubjects = faculty.subjects.filter(subject => subject.id !== id)
    
    // Create a new faculty object with the updated subjects array
    const updatedFaculty: Faculty = {
      ...faculty,
      subjects: updatedSubjects
    }
    
    // Update the faculty
    onUpdate(updatedFaculty)
    
    // Show a success message
    toast.success("Subject deleted successfully")
  }
  
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
          <div>
            <CardTitle className="text-xl font-bold">
              Subjects for {faculty.name}
            </CardTitle>
            <CardDescription>
              Manage the subjects offered by this faculty
            </CardDescription>
          </div>
          <Button onClick={openNewSubjectForm} className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Add Subject
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {faculty.subjects.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No subjects have been added to this faculty yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Cost Center</TableHead>
                  <TableHead className="text-right">Max Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty.subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.costCenter ? `${subject.costCenter.code}-${subject.costCenter.name}` : 'Not assigned'}</TableCell>
                    <TableCell className="text-right">{subject.maxStudents}</TableCell>
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
                          onClick={() => handleDeleteSubject(subject.id)}
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
            onSubmit={editingSubject ? handleEditSubject : handleAddSubject}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}