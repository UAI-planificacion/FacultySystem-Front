"use client"

import { useState } from "react"

import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import * as z           from "zod";
import { toast }        from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                       from "@/components/ui/dialog"
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

import { Staff } from "@/types/staff.model"


interface PersonnelFormProps {
    initialData?    : Staff
    isFormOpen      : boolean
    setIsFormOpen   : (open: boolean) => void
    onSubmit        : (data: PersonnelFormValues) => void
    onCancel        : () => void,
    editingPerson   : Staff | undefined,
    setEditingPerson: (person: Staff | undefined) => void,
}


const formSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string().email({
        message: "Por favor ingresa una dirección de correo válida.",
    }),
    role: z.enum(["ADMIN", "EDITOR", "VIEWER"] as const, {
        message: "Por favor selecciona un rol válido.",
    }),
})


export type PersonnelFormValues = z.infer<typeof formSchema>


export function StaffForm({ initialData, isFormOpen, setIsFormOpen, onSubmit, onCancel, editingPerson, setEditingPerson }: PersonnelFormProps) {
    const [loading, setLoading] = useState(false)

    const defaultValues: Partial<PersonnelFormValues> = {
        name        : initialData?.name || "",
        email       : initialData?.email || "",
        role        : initialData?.role || "VIEWER",
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
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[500px]">
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
                                            <SelectItem value="ADMIN">Administrador</SelectItem>
                                            <SelectItem value="EDITOR">Editor</SelectItem>
                                            <SelectItem value="VIEWER">Visualizador</SelectItem>
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

                <div className="flex justify-between">
                    <Button variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>

                    <Button type="submit" disabled={loading} onClick={form.handleSubmit(handleSubmit)}>
                        {initialData ? "Actualizar Personal" : "Agregar Personal"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
