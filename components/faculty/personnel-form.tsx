"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Person, Role } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface PersonnelFormProps {
  initialData?: Person
  onSubmit: (data: PersonnelFormValues) => void
  onCancel: () => void
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  position: z.string().min(2, {
    message: "Position must be at least 2 characters.",
  }),
  role: z.enum(["admin", "editor", "viewer"] as const, {
    message: "Please select a valid role.",
  }),
})

export type PersonnelFormValues = z.infer<typeof formSchema>

export function PersonnelForm({ initialData, onSubmit, onCancel }: PersonnelFormProps) {
  const [loading, setLoading] = useState(false)
  
  // Default form values
  const defaultValues: Partial<PersonnelFormValues> = {
    name: initialData?.name || "",
    email: initialData?.email || "",
    position: initialData?.position || "",
    role: initialData?.role || "viewer",
  }

  const form = useForm<PersonnelFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const handleSubmit = async (data: PersonnelFormValues) => {
    try {
      setLoading(true)
      // Pass the form data to the parent component
      onSubmit(data)
      toast.success(`Personnel ${initialData ? "updated" : "added"} successfully`)
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
          {initialData ? "Edit Personnel" : "Add New Personnel"}
        </CardTitle>
        <CardDescription>
          {initialData ? "Update the details of existing personnel" : "Add a new person to this faculty"}
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="jane.smith@university.edu" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Dean" {...field} />
                  </FormControl>
                  <FormDescription>
                    The position or title of this person within the faculty
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Admin: Full access to view and edit
                    <br />
                    Editor: Can view and make changes
                    <br />
                    Viewer: Can only view information
                  </FormDescription>
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
          {initialData ? "Update Personnel" : "Add Personnel"}
        </Button>
      </CardFooter>
    </Card>
  )
}