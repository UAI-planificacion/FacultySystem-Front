"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Subject } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface SubjectFormProps {
  initialData?: Subject
  onSubmit: (data: SubjectFormValues) => void
  onCancel: () => void
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Subject name must be at least 2 characters.",
  }),
  code: z.string().min(2, {
    message: "Subject code must be at least 2 characters.",
  }).max(10, {
    message: "Subject code must be at most 10 characters."
  }),
  maxStudents: z.coerce.number().min(1, {
    message: "Maximum students must be at least 1.",
  }).max(1000, {
    message: "Maximum students cannot exceed 1000."
  }),
  description: z.string().optional(),
  costCenterCode: z.string().min(2, {
    message: "Cost center code must be at least 2 characters.",
  }),
  costCenterName: z.string().min(2, {
    message: "Cost center name must be at least 2 characters.",
  }),
})

export type SubjectFormValues = z.infer<typeof formSchema>

export function SubjectForm({ initialData, onSubmit, onCancel }: SubjectFormProps) {
  const [loading, setLoading] = useState(false)
  
  // Default form values
  const defaultValues: Partial<SubjectFormValues> = {
    name: initialData?.name || "",
    code: initialData?.code || "",
    maxStudents: initialData?.maxStudents || 30,
    description: initialData?.description || "",
    costCenterCode: initialData?.costCenter?.code || "",
    costCenterName: initialData?.costCenter?.name || "",
  }

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const handleSubmit = async (data: SubjectFormValues) => {
    try {
      setLoading(true)
      // Create the cost center object
      const formattedData = {
        ...data,
        costCenter: {
          id: initialData?.costCenter?.id || Date.now().toString(),
          code: data.costCenterCode,
          name: data.costCenterName,
        }
      }
      // Remove the individual cost center fields
      delete (formattedData as any).costCenterCode
      delete (formattedData as any).costCenterName
      
      onSubmit(formattedData)
      toast.success(`Subject ${initialData ? "updated" : "created"} successfully`)
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {initialData ? "Edit Subject" : "Add New Subject"}
        </CardTitle>
        <CardDescription>
          {initialData ? "Update the details of an existing subject" : "Add a new subject to this faculty"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduction to Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Code</FormLabel>
                  <FormControl>
                    <Input placeholder="CS101" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique code for the subject
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxStudents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Students</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={1000} {...field} />
                  </FormControl>
                  <FormDescription>
                    Maximum number of students allowed in this subject
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-medium">Cost Center Information</h3>
              <FormField
                control={form.control}
                name="costCenterCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Center Code</FormLabel>
                    <FormControl>
                      <Input placeholder="ENG" {...field} />
                    </FormControl>
                    <FormDescription>
                      A code for the cost center (e.g., ENG, SCI)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costCenterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Center Name</FormLabel>
                    <FormControl>
                      <Input placeholder="ENGINEERING-101" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name for the cost center (e.g., ENGINEERING-101)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the subject" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} onClick={form.handleSubmit(handleSubmit)}>
          {initialData ? "Update Subject" : "Add Subject"}
        </Button>
      </CardFooter>
    </Card>
  )
}