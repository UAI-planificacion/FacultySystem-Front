"use client"

import { JSX, useEffect } from "react"

import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import * as z           from "zod";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                   from "@/components/ui/dialog";
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
import { Switch }   from "@/components/ui/switch";

import { Staff, Role } from "@/types/staff.model";


export type StaffFormValues = z.infer<typeof formSchema>;


interface StaffFormProps {
    initialData?    : Staff;
    onSubmit        : ( data: StaffFormValues ) => void;
    isOpen          : boolean;
    onClose         : () => void;
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
    isActive: z.boolean(),
});


const emptyStaff = {
    name    : "",
    email   : "",
    role    : Role.EDITOR,
    isActive: true,
}


export function StaffForm({
    initialData,
    isOpen,
    onSubmit,
    onClose,
}: StaffFormProps ): JSX.Element {
    const defaultValues: Partial<StaffFormValues> = emptyStaff;

    const form = useForm<StaffFormValues>({
        resolver: zodResolver( formSchema ),
        defaultValues,
    })


    useEffect(() => {
        if ( !isOpen ) return;

        form.reset({
            name    : initialData?.name     || emptyStaff.name,
            email   : initialData?.email    || emptyStaff.email,
            role    : initialData?.role     || emptyStaff.role,
            isActive: initialData?.isActive!,
        });
    }, [ isOpen, initialData?.id, form ]);


    const handleSubmit = async ( data: StaffFormValues ) => {
        console.log('🚀 ~ file: staff-form.tsx:81 ~ data:', data)
        onSubmit( data );
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Editar Personal" : "Agregar Nuevo Personal"}
                    </DialogTitle>

                    <DialogDescription>
                        {initialData 
                            ? "Actualice los datos del personal existente" 
                            : "Agregue una nueva persona a esta facultad"
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control = { form.control }
                            name    = "name"
                            render  = {({ field }) => (
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
                            control = { form.control }
                            name    = "email"
                            render  = {({ field }) => (
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
                            control = { form.control }
                            name    = "role"
                            render  = {({ field }) => (
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

                        {initialData && (
                            <FormField
                                control = { form.control }
                                name    = "isActive"
                                render  = {({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Activo</FormLabel>

                                            <p className="text-sm text-muted-foreground">
                                                Indica si es activo
                                            </p>
                                        </div>

                                        <FormControl>
                                            <Switch
                                                checked         = { field.value }
                                                onCheckedChange = { field.onChange }
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="flex justify-between">
                            <Button
                                type    = "button"
                                variant = "outline"
                                onClick = { onClose }
                            >
                                Cancelar
                            </Button>

                            <Button type="submit">
                                {initialData ? "Actualizar" : "Agregar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
