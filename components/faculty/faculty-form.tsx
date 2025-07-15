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
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                   from "@/components/ui/form";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button }   from "@/components/ui/button";

import { Faculty } from "@/types/faculty.model";


export type FacultyFormValues = z.infer<typeof formSchema>;


interface FacultyFormProps {
    initialData?    : Faculty;
    onSubmit        : ( data: FacultyFormValues ) => void;
    isOpen          : boolean;
    onClose         : () => void;
}


const formSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre de la facultad debe tener al menos 2 caracteres.",
    }),
    description: z.string().optional(),
})


export function FacultyForm({
    initialData,
    onSubmit,
    isOpen,
    onClose
}: FacultyFormProps ): JSX.Element {
    const defaultValues: Partial<FacultyFormValues> = {
        name        : initialData?.name || "",
        description : initialData?.description || "",
    }

    const form = useForm<FacultyFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });


    useEffect(() => {
        if ( !isOpen ) return;

        form.reset({
            name        : initialData?.name         || '',
            description : initialData?.description  || '',
        });
    }, [ isOpen, initialData?.id, form ]);


    async function handleSubmit( data: FacultyFormValues ): Promise<void> {
        onSubmit( data );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Editar Facultad" : "Crear Nueva Facultad"}
                    </DialogTitle>

                    <DialogDescription>
                        {initialData
                            ? "Actualiza los detalles de una facultad existente"
                            : "Completa los detalles para crear una nueva facultad"
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit    = { form.handleSubmit( handleSubmit )}
                        className   = "space-y-6"
                    >
                        <FormField
                            control = { form.control }
                            name    = "name"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Facultad</FormLabel>

                                    <FormControl>
                                        <Input placeholder="Facultad de Ingeniería" {...field} />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control = { form.control }
                            name    = "description"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>

                                    <FormControl>
                                        <Textarea 
                                            placeholder="Breve descripción de la facultad y sus áreas de enfoque" 
                                            className="resize-none" 
                                            {...field} 
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 items-center">
                            <Button
                                type        = "button"
                                onClick     = { onClose }
                                variant     = "outline"
                            >
                                Cancelar
                            </Button>

                            <Button type="submit">
                                {initialData ? "Actualizar" : "Crear"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
