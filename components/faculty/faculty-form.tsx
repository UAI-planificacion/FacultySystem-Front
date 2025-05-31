"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Faculty } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface FacultyFormProps {
  initialData?: Faculty
  onSubmit: (data: FacultyFormValues) => void
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Faculty name must be at least 2 characters.",
  }),
  code: z.string().min(2, {
    message: "Faculty code must be at least 2 characters.",
  }).max(10, {
    message: "Faculty code must be at most 10 characters."
  }),
  description: z.string().optional(),
})

export type FacultyFormValues = z.infer<typeof formSchema>

export function FacultyForm({ initialData, onSubmit }: FacultyFormProps) {
  const [loading, setLoading] = useState(false)
  
  // Default form values
  const defaultValues: Partial<FacultyFormValues> = {
    name: initialData?.name || "",
    code: initialData?.code || "",
    description: initialData?.description || "",
  }

  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const handleSubmit = async (data: FacultyFormValues) => {
    try {
      setLoading(true)
      // Pass the form data to the parent component
      onSubmit(data)
      toast.success(`Faculty ${initialData ? "updated" : "created"} successfully`)
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {initialData ? "Edit Faculty" : "Create New Faculty"}
        </CardTitle>
        <CardDescription>
          {initialData ? "Update the details of an existing faculty" : "Add a new faculty to the system"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Faculty of Engineering" {...field} />
                  </FormControl>
                  <FormDescription>
                    The full name of the faculty.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Code</FormLabel>
                  <FormControl>
                    <Input placeholder="ENG" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique code for the faculty (e.g., ENG, SCI, MED).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the faculty and its focus areas" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description of the faculty's focus areas and departments.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {initialData ? "Update Faculty" : "Create Faculty"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}