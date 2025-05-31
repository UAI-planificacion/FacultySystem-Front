"use client"

import { useState } from "react"
import { Faculty, CostCenter } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { CostCenterForm, CostCenterFormValues } from "./cost-center-form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface CostCentersManagementProps {
  faculty: Faculty
  onUpdate: (updatedFaculty: Faculty) => void
}

export function CostCentersManagement({ faculty, onUpdate }: CostCentersManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | undefined>(undefined)
  
  const handleAddCostCenter = (data: CostCenterFormValues) => {
    // Create a new cost center with a unique ID
    const newCostCenter: CostCenter = {
      id: Date.now().toString(),
      ...data
    }
    
    // Create a new faculty object with the updated cost centers array
    const updatedFaculty: Faculty = {
      ...faculty,
      costCenters: [...faculty.costCenters, newCostCenter]
    }
    
    // Update the faculty
    onUpdate(updatedFaculty)
    
    // Close the form
    setIsFormOpen(false)
  }
  
  const handleEditCostCenter = (data: CostCenterFormValues) => {
    if (!editingCostCenter) return
    
    // Update the cost center
    const updatedCostCenters = faculty.costCenters.map(costCenter => 
      costCenter.id === editingCostCenter.id ? { ...costCenter, ...data } : costCenter
    )
    
    // Create a new faculty object with the updated cost centers array
    const updatedFaculty: Faculty = {
      ...faculty,
      costCenters: updatedCostCenters
    }
    
    // Update the faculty
    onUpdate(updatedFaculty)
    
    // Reset the editing state and close the form
    setEditingCostCenter(undefined)
    setIsFormOpen(false)
  }
  
  const handleDeleteCostCenter = (id: string) => {
    // Filter out the cost center with the given ID
    const updatedCostCenters = faculty.costCenters.filter(costCenter => costCenter.id !== id)
    
    // Create a new faculty object with the updated cost centers array
    const updatedFaculty: Faculty = {
      ...faculty,
      costCenters: updatedCostCenters
    }
    
    // Update the faculty
    onUpdate(updatedFaculty)
    
    // Show a success message
    toast.success("Cost center deleted successfully")
  }
  
  const openNewCostCenterForm = () => {
    setEditingCostCenter(undefined)
    setIsFormOpen(true)
  }
  
  const openEditCostCenterForm = (costCenter: CostCenter) => {
    setEditingCostCenter(costCenter)
    setIsFormOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">
              Cost Centers for {faculty.name}
            </CardTitle>
            <CardDescription>
              Manage the cost centers allocated to this faculty
            </CardDescription>
          </div>
          <Button onClick={openNewCostCenterForm} className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Add Cost Center
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {faculty.costCenters.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No cost centers have been added to this faculty yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty.costCenters.map((costCenter) => (
                  <TableRow key={costCenter.id}>
                    <TableCell className="font-medium">{costCenter.name}</TableCell>
                    <TableCell>{costCenter.code}</TableCell>
                    <TableCell className="text-right">{formatCurrency(costCenter.budget)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditCostCenterForm(costCenter)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCostCenter(costCenter.id)}
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
      
      {/* Cost Center Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCostCenter ? "Edit Cost Center" : "Add New Cost Center"}
            </DialogTitle>
            <DialogDescription>
              {editingCostCenter 
                ? "Update the details of an existing cost center" 
                : "Add a new cost center to this faculty"
              }
            </DialogDescription>
          </DialogHeader>
          <CostCenterForm
            initialData={editingCostCenter}
            onSubmit={editingCostCenter ? handleEditCostCenter : handleAddCostCenter}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}