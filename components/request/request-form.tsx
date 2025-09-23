"use client"

import { JSX, useEffect, useState } from "react"

import {
    useMutation,
    useQueryClient
}                       from "@tanstack/react-query";
import { toast }        from "sonner";
import {
    BadgeCheck,
    CircleDashed,
    Eye,
    OctagonX
}                       from "lucide-react";
import { z }            from "zod";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
}                           from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                           from "@/components/ui/form";
import {
    ToggleGroup,
    ToggleGroupItem,
}                           from "@/components/ui/toggle-group"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
}                           from "@/components/ui/tabs";
import { Input }            from "@/components/ui/input";
import { Button }           from "@/components/ui/button";
import { ShowDateAt }       from "@/components/shared/date-at";
import { CommentSection }   from "@/components/comment/comment-section";
import { Switch }           from "@/components/ui/switch";
import { Textarea }         from "@/components/ui/textarea";
import { OfferSelect }      from "@/components/offer/offer-select";

import {
    CreateRequest,
    Request,
    Status,
    UpdateRequest
}                                   from "@/types/request";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { cn }                       from "@/lib/utils";
import LoaderMini                   from "@/icons/LoaderMini";
import { useSession }               from "@/hooks/use-session";


export type RequestFormValues = z.infer<typeof formSchema>;


interface Props {
    isOpen      : boolean;
    onClose     : () => void;
    onSuccess?  : () => void;
    request     : Request | null;
    facultyId   : string;
}


const formSchema = z.object({
    title: z.string({
        required_error: "El título es obligatorio",
        invalid_type_error: "El título debe ser un texto"
    }).min(1, { message: "El título no puede estar vacío" })
    .max(100, { message: "El título no puede tener más de 100 caracteres" }),
    status: z.nativeEnum(Status, {
        required_error: "Debe seleccionar un estado",
        invalid_type_error: "Estado no válido"
    }),
    isConsecutive: z.boolean(),
    description: z.string()
        .max(500, { message: "La descripción no puede tener más de 500 caracteres" })
        .nullable()
        .transform(val => val === "" ? null : val),
    offerId: z.string({
        required_error: "Debe seleccionar una oferta",
        invalid_type_error: "Oferta no válida"
    }).min(1, { message: "Debe seleccionar una oferta" })
})


const defaultRequest = ( data : Request | null ) => ({
    title           : data?.title           || '',
    status          : data?.status          || Status.PENDING,
    description     : data?.description     || '',
    isConsecutive   : data?.isConsecutive   || false,
    offerId         : data?.offer?.id       || '',
});


type Tab = 'form' | 'comments';


export function RequestForm({
    isOpen,
    onClose,
    onSuccess,
    request,
    facultyId,
}: Props ): JSX.Element {
    const queryClient   = useQueryClient();
    const [tab, setTab] = useState<Tab>( 'form' );
    const { staff }     = useSession();


    const createRequestApi = async ( request: CreateRequest ): Promise<Request> =>
        fetchApi<Request>({
            url     : 'requests',
            method  : Method.POST,
            body    : request
        });


    const updateRequestApi = async ( updatedRequest: UpdateRequest ): Promise<Request> =>
        fetchApi<Request>({
            url     : `requests/${updatedRequest.id}`,
            method  : Method.PATCH,
            body    : updatedRequest
        });


    const createRequestMutation = useMutation<Request, Error, CreateRequest>({
        mutationFn: createRequestApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUESTS ]});
            onClose();
            toast( 'Solicitud creada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al crear solicitud: ${mutationError.message}`, errorToast )
    });


    const updateRequestMutation = useMutation<Request, Error, UpdateRequest>({
        mutationFn: updateRequestApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.REQUESTS ]});
            onClose();
            toast( 'Solicitud actualizada exitosamente', successToast );
            onSuccess?.();
        },
        onError: ( mutationError ) => toast( `Error al actualizar la solicitud: ${mutationError.message}`, errorToast )
    });


    const form = useForm<RequestFormValues>({
        resolver        : zodResolver( formSchema ),
        defaultValues   : defaultRequest( request )
    });


    useEffect(() => {
        form.reset( defaultRequest( request ));
        setTab( 'form' );
    }, [request, isOpen]);


    function handleSubmit( data: RequestFormValues ): void {
        console.log( "🚀 ~ file: request-form.tsx:200 ~ data:", data )

        if ( !staff ) {
            toast( 'Por favor, inicie sesión para crear una solicitud', errorToast );
            return;
        }

        if ( request ) {
            updateRequestMutation.mutate({
                ...data,
                id: request.id,
                staffUpdateId: staff.id,
            });
        } else {
            createRequestMutation.mutate({
                ...data,
                staffCreateId: staff.id,
            });
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[80vh] transition-all duration-800">
                <DialogHeader>
                    <div className="space-y-1">
                        <DialogTitle>
                            { request ? 'Editar' : 'Crear' } Solicitud
                        </DialogTitle>

                        <DialogDescription>
                            { request
                                ? "Realice los cambios necesarios en la solicitud"
                                : "Complete los campos obligatorios para crear una solicitud"
                            }
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <Tabs
                    defaultValue    = { tab }
                    onValueChange   = {( value ) => setTab( value as Tab )}
                    className       = "w-full"
                >
                    { request &&
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="form">
                                Información
                            </TabsTrigger>

                            <TabsTrigger value="comments">
                                Comentarios 
                            </TabsTrigger>
                        </TabsList>
                    }

                    <TabsContent
                        value       = "form"
                        className   = { cn( "space-y-4", request ? "mt-4": "" )}
                    >
                        <Form {...form}>
                            <form onSubmit={ form.handleSubmit( handleSubmit )} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 max-h-[60vh]">
                                    {/* Title */}
                                    <FormField
                                        control = { form.control }
                                        name    = "title"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Título</FormLabel>

                                                <FormControl>
                                                    <Input 
                                                        placeholder="Ingrese el título de la solicitud"
                                                        {...field} 
                                                    />
                                                </FormControl>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Status */}
                                    { request &&
                                        <FormField
                                            control = { form.control }
                                            name    = "status"
                                            render  = {({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Estado</FormLabel>

                                                    <FormControl>
                                                        <ToggleGroup
                                                            type            = "single"
                                                            value           = { field.value }
                                                            onValueChange   = {( value: Status ) => {
                                                                if ( value ) field.onChange( value )
                                                            }}
                                                            className       = "w-full"
                                                            defaultValue    = { field.value }
                                                        >
                                                            <ToggleGroupItem
                                                                value       = "PENDING"
                                                                aria-label  = "Pendiente"
                                                                className   = "flex-1 rounded-tl-lg rounded-bl-lg rounded-tr-none rounded-br-none border-t border-l border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-amber-400 data-[state=on]:dark:bg-amber-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-amber-500 data-[state=on]:dark:hover:bg-amber-600"
                                                            >
                                                                <CircleDashed className="mr-2 h-4 w-4"/>
                                                                Pendiente
                                                            </ToggleGroupItem>

                                                            <ToggleGroupItem
                                                                value       = "REVIEWING"
                                                                aria-label  = "Revisando"
                                                                className   = "flex-1 rounded-none border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-blue-400 data-[state=on]:dark:bg-blue-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-blue-500 data-[state=on]:dark:hover:bg-blue-600"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4"/>
                                                                Revisando
                                                            </ToggleGroupItem>

                                                            <ToggleGroupItem
                                                                value       = "APPROVED"
                                                                aria-label  = "Aprobado"
                                                                className   = "flex-1 rounded-none border-t border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-green-400 data-[state=on]:dark:bg-green-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-green-500 data-[state=on]:dark:hover:bg-green-600"
                                                            >
                                                                <BadgeCheck className="mr-2 h-4 w-4"/>
                                                                Aprobado
                                                            </ToggleGroupItem>

                                                            <ToggleGroupItem
                                                                value       = "REJECTED"
                                                                aria-label  = "Rechazado"
                                                                className   = "flex-1 rounded-tl-none rounded-bl-none rounded-tr-lg rounded-br-lg border-t border-r border-b border-zinc-200 dark:border-zinc-700 data-[state=on]:bg-red-400 data-[state=on]:dark:bg-red-500 data-[state=on]:text-black data-[state=on]:dark:text-white data-[state=on]:hover:bg-red-500 data-[state=on]:dark:hover:bg-red-600"
                                                            >
                                                                <OctagonX className="mr-2 h-4 w-4"/>
                                                                Rechazado
                                                            </ToggleGroupItem>
                                                        </ToggleGroup>
                                                    </FormControl>

                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    }

                                    <FormField
                                        control = { form.control }
                                        name    = "offerId"
                                        render  = {({ field }) => {
                                            return (
                                                <FormItem>
                                                    <FormLabel className="text-base">Oferta</FormLabel>

                                                    <FormControl>
                                                        <OfferSelect
                                                            facultyId           = { facultyId }
                                                            value               = { field.value }
                                                            placeholder         = "Seleccionar una oferta"
                                                            searchPlaceholder   = "Buscar por asignatura o período"
                                                            onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value )}
                                                        />
                                                    </FormControl>

                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />

                                    {/* Is Consecutive */}
                                    <FormField
                                        control = { form.control }
                                        name    = "isConsecutive"
                                        render  = {({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Es consecutivo</FormLabel>

                                                    <FormDescription>
                                                        Marque si la solicitud es para horarios consecutivos
                                                    </FormDescription>
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

                                    {/* Description */}
                                    <FormField
                                        control = { form.control }
                                        name    = "description"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descripción</FormLabel>

                                                <FormControl>
                                                    <Textarea
                                                        placeholder = "Agregue una descripción (opcional)"
                                                        className   = "min-h-[100px] max-h-[200px]"
                                                        {...field}
                                                        value       = { field.value || '' }
                                                    />
                                                </FormControl>

                                                <FormDescription className="text-xs flex justify-end">
                                                    {field.value?.length || 0} / 500
                                                </FormDescription>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    { request && <>
                                        {/* Staff Create - Readonly */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <FormLabel>Creado por</FormLabel>

                                                <Input 
                                                    value = { request?.staffCreate?.name || '-' }
                                                    readOnly 
                                                    disabled 
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <FormLabel>Última actualización por</FormLabel>

                                                <Input 
                                                    value = { request?.staffUpdate?.name || '-' }
                                                    readOnly 
                                                    disabled 
                                                />
                                            </div>
                                        </div>

                                        {/* Staff Update - Readonly */}
                                        <ShowDateAt
                                            createdAt = { request?.createdAt }
                                            updatedAt = { request?.updatedAt }
                                        />
                                    </>
                                    }
                                </div>

                                <div className="flex justify-between space-x-4 pt-4 border-t">
                                    <Button
                                        type    = "button"
                                        variant = "outline"
                                        onClick = { onClose }
                                    >
                                        Cancelar
                                    </Button>

                                    <Button 
                                        type        = "submit"
                                        disabled    = { updateRequestMutation.isPending }
                                    >
                                        { updateRequestMutation.isPending && <LoaderMini /> }
                                        { createRequestMutation.isPending && <LoaderMini /> }
                                        { request ? 'Guardar cambios' : 'Crear solicitud' }
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    { request &&
                        <TabsContent value="comments" className="mt-4">
                            { request?.id && (
                                <CommentSection
                                    requestId   = { request.id }
                                    enabled     = { tab === 'comments' }
                                />
                            )}
                        </TabsContent>
                    }
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
