"use client"

import { JSX, useEffect, useMemo } from "react";

import { zodResolver }              from "@hookform/resolvers/zod";
import { faker }                    from '@faker-js/faker/locale/es';
import { useForm, SubmitHandler }   from "react-hook-form";
import * as z                       from "zod";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
}                   from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
}                   from "@/components/ui/form";
import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";
import { Switch }   from "@/components/ui/switch";

import { Professor } from "@/types/request";


const formSchema = z.object({
    id: z.string().min(1, {
        message: "El ID es requerido.",
    }),
    name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string().email({
        message: "Por favor ingresa una dirección de correo válida.",
    }),
    isMock: z.boolean().default(false),
})


export type ProfessorFormValues = z.infer<typeof formSchema>


interface ProfessorFormProps {
    initialData?: Omit<Professor, 'oldId'>;
    onSubmit: (data: Omit<Professor, 'oldId'> & { oldId?: string }) => void;
    isOpen: boolean;
    onClose: () => void;
}


const emptyProfessor: Professor = {
    id      : "",
    name    : "",
    email   : "",
    isMock  : false,
}


export function ProfessorForm({
    initialData,
    isOpen,
    onSubmit,
    onClose,
}: ProfessorFormProps): JSX.Element {
    const defaultValues: Partial<ProfessorFormValues> = emptyProfessor;
    const oldId = useMemo(() => initialData?.id || "", [initialData?.id]);


    const form = useForm<ProfessorFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues,
        mode: 'onChange',
    });


    useEffect(() => {
        if (!isOpen) return;

        form.reset({
            id: initialData?.id || "",
            name: initialData?.name || "",
            email: initialData?.email || "",
            isMock: initialData?.isMock || false,
        });
    }, [isOpen, initialData?.id, form]);


    const handleSubmit: SubmitHandler<ProfessorFormValues> = (data) => {
        console.log('🚀 ~ file: professor-form.tsx:86 ~ data:', data)
        onSubmit({ ...data, oldId })
    }


    const normalizeForEmail = ( text: string ): string =>
        text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n')
        .replace(/Ñ/g, 'N')
        .toLowerCase()
        .split(' ')
        .join('.');


    function generateTestProfessor(): void {
        const firstName             = faker.person.firstName();
        const lastName              = faker.person.lastName();
        const name                  = `TEST-${firstName} ${lastName}`;
        const normalizedFirstName   = normalizeForEmail( firstName );
        const normalizedLastName    = normalizeForEmail( lastName );
        const email                 = `test.${normalizedFirstName}.${normalizedLastName}@uai.cl`

        form.reset({
            id: `P${Math.floor(1000 + Math.random() * 900000)}`,
            name,
            email,
            isMock: true,
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Editar Profesor" : "Agregar Nuevo Profesor"}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? "Actualice los datos del profesor"
                            : "Complete los datos del nuevo profesor"}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID del Profesor</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: P1234"
                                            {...field}
                                            disabled={!!initialData}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Juan Pérez" {...field} />
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
                                        <Input
                                            placeholder="juan.perez@universidad.edu"
                                            type="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {initialData && (
                            <FormField
                                control={form.control}
                                name="isMock"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Es un profesor de prueba
                                            </FormLabel>

                                            <p className="text-sm text-muted-foreground">
                                                Desactiva esto para convertir en un profesor real
                                            </p>
                                        </div>

                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="flex justify-between pt-4">
                            {!initialData && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generateTestProfessor}
                                >
                                    Generar Profesor de Prueba
                                </Button>
                            )}

                            <div className="flex gap-2 ml-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                >
                                    Cancelar
                                </Button>

                                <Button type="submit" disabled={!form.formState.isValid}>
                                    {initialData ? "Actualizar" : "Agregar"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
