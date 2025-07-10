"use client"

import { useEffect } from "react"

import { z }            from "zod";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import { Switch }   from "@/components/ui/switch";

import { Request, Status }  from "@/types/request";
import { sampleSubjects }   from "@/data/sample-subjects";


interface RequestFormProps {
    isOpen      : boolean;
    onClose     : () => void;
    onSubmit    : ( data: RequestFormValues ) => void;
    data        : Request;
}


const formSchema = z.object({
    title           : z.string().min( 1, "El título es requerido" ).max( 100, "El título debe tener como máximo 100 caracteres" ),
    status          : z.nativeEnum( Status ),
    isConsecutive   : z.boolean(),
    description     : z.string().nullable(),
    comment         : z.string().nullable(),
    subjectId       : z.string().min( 1, "La asignatura es requerida" ),
})


type RequestFormValues = z.infer<typeof formSchema>;

const defaultRequest = ( data : Request) => ({
    title           : data.title,
    status          : data.status,
    isConsecutive   : data.isConsecutive,
    description     : data.description,
    comment         : data.comment,
    subjectId       : data.subject.id,
})


export function RequestForm({ isOpen, onClose, onSubmit, data }: RequestFormProps) {
    const form = useForm<RequestFormValues>({
        resolver        : zodResolver( formSchema ),
        defaultValues   : defaultRequest( data )
    })


    useEffect(() => {
        form.reset( defaultRequest( data ));
    }, [data, form])


    const handleSubmit = (data: RequestFormValues) => {
        console.log('🚀 ~ file: request-form.tsx:71 ~ data:', data)
        onSubmit(data)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Editar Solicitud</DialogTitle>
                    <DialogDescription>
                        Realice los cambios necesarios en la solicitud
                    </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
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

                            {/* Status - Readonly */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <FormControl>
                                            <Input 
                                                value={data.status} 
                                                readOnly 
                                                disabled 
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Is Consecutive */}
                            <FormField
                                control={form.control}
                                name="isConsecutive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Es consecutivo</FormLabel>
                                            <FormDescription>
                                                Marque si la solicitud es para horarios consecutivos
                                            </FormDescription>
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

                            {/* Subject */}
                            <FormField
                                control={form.control}
                                name="subjectId"
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Asignatura</FormLabel>
                                            <Select 
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    form.setValue('subjectId', value);
                                                }} 
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione una asignatura" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {sampleSubjects.map((subject) => (
                                                        <SelectItem key={subject.id} value={subject.id}>
                                                            {subject.name} ({subject.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Ingrese una descripción detallada de la solicitud"
                                                className="resize-none"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Comment */}
                            <FormField
                                control={form.control}
                                name="comment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Comentario</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Agregue un comentario (opcional)"
                                                className="resize-none"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Staff Create - Readonly */}
                            <div className="space-y-2">
                                <FormLabel>Creado por</FormLabel>
                                <Input 
                                    value={data.staffCreate?.name || 'N/A'} 
                                    readOnly 
                                    disabled 
                                />
                            </div>

                            {/* Staff Update - Readonly */}
                            {data.staffUpdate && (
                                <div className="space-y-2">
                                    <FormLabel>Última actualización por</FormLabel>
                                    <Input 
                                        value={data.staffUpdate.name} 
                                        readOnly 
                                        disabled 
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
