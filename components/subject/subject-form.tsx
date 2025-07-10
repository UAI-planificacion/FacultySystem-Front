"use client"

import { useEffect } from "react";

import {
    Calendar as CalendarIcon
}                       from "lucide-react";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import * as z           from "zod";

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
    Popover,
    PopoverContent,
    PopoverTrigger
}                           from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}                           from "@/components/ui/select";
import { Button }           from "@/components/ui/button";
import { Input }            from "@/components/ui/input";
import { Textarea }         from "@/components/ui/textarea";
import { Calendar }         from "@/components/ui/calendar";
import { costCenterData }   from "@/data/cost-center";

import { Subject }          from "@/types/subject.model";
import { cn, tempoFormat }  from "@/lib/utils";


export type SubjectFormValues = z.infer<typeof formSchema>


interface SubjectFormProps {
    initialData?    : Subject;
    onSubmit        : ( data: SubjectFormValues ) => void;
    isOpen          : boolean;
    onClose         : () => void;
}


const formSchema = z.object({
    id: z.string().min(2, {
        message: "El código de la asignatura debe tener al menos 2 caracteres.",
    }).max(30, {
        message: "El código de la asignatura debe tener como máximo 30 caracteres."
    }),
    name: z.string().min(2, {
        message: "El nombre de la asignatura debe tener al menos 2 caracteres.",
    }).max(200, {
        message: "El nombre de la asignatura debe tener como máximo 200 caracteres."
    }),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    students: z.coerce.number().min(1, {
        message: "El número máximo de estudiantes debe ser al menos 1.",
    }).max(1000, {
        message: "El número máximo de estudiantes no puede exceder los 1000."
    }),
    costCenterId: z.string().min(2, {
        message: "El código del centro de costos debe tener al menos 2 caracteres.",
    }),
});


const emptySubject = ( initialData: Subject | undefined ) => ({
    id              : initialData?.id || '',
    name            : initialData?.name || '',
    students        : initialData?.students || 0,
    costCenterId    : initialData?.costCenterId || '',
    startDate       : initialData?.startDate ? new Date(initialData.startDate) : undefined,
    endDate         : initialData?.endDate ? new Date(initialData.endDate) : undefined,
})


export function SubjectForm({
    initialData,
    onSubmit,
    isOpen,
    onClose,
}: SubjectFormProps) {
    console.log('🚀 ~ file: subject-form.tsx:95 ~ initialData:', initialData)

    const defaultValues: Partial<SubjectFormValues> = emptySubject( initialData );

    const form = useForm<SubjectFormValues>({
        resolver: zodResolver( formSchema ),
        defaultValues
    })


    useEffect(() => {
        if ( !isOpen ) return;

        form.reset( emptySubject( initialData ));
    }, [ isOpen, initialData?.id, form ]);


    function handleSubmit( formData: SubjectFormValues ): void {
        const data = {
            ...formData,
            startDate: formData.startDate ? new Date(formData.startDate) : undefined,
            endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        };

        console.log('🚀 ~ file: subject-form.tsx:64 ~ data:', data);
        onSubmit(data);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Editar Asignatura" : "Nueva Asignatura"}
                    </DialogTitle>

                    <DialogDescription>
                        {initialData 
                            ? "Actualizar los detalles de una asignatura existente" 
                            : "Agregar una nueva asignatura a esta facultad"
                    }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control = { form.control }
                            name    = "id"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Código de la Asignatura</FormLabel>

                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder = "CS101"
                                            disabled    = { !!initialData?.id }
                                        />
                                    </FormControl>

                                    <FormDescription>
                                        Código único para la asignatura
                                    </FormDescription>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control = { form.control }
                            name    = "name"
                            render  = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Asignatura</FormLabel>

                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder = "Introducción a la Informática"
                                            className   = "min-h-[80px] max-h-[150px]"
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control = { form.control }
                                name    = "students"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium">Cupo de estudiantes</FormLabel>

                                        <FormControl>
                                            <Input
                                                {...field}
                                                type        = "number"
                                                min         = { 1 }
                                                max         = { 1000 }
                                                placeholder = "Ej: 30"
                                                onChange    = {(e) => field.onChange( parseInt( e.target.value ) || 0)}
                                            />
                                        </FormControl>

                                        <FormDescription>
                                            Número máximo de estudiantes
                                        </FormDescription>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="costCenterId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium">Centro de Costos</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un centro de costos" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {costCenterData.map((center) => (
                                                    <SelectItem key={center.code} value={center.code}>
                                                        {center.code}-{center.name} 
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Selecciona el centro de costos asociado
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control = { form.control }
                                name    = "startDate"
                                render  = {({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="font-medium">Fecha de inicio</FormLabel>

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            tempoFormat(field.value)
                                                        ) : (
                                                            <span>Selecciona una fecha</span>
                                                        )}

                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode        = "single"
                                                    selected    = { field.value }
                                                    onSelect    = { field.onChange }
                                                    disabled    = {( date ) => date < new Date() }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control = { form.control }
                                name    = "endDate"
                                render  = {({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="font-medium">Fecha de finalización</FormLabel>

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant     = "outline"
                                                        className   = {cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? tempoFormat( field.value )
                                                            : <span>Selecciona una fecha</span>
                                                        }

                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode        = "single"
                                                    selected    = { field.value }
                                                    onSelect    = { field.onChange }
                                                    disabled    = {( date ) => date < ( form.getValues( 'startDate' ) || new Date() )}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancelar
                            </Button>

                            <Button type="submit">
                                {initialData
                                    ? "Actualizar Asignatura"
                                    : "Crear Asignatura"
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
