"use client"

import { useState, useEffect } from "react"

import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import * as z           from "zod";
import { toast }        from "sonner";

import { Faculty } from "@/app/types";

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

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";

import { ErrorApi, fetchApi, isErrorApi } from "@/services/fetch";
import LoaderMini from "@/icons/LoaderMini";


interface FacultyFormProps {
    initialData?    : Faculty;
    onSubmit        : ( data: Faculty ) => void;
    isOpen          : boolean;
    onClose         : () => void;
}


const formSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre de la facultad debe tener al menos 2 caracteres.",
    }),
    description: z.string().optional(),
})


export type FacultyFormValues = z.infer<typeof formSchema>;


export function FacultyForm({
    initialData,
    onSubmit,
    isOpen,
    onClose
}: FacultyFormProps ): JSX.Element {
    console.log('🚀 ~ file: faculty-form.tsx:58 ~ initialData:', initialData)

    const [loading, setLoading] = useState( false );

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
    }, [isOpen, initialData?.id]);


    async function handleSubmit( data: FacultyFormValues ): Promise<void> {
        console.log('🚀 ~ file: faculty-form.tsx:75 ~ onSubmit:', data)

        setLoading( true );

        const saved = initialData
            ? await onUpdateFaculty( data )
            : await onCreateFaculty( data );

        if ( !saved ) {
            toast( 'Ocurrió un problema al guardar la facultad', errorToast );
            setLoading( false );
            return;
        }

        setLoading( false );
        onSubmit( saved );

        toast( `Facultad ${!initialData ? "creada" : "actualizada"} exitosamente`, successToast );
    }


    async function onCreateFaculty( data: FacultyFormValues ): Promise<Faculty | null> {
        const url   = `${ENV.REQUEST_BACK_URL}faculties`;
        const saved = await fetchApi<Faculty | ErrorApi>( url, "POST", data );

        if ( isErrorApi( saved )) return null;

        return saved;
    }


    async function onUpdateFaculty( data: FacultyFormValues ): Promise<Faculty | null> {
        const url   = `${ENV.REQUEST_BACK_URL}faculties/${initialData!.id}`;
        const saved = await fetchApi<Faculty | ErrorApi>( url, "PATCH", data );

        if ( isErrorApi( saved )) return null;

        return saved;
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
                                disabled    = { loading }
                                className   = "flex items-center gap-2"
                            >
                                Cancelar

                                {loading && <LoaderMini />}
                            </Button>

                            <Button
                                type        = "submit"
                                disabled    = { loading }
                                className   = "flex items-center gap-2"
                            >
                                {initialData ? "Actualizar" : "Crear"}

                                {loading && <LoaderMini />}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
