"use client"

import { JSX, useEffect } from "react";

import { z }            from "zod";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import { Loader2 }      from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}                   from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
}                   from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
}                       from "@/components/ui/form";
import { Button }       from "@/components/ui/button";
import { Input }        from "@/components/ui/input";
import { Textarea }     from "@/components/ui/textarea";
import { Switch }       from "@/components/ui/switch";
import { DaySelector }  from "@/components/shared/DaySelector";

import {
    type RequestDetail,
    SpaceType,
    Size,
    Level,
    Building
}                           from "@/types/request";
import { professorsMock }   from "@/data/professor";
import { spacesMock } from "@/data/space";


const getSpaceType = ( spaceType: SpaceType ) => ({
    [SpaceType.ROOM]        : "Sala",
    [SpaceType.AUDITORIUM]  : "Auditorio",
    [SpaceType.COMMUNIC]    : "Comunicación",
    [SpaceType.CORE]        : "Core",
    [SpaceType.DIS]         : "Diseño",
    [SpaceType.GARAGE]      : "Garage",
    [SpaceType.LAB]         : "Laboratorio",
    [SpaceType.LABPC]       : "Laboratorio de Computadoras",
})[spaceType];

const getLevelName = ( level: Level ) => ({
    [Level.FIRST_GRADE]     : "Primer Grado",
    [Level.SECOND_GRADE]    : "Segundo Grado",
    [Level.PREGRADO]        : "Pregrado",
})[level];


const numberOrNull = z.union([
    z.string()
        .transform(val => val === '' ? null : Number(val))
        .refine(
            val => val === null || val === undefined || val >= 1,
            { message: "Debe ser al menos 1" }
        ),
    z.number()
        .min(1, { message: "Debe ser al menos 1" })
        .nullable()
        .optional(),
    z.null(),
    z.undefined()
]).transform(val => val === undefined ? null : val);

const formSchema = z.object({
    minimum         : numberOrNull,
    maximum         : numberOrNull,
    spaceType       : z.nativeEnum(SpaceType).optional().nullable(),
    spaceSize       : z.nativeEnum(Size).nullable().optional(),
    building        : z.nativeEnum(Building).nullable().optional(),
    costCenterId    : z.string().nullable().optional(),
    inAfternoon     : z.boolean().default(false),
    isPriority      : z.boolean().default(false),
    moduleId        : z.string().nullable().optional(),
    days            : z.array(z.number()).default( [] ),
    comment         : z.string().max(500, "El comentario no puede tener más de 500 caracteres").nullable().default(''),
    level           : z.nativeEnum(Level, { required_error: "Por favor selecciona un nivel" }),
    professorId     : z.string().nullable().optional(),
    spaceId         : z.string().nullable().default('')
}).superRefine(( data, ctx ) => {
    const minimum = data.minimum;
    const maximum = data.maximum;

    if ( minimum !== null && maximum !== null && maximum < minimum ) {
        ctx.addIssue({
            code    : z.ZodIssueCode.custom,
            message : "El máximo no puede ser menor que el mínimo.",
            path    : ['maximum'],
        });
    }
});


export type RequestDetailFormValues = z.infer<typeof formSchema>;


interface RequestDetailFormProps {
    initialData : RequestDetail;
    onSubmit    : ( data: RequestDetailFormValues ) => void;
    onCancel    : () => void;
    isOpen      : boolean;
    onClose     : () => void;
}


const defaultRequestDetail = ( data: RequestDetail ) => ({
    minimum         : data.minimum,
    maximum         : data.maximum,
    spaceType       : data.spaceType as SpaceType,
    spaceSize       : data.spaceSize as Size,
    building        : data.building as Building,
    costCenterId    : data.costCenterId,
    inAfternoon     : data.inAfternoon,
    isPriority      : data.isPriority,
    moduleId        : data.moduleId,
    days            : data.days?.map( day => Number( day )) ?? [],
    comment         : data.comment,
    level           : data.level,
    professorId     : data.professor?.id,
    spaceId         : data.spaceId,
});


export function RequestDetailForm({ 
    initialData, 
    onSubmit, 
    onClose,
    isOpen
}: RequestDetailFormProps ): JSX.Element {
    const form = useForm<RequestDetailFormValues>({
        resolver: zodResolver( formSchema ) as any,
        defaultValues: defaultRequestDetail(initialData),
    });


    useEffect(() => {
        form.reset( defaultRequestDetail( initialData ));
    }, [initialData, form]);


    function onSubmitForm( formData: RequestDetailFormValues ): void {
        console.log('🚀 ~ file: request-detail-form.tsx:191 ~ formData:', formData)
        onSubmit(formData);
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Editar Detalle' : 'Agregar Nuevo Detalle'}
                    </DialogTitle>

                    <DialogDescription>
                        {initialData 
                            ? 'Modifique los campos necesarios del detalle.' 
                            : 'Complete los campos para agregar un nuevo detalle.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Mínimo de estudiantes */}
                            <FormField
                                control = { form.control }
                                name    = "minimum"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mínimo de estudiantes</FormLabel>

                                        <FormControl>
                                            <Input
                                                {...field}
                                                type        = "number"
                                                min         = "1"
                                                value       = { field.value || '' }
                                                onChange    = {( e: React.ChangeEvent<HTMLInputElement> ) => {
                                                    const value = e.target.value === '' ? undefined : Number( e.target.value );
                                                    field.onChange( value );
                                                }}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Máximo de estudiantes */}
                            <FormField
                                control = { form.control }
                                name    = "maximum"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Máximo de estudiantes</FormLabel>

                                        <FormControl>
                                            <Input
                                                {...field}
                                                type        = "number"
                                                min         = "1"
                                                placeholder = "Ej: 30"
                                                value       = { field.value || '' }
                                                onChange    = {( e: React.ChangeEvent<HTMLInputElement> ) => {
                                                    field.onChange(e.target.value === '' ? undefined : Number( e.target.value ));
                                                }}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Espacio */}
                            <FormField
                                control = { form.control }
                                name    = "spaceId"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Espacio</FormLabel>

                                        <Select
                                            onValueChange   = {(value: string) => {
                                                field.onChange(value || null);
                                            }}
                                            value = {field.value || ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="Sin especificar">Sin especificar</SelectItem>

                                                {spacesMock.map((space) => (
                                                    <SelectItem key={space.id} value={space.id}>
                                                        {space.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tipo de espacio */}
                            <FormField
                                control = { form.control }
                                name    = "spaceType"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de espacio</FormLabel>

                                        <Select
                                            defaultValue    = { field.value ?? 'Sin especificar' }
                                            onValueChange   = {( value ) => {
                                                field.onChange( value === "Sin especificar" ? undefined : value );
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="Sin especificar">Sin especificar</SelectItem>

                                                {Object.values(SpaceType).map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        { getSpaceType(type) }
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tamaño del espacio */}
                            <FormField
                                control = { form.control }
                                name    = "spaceSize"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tamaño del espacio</FormLabel>

                                        <Select
                                            onValueChange={( value ) => {
                                                field.onChange(value === "Sin especificar" ? undefined : value);
                                            }}
                                            defaultValue={field.value || 'Sin especificar'}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tamaño" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="Sin especificar">Sin especificar</SelectItem>
                                                {Object.values(Size).map((size) => (
                                                    <SelectItem key={size} value={size}>
                                                        {size}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Edificio */}
                            <FormField
                                control = { form.control }
                                name    = "building"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Edificio</FormLabel>

                                        <Select
                                            onValueChange={( value ) => {
                                                field.onChange(value === "Sin especificar" ? undefined : value);
                                            }}
                                            defaultValue={field.value || 'Sin especificar'}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar edificio" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="Sin especificar">Sin especificar</SelectItem>
                                                {Object.values(Building).map((building) => (
                                                    <SelectItem key={building} value={building}>
                                                        Edificio {building}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Nivel */}
                            <FormField
                                control = { form.control }
                                name    = "level"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nivel</FormLabel>

                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar nivel" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                {Object.values(Level).map((nivel) => (
                                                    <SelectItem key={nivel} value={nivel}>
                                                        {getLevelName( nivel )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Professor */}
                            <FormField
                                control = { form.control }
                                name    = "professorId"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Profesor</FormLabel>

                                        <Select 
                                            onValueChange   = {( value ) => {
                                                field.onChange( value === "Sin especificar" ? undefined : value );
                                            }}
                                            defaultValue    = { field.value || undefined }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar profesor" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="Sin especificar">Sin especificar</SelectItem>

                                                {professorsMock.map((professor) => (
                                                    <SelectItem key={professor.id} value={professor.id}>
                                                        {professor.id}-{professor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tarde */}
                            <FormField
                                control = { form.control }
                                name    = "inAfternoon"
                                render  = {({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Turno Tarde</FormLabel>

                                            <p className="text-sm text-muted-foreground">
                                                Indica si es en horario de tarde
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

                            <FormField
                                control = { form.control }
                                name    = "isPriority"
                                render  = {({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Es Prioridad</FormLabel>

                                            <p className="text-sm text-muted-foreground">
                                                Indica si es prioridad
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

                            {/* Días */}
                            <FormField
                                control = { form.control }
                                name    = "days"
                                render  = {({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Días</FormLabel>

                                        <DaySelector
                                            days        = {[ 0, 1, 2, 3, 4, 5, 6 ]}
                                            value       = { field.value?.map( day => Number( day )) || []}
                                            onChange    = { field.onChange }
                                        />

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Descripción */}
                            <div className="col-span-2">
                                <FormLabel>Descripción</FormLabel>

                                <p>{initialData?.description || '-'}</p>
                            </div>

                            {/* Comentario */}
                            <FormField
                                control = { form.control }
                                name    = "comment"
                                render  = {({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Comentario</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Agregue un comentario opcional"
                                                className="min-h-[100px]"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="mt-6 flex justify-between items-center">
                            <Button
                                type    = "button"
                                variant = "outline"
                                onClick = { onClose }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type        = "submit"
                                disabled    = { form.formState.isSubmitting }
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : initialData ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
