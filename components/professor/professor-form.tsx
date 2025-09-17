"use client"

import { JSX, useEffect, useMemo } from "react";

import {
    useForm,
    SubmitHandler,
    ControllerRenderProps
}                                       from "react-hook-form";
import { zodResolver }                  from "@hookform/resolvers/zod";
import { faker }                        from '@faker-js/faker/locale/es';
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
import { cn }                       from "@/lib/utils";


const endpoint = 'professors';


const TEST = {
    name : 'TEST-',
    email : 'test.'
}


const formSchema = z.object({
    id: z.string().min(1, {
        message: "El ID es requerido.",
    }),
    name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string()
    .regex(/^[a-zA-Z0-9._-]+$/, {
        message: "El email solo puede contener letras, números, puntos, guiones y guiones bajos.",
    })
    .nullable(),
    isMock: z.boolean().default( false ),
});


export type ProfessorFormValues = z.infer<typeof formSchema>;


interface ProfessorFormProps {
    professors? : Omit<Professor, 'oldId'>;
    isOpen      : boolean;
    onClose     : () => void;
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
        url     : `${endpoint}`,
        method  : Method.POST,
        body    : newProfessor
    });


/**
 * API call para actualizar un profesor existente
 */
const updateProfessorApi = async ( updatedProfessor: UpdateProfessor ): Promise<Professor>  =>
    fetchApi<Professor>({
        url     : `${endpoint}/${updatedProfessor.id}`,
        method  : Method.PATCH,
        body    : updatedProfessor
    });


export function ProfessorForm({
    professors,
    isOpen,
    onClose,
}: ProfessorFormProps ): JSX.Element {
    const queryClient                               = useQueryClient();
    const defaultValues: Partial<ProfessorFormValues> = emptyProfessor;
    const oldId                                     = useMemo(() => professors?.id || "", [professors?.id]);


    if ( professors?.email ) {
        professors.email = professors.email?.replace( '@uai.cl', '' )
    }


    const form = useForm<ProfessorFormValues>({
        resolver    : zodResolver( formSchema ) as any,
        mode        : 'onChange',
        defaultValues,
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
            id      : professors?.id       || "",
            name    : professors?.name     || "",
            email   : professors?.email    || "",
            isMock  : professors?.isMock   || false,
        });
    }, [ isOpen, professors, form ]);


    /**
     * Maneja el envío del formulario de profesor
     */
    const handleSubmit: SubmitHandler<ProfessorFormValues> = ( data ) => {
        if ( data.email ) {
            data.email = data.email + '@uai.cl';
        }

        if ( professors ) {
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
        const name                  = `${TEST.name}${firstName} ${lastName}`;
        const normalizedFirstName   = normalizeForEmail( firstName );
        const normalizedLastName    = normalizeForEmail( lastName );
        const email                 = `${TEST.email}${normalizedFirstName}.${normalizedLastName}`

        form.reset({
            id: `P${Math.floor(1000 + Math.random() * 900000)}`,
            name,
            email,
            isMock: true,
        });
    }


    const isLoading = createProfessorMutation.isPending || updateProfessorMutation.isPending;


    function onChangeTest( check : boolean, field: ControllerRenderProps<Professor> ) {
        const testName      = check ? TEST.name     : '';
        const testEmail     = check ? TEST.email    : '';
        const nameValue     = ( form.getValues().name || "" ).replace( TEST.name, '' );
        const emailValue    = form.getValues().email;

        if ( emailValue ) {
            const email = emailValue.replace( TEST.email, '' );
            form.setValue('email', `${testEmail}${email}`);
        }

        form.setValue('name', `${testName}${nameValue}`);
        field.onChange( check );
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {professors ? "Editar Profesor" : "Agregar Nuevo Profesor"}
                    </DialogTitle>

                    <DialogDescription>
                        {professors
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
                                            disabled={!!professors}
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
                                        <div className="flex items-center">
                                            <Input
                                                placeholder = "Ej: juan.perez, sin @uai.cl"
                                                type        = "text"
                                                className   = "rounded-none rounded-l-md z-10"
                                                {...field}
                                                value = { field.value || "" }
                                            />

                                            <div className="size-5 border border-zinc-300 dark:border-zinc-800 rounded-r-md py-[0.45rem] px-3">
                                                @uai.cl
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {professors && (
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
                                                onCheckedChange={( value ) => onChangeTest( value, field )}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className={cn(
                            "flex pt-2 gap-2",
                            professors ? "justify-end" : "justify-between"
                        )}>
                            {!professors && (
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
                                professors ? "justify-between w-full" : ""
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
                                            {professors ? "Actualizando..." : "Creando..."}
                                        </>
                                    ) : (
                                        professors ? "Actualizar" : "Agregar"
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
