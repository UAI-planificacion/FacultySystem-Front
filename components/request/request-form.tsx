"use client"

import { JSX, useEffect, useMemo, useState } from "react"

import {
    useMutation,
    useQuery,
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
}                               from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
}                               from "@/components/ui/form";
import {
    ToggleGroup,
    ToggleGroupItem,
}                               from "@/components/ui/toggle-group"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
}                               from "@/components/ui/tabs";
import { Input }                from "@/components/ui/input";
import { Button }               from "@/components/ui/button";
import { ShowDateAt }           from "@/components/shared/date-at";
import { Consecutive }          from "@/components/shared/consecutive";
import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { CommentSection }       from "@/components/comment/comment-section";

import { Request, Status, UpdateRequest }   from "@/types/request";
import { KEY_QUERYS }                       from "@/consts/key-queries";
import { Subject }                          from "@/types/subject.model";
import { Method, fetchApi }                 from "@/services/fetch";
import { errorToast, successToast }         from "@/config/toast/toast.config";


export type RequestFormValues = z.infer<typeof formSchema>;


interface RequestFormProps {
    isOpen      : boolean;
    onClose     : () => void;
    onSuccess?  : () => void;
    request     : Request;
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
    // isConsecutive: z.boolean(),
    // description: z.string()
    //     .max(500, { message: "La descripción no puede tener más de 500 caracteres" })
    //     .nullable()
    //     .transform(val => val === "" ? null : val),
    subjectId: z.string({
        required_error: "Debe seleccionar una asignatura",
        invalid_type_error: "Asignatura no válida"
    }).min(1, { message: "Debe seleccionar una asignatura" })
})


const defaultRequest = ( data : Request ) => ({
    title           : data.title,
    status          : data.status,
    // isConsecutive   : data.isConsecutive,
    // description     : data.description,
    subjectId       : data.subject.id,
});


type Tab = 'form' | 'comments';


export function RequestForm({
    isOpen,
    onClose,
    onSuccess,
    request,
    facultyId,
}: RequestFormProps ): JSX.Element {
    const queryClient   = useQueryClient();
    const [tab, setTab] = useState<Tab>( 'form' );

    // API function to update request
    const updateRequestApi = async ( updatedRequest: UpdateRequest ): Promise<Request>  =>
        fetchApi<Request>({ url: `requests/${updatedRequest.id}`, method: Method.PATCH, body: updatedRequest });


    // Mutation for updating request
    const updateRequestMutation = useMutation<Request, Error, UpdateRequest>({
        mutationFn: updateRequestApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUESTS] });
            onClose();
            toast( 'Solicitud actualizada exitosamente', successToast );
            onSuccess?.();
        },
        onError: ( mutationError ) => toast( `Error al actualizar la solicitud: ${mutationError.message}`, errorToast )
    });


    const {
        data: subjects,
        isLoading,
        isError
    } = useQuery<Subject[]>({
        queryKey: [KEY_QUERYS.SUBJECTS, facultyId],
        queryFn: () => fetchApi( { url: `subjects/all/${facultyId}` } ),
    });


    const memoizedSubject = useMemo(() => {
        return subjects?.map( professor => ({
            id      : professor.id,
            label   : `${professor.id}-${professor.name}`,
            value   : professor.id,
        })) ?? [];
    }, [subjects]);


    const form = useForm<RequestFormValues>({
        resolver        : zodResolver( formSchema ),
        defaultValues   : defaultRequest( request )
    });


    useEffect(() => {
        form.reset( defaultRequest( request ));
        setTab( 'form' );
    }, [request, isOpen]);


    function handleSubmit( data: RequestFormValues ): void {
        console.log('🚀 ~ file: request-form.tsx:71 ~ data:', data)
        updateRequestMutation.mutate({
            ...data,
            id: request.id
        });
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <DialogTitle>Editar Solicitud</DialogTitle>

                            <DialogDescription>
                                Realice los cambios necesarios en la solicitud
                            </DialogDescription>
                        </div>

                        <Consecutive isConsecutive={request.isConsecutive} />
                    </div>
                </DialogHeader>

                <Tabs defaultValue={tab} onValueChange={( value ) => setTab( value as Tab )} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="form">Información</TabsTrigger>
                        <TabsTrigger value="comments">
                            Comentarios 
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="form" className="space-y-4 mt-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-2">
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

                                    {/* Subject */}
                                    <FormField
                                        control = { form.control }
                                        name    = "subjectId"
                                        render  = {({ field }) => {
                                            return (
                                                <FormItem>
                                                    <FormLabel>Asignatura</FormLabel>

                                                    <FormControl>
                                                        { isError ? (
                                                            <>
                                                                <Input
                                                                    placeholder="ID de la asignatura"
                                                                    value={field.value || ''}
                                                                    onChange={field.onChange}
                                                                />

                                                                <FormDescription>
                                                                    Error al cargar las asignaturas. Ingrese el ID manualmente.
                                                                </FormDescription>
                                                            </>
                                                        ) : (
                                                            <MultiSelectCombobox
                                                                multiple            = { false }
                                                                placeholder         = "Seleccionar una asignatura"
                                                                defaultValues       = { field.value || '' }
                                                                onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                                options             = { memoizedSubject }
                                                                isLoading           = { isLoading }
                                                            />
                                                        )}
                                                    </FormControl>

                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />

                                    {/* Description */}
                                    <div className="flex flex-col space-y-1">
                                        <label>Descripción</label>
                                        <p>{request.description}</p>
                                    </div>

                                    {/* Staff Create - Readonly */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <FormLabel>Creado por</FormLabel>

                                            <Input 
                                                value = { request.staffCreate?.name || '-' }
                                                readOnly 
                                                disabled 
                                            />
                                        </div>

                                        {/* Staff Update - Readonly */}
                                        <div className="space-y-2">
                                            <FormLabel>Última actualización por</FormLabel>

                                            <Input 
                                                value = { request.staffUpdate?.name || '-' }
                                                readOnly 
                                                disabled 
                                            />
                                        </div>
                                    </div>

                                    <ShowDateAt
                                        createdAt = { request.createdAt }
                                        updatedAt = { request.updatedAt }
                                    />
                                </div>

                                <div className="flex justify-between space-x-4 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={onClose}>
                                        Cancelar
                                    </Button>

                                    <Button 
                                        type        = "submit"
                                        disabled    = { updateRequestMutation.isPending }
                                    >
                                        { updateRequestMutation.isPending ? 'Guardando...' : 'Guardar cambios' }
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="comments" className="mt-4">
                        <CommentSection
                            requestId   = { request.id }
                            enabled     = { tab === 'comments' }
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
