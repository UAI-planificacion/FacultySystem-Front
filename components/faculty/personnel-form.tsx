"use client"

import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Person, Role } from "@/app/types"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
}                   from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                   from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                   from "@/components/ui/select";
import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";

interface PersonnelFormProps {
    initialData?: Person
    onSubmit: (data: PersonnelFormValues) => void
    onCancel: () => void
}

// Form validation schema
const formSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string().email({
        message: "Por favor ingresa una dirección de correo válida.",
    }),
    position: z.string().min(2, {
        message: "El cargo debe tener al menos 2 caracteres.",
    }),
    role: z.enum(["admin", "editor", "viewer"] as const, {
        message: "Por favor selecciona un rol válido.",
    }),
})

export type PersonnelFormValues = z.infer<typeof formSchema>

export function PersonnelForm({ initialData, onSubmit, onCancel }: PersonnelFormProps) {
    const [loading, setLoading] = useState(false)
    
    // Default form values
    const defaultValues: Partial<PersonnelFormValues> = {
        name        : initialData?.name || "",
        email       : initialData?.email || "",
        position    : initialData?.position || "",
        role        : initialData?.role || "viewer",
    }

    const form = useForm<PersonnelFormValues>({
        resolver: zodResolver( formSchema ),
        defaultValues,
    })

    const handleSubmit = async (data: PersonnelFormValues) => {
        try {
            setLoading(true)
            onSubmit(data)
            toast.success(`Personal ${initialData ? "actualizado" : "agregado"} exitosamente`)
        } catch (error) {
            toast.error("Algo salió mal")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl font-bold">
                    {initialData ? "Editar Personal" : "Agregar Nuevo Personal"}
                </CardTitle>

                <CardDescription>
                    {initialData ? "Actualiza los detalles del personal existente" : "Agrega una nueva persona a esta facultad"}
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
                                    <FormLabel>Nombre</FormLabel>

                                    <FormControl>
                                        <Input placeholder="Dr. Juan Pérez" {...field} />
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
                                    <FormLabel>Correo Electrónico</FormLabel>

                                    <FormControl>
                                        <Input placeholder="juan.perez@universidad.edu" type="email" {...field} />
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
                                    <FormLabel>Cargo</FormLabel>

                                    <FormControl>
                                        <Input placeholder="Decano" {...field} />
                                    </FormControl>

                                    <FormDescription>
                                        El cargo o título de esta persona dentro de la facultad
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
                                    <FormLabel>Rol</FormLabel>

                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un rol" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="viewer">Visualizador</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <FormDescription>
                                        Administrador: Acceso completo para ver y editar
                                        <br />
                                        Editor: Puede ver y hacer cambios
                                        <br />
                                        Visualizador: Solo puede ver información
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
                    Cancelar
                </Button>

                <Button type="submit" disabled={loading} onClick={form.handleSubmit(handleSubmit)}>
                    {initialData ? "Actualizar Personal" : "Agregar Personal"}
                </Button>
            </CardFooter>
        </Card>
    );
}