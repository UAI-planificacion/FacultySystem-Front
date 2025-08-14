"use client"

import { JSX, useEffect, useMemo, useState } from "react";

import { z }                from "zod";
import { zodResolver }      from "@hookform/resolvers/zod";
import { useForm }          from "react-hook-form";
import { Loader2, Plus }    from "lucide-react";
import { 
    useMutation,
    useQuery,
    useQueryClient
}                           from "@tanstack/react-query";
import { toast }            from "sonner";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
}                               from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}                               from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
}                               from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
}                               from "@/components/ui/form";
import { Button }               from "@/components/ui/button";
import { Input }                from "@/components/ui/input";
import { Switch }               from "@/components/ui/switch";
import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { Badge }                from "@/components/ui/badge";
import { ProfessorForm }        from "@/components/professor/professor-form";
import { CommentSection }       from "@/components/comment/comment-section";
import { RequestDetailTable }   from "@/components/request-detail/request-detail-table";
import { Checkbox }             from "@/components/ui/checkbox";
import {
    SizeResponse,
    Day,
    Module,
}                           from "@/types/request";
import {
    type RequestDetail,
    UpdateRequestDetail,
    SpaceType,
    Size,
    Building
}                           from "@/types/request-detail.model";
import { useCostCenter }    from "@/hooks/use-cost-center";
import { getSpaceType }     from "@/lib/utils";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { Method, fetchApi } from "@/services/fetch";
import { ENV }              from "@/config/envs/env";
import { Professor }        from "@/types/professor";
import {
    errorToast,
    successToast
}                           from "@/config/toast/toast.config";
import { useSpace }         from "@/hooks/use-space";
import { Grade }            from "@/types/grade";


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
    spaceType       : z.nativeEnum( SpaceType ).optional().nullable(),
    spaceSize       : z.nativeEnum( Size ).nullable().optional(),
    building        : z.nativeEnum( Building ).nullable().optional(),
    costCenterId    : z.string().nullable().optional(),
    inAfternoon     : z.boolean().default( false ),
    isPriority      : z.boolean().default( false ),
    gradeId         : z.string().nullable().optional(),
    professorId     : z.string().nullable().optional(),
    spaceId         : z.string().nullable().default(''),
    moduleDays      : z.array(z.object({
        day         : z.string(),
        moduleId    : z.string()
    })).default([])
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
    requestDetail       : RequestDetail;
    onSuccess?          : () => void;
    onCancel            : () => void;
    isOpen              : boolean;
    onClose             : () => void;
    requestId           : string;
    professors          : Professor[];
    isLoadingProfessors : boolean;
    isErrorProfessors   : boolean;
    modules             : Module[];
    isLoadingModules    : boolean;
    isErrorModules      : boolean;
}


const defaultRequestDetail = ( data: RequestDetail ) => ({
    minimum         : data.minimum,
    maximum         : data.maximum,
    spaceType       : data.spaceType    as SpaceType,
    spaceSize       : data.spaceSize    as Size,
    building        : data.building     as Building,
    costCenterId    : data.costCenterId,
    inAfternoon     : data.inAfternoon,
    isPriority      : data.isPriority,
    gradeId         : data.grade?.id,
    professorId     : data.professorId,
    spaceId         : data.spaceId,
    moduleDays      : data.moduleDays || [],
});


type Tab = 'form' | 'comments';


function getTypeSpace( requestDetail: RequestDetail | undefined ): boolean[] {
    if ( !requestDetail ) return [ false, false, false ];

    if ( requestDetail.spaceId ) {
        return [ true, false, false ];
    }

    if ( requestDetail.spaceType ) {
        return [ false, true, false ];
    }

    if ( requestDetail.spaceSize ) {
        return [ false, false, true ];
    }

    return [ false, false, false ];
}


export function RequestDetailForm({ 
    requestDetail, 
    onSuccess,
    onClose,
    isOpen,
    requestId,
    professors,
    isLoadingProfessors,
    isErrorProfessors,
    modules,
    isLoadingModules,
    isErrorModules
}: RequestDetailFormProps ): JSX.Element {
    const [tab, setTab]                             = useState<Tab>( 'form' );
    const queryClient                               = useQueryClient();
    const [typeSpace, setTypeSpace]                 = useState<boolean[]>([ false, false, false ]);
    const [isOpenProfessor, setIsOpenProfessor ]    = useState( false );


    useEffect(() => {
        setTypeSpace( getTypeSpace( requestDetail ));
    },[requestDetail]);


    const {
        costCenter,
        isLoading: isLoadingCostCenter,
        isError: isErrorCostCenter
    } = useCostCenter({ enabled: true });


    const {
        spaces,
        isLoading: isLoadingSpaces,
    } = useSpace({ enabled: true });


    const updateRequestDetailApi = async ( updatedRequestDetail: UpdateRequestDetail ): Promise<RequestDetail>  =>
        fetchApi<RequestDetail>({
            url     :`request-details/${updatedRequestDetail.id}`,
            method  : Method.PATCH ,
            body    : updatedRequestDetail
        });


    const updateRequestDetailMutation = useMutation<RequestDetail, Error, UpdateRequestDetail>({
        mutationFn: updateRequestDetailApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUEST_DETAIL, requestId] });
            onClose();
            onSuccess?.();
            toast( 'Detalle actualizado exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al actualizar el detalle: ${mutationError.message}`, errorToast )
    });


    const {
        data        : sizes,
        isLoading   : isLoadingSizes,
        isError     : isErrorSizes,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.SIZE ],
        queryFn     : () => fetchApi<SizeResponse[]>({ url: `${ENV.ACADEMIC_SECTION}sizes`, isApi: false }),
    });


    const {
        data        : days,
        isLoading   : isLoadingDays,
        isError     : isErrorDays,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.DAYS ],
        queryFn     : () => fetchApi<Day[]>({ url: `${ENV.ACADEMIC_SECTION}days`, isApi: false }),
    });


    const {
        data        : grades,
        isLoading   : isLoadingGrades,
        isError     : isErrorGrades,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.GRADES ],
        queryFn     : () => fetchApi<Grade[]>({ url: 'grades' }),
    });


    const memoizedProfessorOptions = useMemo(() => {
        return professors?.map( professor => ({
            id      : professor.id,
            label   : `${professor.id}-${professor.name}`,
            value   : professor.id,
        })) ?? [];
    }, [professors]);


    const form = useForm<RequestDetailFormValues>({
        resolver        : zodResolver( formSchema ) as any,
        defaultValues   : defaultRequestDetail( requestDetail ),
    });


    useEffect(() => {
        form.reset( defaultRequestDetail( requestDetail ));
        setTab( 'form' );
    }, [requestDetail, isOpen]);


    const handleModuleToggle = ( day: string, moduleId: string, isChecked: boolean ): void => {
        const currentModuleDays = form.getValues( 'moduleDays' );

        if ( isChecked ) {
            const exists = currentModuleDays.some( 
                item => item.day === day && item.moduleId === moduleId 
            );

            if ( !exists ) {
                const newModuleDay = {
                    day         : day,
                    moduleId    : moduleId
                };
                form.setValue( 'moduleDays', [...currentModuleDays, newModuleDay] );
            }
        } else {
            const updatedModuleDays = currentModuleDays.filter( 
                item => !(item.day === day && item.moduleId === moduleId)
            );

            form.setValue( 'moduleDays', updatedModuleDays );
        }
    };


    function onSubmitForm( formData: RequestDetailFormValues ): void {
        formData.building = ( formData.spaceId?.split( '-' )[1] as Building || 'A' );

        if ( typeSpace.every( item => !item )) {
            formData.spaceType  = null;
            formData.spaceSize  = null;
            formData.spaceId    = null;
        } else if ( typeSpace[0] ) {
            formData.spaceType = null;
            formData.spaceSize = null;
        } else if ( typeSpace[1] ) {
            formData.spaceId    = null;
            formData.spaceSize  = null;
        } else if ( typeSpace[2] ) {
            formData.spaceId    = null;
            formData.spaceType  = null;
        }

        console.log( '🚀 ~ file: request-detail-form.tsx:191 ~ formData:', formData );

        updateRequestDetailMutation.mutate({
            ...formData,
            id: requestDetail.id,
        });
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className=" flex justify-between items-center gap-2">
                        <div>
                            <DialogTitle>
                                {requestDetail ? 'Editar Detalle' : 'Agregar Nuevo Detalle'}
                            </DialogTitle>

                            <DialogDescription>
                                {requestDetail 
                                    ? 'Modifique los campos necesarios del detalle.' 
                                    : 'Complete los campos para agregar un nuevo detalle.'}
                            </DialogDescription>
                        </div>

                        <Badge
                            className="mr-5"
                            variant={requestDetail.isPriority ? 'destructive' : 'default'}
                        >
                            {requestDetail.isPriority ? 'Restrictivo' : 'No restrictivo' }
                        </Badge>
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
                            <form onSubmit={form.handleSubmit( onSubmitForm )} className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                                                        max         = "999999"
                                                        placeholder = "Ej: 10"
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
                                                        max         = "999999"
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

                                    {/* Grade */}
                                    <FormField
                                        control = { form.control }
                                        name    = "gradeId"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Grado</FormLabel>

                                                <Select
                                                    defaultValue    = { field.value ?? 'Sin especificar' }
                                                    onValueChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccionar grado" />
                                                        </SelectTrigger>
                                                    </FormControl>

                                                    <SelectContent>
                                                        <SelectItem value="Sin especificar">Sin especificar</SelectItem>

                                                        {grades?.map( grade => (
                                                            <SelectItem key={grade.id} value={grade.id}>
                                                                { grade.name }
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

                                                { isErrorProfessors && !isLoadingProfessors
                                                    ? <>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder = "Ej: Juan Pérez"
                                                            value       = { field.value || '' }
                                                            onChange    = {( e: React.ChangeEvent<HTMLInputElement> ) => field.onChange( e.target.value )}
                                                        />
                                                    </FormControl>

                                                    <FormDescription>
                                                        Error al cargar los profesores. Ingrese el tamaño manualmente.
                                                    </FormDescription>
                                                </>
                                                : (
                                                    <div className="flex gap-2 items-center">
                                                        <div className="flex-1 min-w-0">
                                                            <MultiSelectCombobox
                                                                multiple            = { false }
                                                                placeholder         = "Seleccionar profesor"
                                                                defaultValues       = { field.value || '' }
                                                                onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                                options             = { memoizedProfessorOptions }
                                                                isLoading           = { isLoadingProfessors }
                                                            />
                                                        </div>

                                                        <Button
                                                            size    = {"icon"}
                                                            type    = "button"
                                                            variant = {"outline"}
                                                            className = "flex-shrink-0"
                                                            onClick = {() => setIsOpenProfessor( true )}
                                                        >
                                                            <Plus className="w-5 h-5"/>
                                                        </Button>
                                                    </div>
                                                )}

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                    {/* Espacio */}
                                    <FormField
                                        control = { form.control }
                                        name    = "spaceId"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel onClick={() => setTypeSpace([ true, false, false ])}>
                                                    Espacio
                                                </FormLabel>

                                                <div className="flex gap-2 items-center">
                                                    <Checkbox
                                                        className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center"
                                                        checked			= { typeSpace[0] }
                                                        onCheckedChange	= {( checked ) => setTypeSpace( [ checked as boolean, false, false ] )}
                                                    />

                                                    <MultiSelectCombobox
                                                        multiple            = { false }
                                                        placeholder         = "Seleccionar"
                                                        defaultValues       = { field.value || '' }
                                                        onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                        options             = { spaces }
                                                        isLoading           = { isLoadingSpaces }
                                                        disabled            = { !typeSpace[0] }
                                                    />
                                                </div>

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
                                                <FormLabel onClick={() => setTypeSpace([ false, true, false ])}>
                                                    Tipo de espacio</FormLabel>

                                                <div className="flex gap-2 items-center">
                                                    <Checkbox
                                                        className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center"
                                                        checked			= { typeSpace[1] }
                                                        onCheckedChange	= {( checked ) => setTypeSpace( [ false, checked as boolean, false ] )}
                                                    />

                                                    <Select
                                                        defaultValue    = { field.value ?? 'Sin especificar' }
                                                        onValueChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                                        disabled        = { !typeSpace[1] }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccionar tipo" />
                                                            </SelectTrigger>
                                                        </FormControl>

                                                        <SelectContent>
                                                            <SelectItem value="Sin especificar">Sin especificar</SelectItem>

                                                            {Object.values( SpaceType ).map( type => (
                                                                <SelectItem key={type} value={type}>
                                                                    { getSpaceType( type )}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

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
                                                <FormLabel onClick={() => setTypeSpace([ false, false, true ])}>
                                                    Tamaño del espacio
                                                </FormLabel>

                                                {isErrorSizes ? (
                                                    <>
                                                        <FormControl>
                                                            <Input
                                                                placeholder = "Ej: XS (< 30)"
                                                                value       = { field.value || '' }
                                                                onChange    = {( e ) => field.onChange( e.target.value || null )}
                                                            />
                                                        </FormControl>

                                                        <FormDescription>
                                                            Error al cargar los tamaños. Ingrese el tamaño manualmente.
                                                        </FormDescription>
                                                    </>
                                                ) : (
                                                    <div className="flex gap-2 items-center">
                                                        <Checkbox
                                                            className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center"
                                                            checked			= { typeSpace[2] }
                                                            onCheckedChange	= {( checked ) => setTypeSpace([ false, false, checked as boolean ])}
                                                        />

                                                        <Select
                                                            onValueChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                                            defaultValue    = { field.value || 'Sin especificar' }
                                                            disabled        = { isLoadingSizes || !typeSpace[2] }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Seleccionar tamaño" />
                                                                </SelectTrigger>
                                                            </FormControl>

                                                            <SelectContent>
                                                                <SelectItem value="Sin especificar">Sin especificar</SelectItem>

                                                                {sizes?.map( size => (
                                                                    <SelectItem key={size.id} value={size.id}>
                                                                        {size.id} ({size.detail})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

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
                                    name    = "costCenterId"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-medium">Centro de Costos</FormLabel>

                                            <MultiSelectCombobox
                                                multiple            = { false }
                                                placeholder         = "Seleccionar centro de costo"
                                                defaultValues       = { field.value || '' }
                                                onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                options             = { costCenter }
                                                isLoading           = { isLoadingCostCenter }
                                            />

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Tabla de módulos */}
                                <RequestDetailTable
                                    requestDetailModule = { form.watch( 'moduleDays' )}
                                    days                = { days || [] }
                                    modules             = { modules }
                                    onModuleToggle      = { handleModuleToggle }
                                />

                                {/* Descripción */}
                                <div className="w-full">
                                    <FormLabel>Descripción</FormLabel>

                                    <p>{requestDetail?.description || '-'}</p>
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
                                        disabled    = { updateRequestDetailMutation.isPending }
                                    >
                                        {updateRequestDetailMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : requestDetail ? 'Actualizar' : 'Crear'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="comments" className="mt-4">
                        <CommentSection
                            requestDetailId = { requestDetail.id }
                            enabled         = { tab === 'comments' }
                            size            = { 'h-[378px]' }
                        />
                    </TabsContent>
                </Tabs>

                <ProfessorForm
                    professors = { undefined }
                    isOpen      = { isOpenProfessor }
                    onClose     = { () => setIsOpenProfessor( false )}
                />
            </DialogContent>
        </Dialog>
    );
}
