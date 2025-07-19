"use client"

import { JSX, useEffect, useMemo } from "react";

import { zodResolver }                  from "@hookform/resolvers/zod";
import { faker }                        from '@faker-js/faker/locale/es';
import { useForm, SubmitHandler }       from "react-hook-form";
import { useMutation, useQueryClient }  from "@tanstack/react-query";
import { toast }                        from "sonner";
import { Loader2 }                      from "lucide-react";
import * as z                           from "zod";


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

import {
    Professor,
    CreateProfessor,
    UpdateProfessor
}                                   from "@/types/professor";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { ENV }                      from "@/config/envs/env";
import { cn }                       from "@/lib/utils";


const endpoint = 'professors';


const formSchema = z.object({
    id: z.string().min(1, {
        message: "El ID es requerido.",
    }),
    name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string()
        .transform(val => val === "" ? null : val)
        .refine(val => val === null || z.string().email().safeParse(val).success, {
            message: "Por favor ingresa una dirección de correo válida.",
        }),
    isMock: z.boolean().default( false ),
});


export type ProfessorFormValues = z.infer<typeof formSchema>;


interface ProfessorFormProps {
    initialData?    : Omit<Professor, 'oldId'>;
    isOpen          : boolean;
    onClose         : () => void;
}


const emptyProfessor: Professor = {
    id      : "",
    name    : "",
    email   : null,
    isMock  : false,
}


/**
 * API call para crear un nuevo profesor
 */
const createProfessorApi = async ( newProfessor: CreateProfessor ): Promise<Professor>  =>
    fetchApi<Professor>({
        isApi   : false,
        url     : `${ENV.ACADEMIC_SECTION}${endpoint}`,
        method  : Method.POST,
        body    : newProfessor
    });


/**
 * API call para actualizar un profesor existente
 */
const updateProfessorApi = async ( updatedProfessor: UpdateProfessor ): Promise<Professor>  =>
    fetchApi<Professor>({
        isApi   : false,
        url     : `${ENV.ACADEMIC_SECTION}${endpoint}/${updatedProfessor.id}`,
        method  : Method.PATCH,
        body    : updatedProfessor
    });


export function ProfessorForm({
    initialData,
    isOpen,
    onClose,
}: ProfessorFormProps ): JSX.Element {
    const queryClient                               = useQueryClient();
    const defaultValues: Partial<ProfessorFormValues> = emptyProfessor;
    const oldId                                     = useMemo(() => initialData?.id || "", [initialData?.id]);


    const form = useForm<ProfessorFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues,
        mode: 'onChange',
    });


    /**
     * Mutación para crear un profesor
     */
    const createProfessorMutation = useMutation<Professor, Error, CreateProfessor>({
        mutationFn: createProfessorApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.PROFESSORS ]});
            onClose();
            toast( 'Profesor creado exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast(`Error al crear profesor: ${mutationError.message}`, errorToast );
        },
    });


    /**
     * Mutación para actualizar un profesor
     */
    const updateProfessorMutation = useMutation<Professor, Error, UpdateProfessor>({
        mutationFn: updateProfessorApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.PROFESSORS] });
            onClose();
            toast( 'Profesor actualizado exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al actualizar profesor: ${mutationError.message}`, errorToast );
        },
    });


    useEffect(() => {
        if ( !isOpen ) return;

        form.reset({
            id      : initialData?.id       || "",
            name    : initialData?.name     || "",
            email   : initialData?.email    || "",
            isMock  : initialData?.isMock   || false,
        });
    }, [ isOpen, initialData, form ]);


    /**
     * Maneja el envío del formulario de profesor
     */
    const handleSubmit: SubmitHandler<ProfessorFormValues> = (data) => {
        console.log('🚀 ~ file: professor-form.tsx:86 ~ data:', data)

        if ( initialData ) {
            updateProfessorMutation.mutate({
                ...data,
                id: data.id
            } as UpdateProfessor );
        } else {
            createProfessorMutation.mutate({
                ...data,
            } as CreateProfessor );
        }
    }


    const normalizeForEmail = ( text: string ): string =>
        text
        .normalize( 'NFD' )
        .replace( /[\u0300-\u036f]/g, '' )
        .replace( /ñ/g, 'n' )
        .replace( /Ñ/g, 'N' )
        .toLowerCase()
        .split( ' ' )
        .join( '.' );


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


    const isLoading = createProfessorMutation.isPending || updateProfessorMutation.isPending;


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
                            control = { form.control }
                            name    = "id"
                            render  = {({ field }) => (
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
                            control = { form.control }
                            name    = "name"
                            render  = {({ field }) => (
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
                            control = { form.control }
                            name    = "email"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="juan.perez@uai.cl"
                                            type="email"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {initialData && (
                            <FormField
                                control = { form.control }
                                name    = "isMock"
                                render  = {({ field }) => (
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

                        <div className={cn(
                            "flex pt-2 gap-2",
                            initialData ? "justify-end" : "justify-between"
                        )}>
                            {!initialData && (
                                <Button
                                    type    = "button"
                                    variant = "outline"
                                    onClick = { generateTestProfessor }
                                >
                                    Generar Profesor de Prueba
                                </Button>
                            )}

                            <div className={cn(
                                "flex gap-2 items-center",
                                initialData ? "justify-between w-full" : ""
                            )}>
                                <Button
                                    type    = "button"
                                    variant = "outline"
                                    onClick = { onClose }
                                >
                                    Cancelar
                                </Button>

                                <Button type="submit" disabled={!form.formState.isValid || isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {initialData ? "Actualizando..." : "Creando..."}
                                        </>
                                    ) : (
                                        initialData ? "Actualizar" : "Agregar"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
