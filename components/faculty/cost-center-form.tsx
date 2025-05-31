"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CostCenter } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface CostCenterFormProps {
  initialData?: CostCenter
  onSubmit: (data: CostCenterFormValues) => void
  onCancel: () => void
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Cost center name must be at least 2 characters.",
  }),
  code: z.string().min(2, {
    message: "Cost center code must be at least 2 characters.",
  }).max(10, {
    message: "Cost center code must be at most 10 characters."
  }),
  budget: z.coerce.number().min(0, {
    message: "Budget cannot be negative.",
  }),
})

export type CostCenterFormValues = z.infer<typeof formSchema>

export function CostCenterForm({ initialData, onSubmit, onCancel }: CostCenterFormProps) {
  const [loading, setLoading] = useState(false)
  
  // Default form values
  const defaultValues: Partial<CostCenterFormValues> = {
    name: initialData?.name || "",
    code: initialData?.code || "",
    budget: initialData?.budget || 0,
  }

  const form = useForm<CostCenterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const handleSubmit = async (data: CostCenterFormValues) => {
    try {
      setLoading(true)
      // Pass the form data to the parent component
      onSubmit(data)
      toast.success(`Cost center ${initialData ? "updated" : "created"} successfully`)
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
          {initialData ? "Edit Cost Center" : "Add New Cost Center"}
        </CardTitle>
        <CardDescription>
          {initialData ? "Update the details of an existing cost center" : "Add a new cost center to this faculty"}
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
                  <FormLabel>Cost Center Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Research Department" {...field} />
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
                  <FormLabel>Cost Center Code</FormLabel>
                  <FormControl>
                    <Input placeholder="RES-DEP" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique code for the cost center
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="500000"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Annual budget allocated to this cost center
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
          {initialData ? "Update Cost Center" : "Add Cost Center"}
        </Button>
      </CardFooter>
    </Card>
  )
}