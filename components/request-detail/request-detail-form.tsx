"use client"

import { JSX, useEffect, useState } from "react";

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
}                                   from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}                                   from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
}                                   from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
}                                   from "@/components/ui/form";
import { Button }                   from "@/components/ui/button";
import { Input }                    from "@/components/ui/input";
import { Switch }                   from "@/components/ui/switch";
import { Badge }                    from "@/components/ui/badge";
import { ProfessorForm }            from "@/components/professor/professor-form";
import { CommentSection }           from "@/components/comment/comment-section";
import { RequestDetailModuleDays }  from "@/components/request-detail/request-detail-module-days";
import { Checkbox }                 from "@/components/ui/checkbox";
import { Textarea }                 from "@/components/ui/textarea";
import { GradeForm }                from "@/components/grade/grade-form";
import { CostCenterSelect }         from "@/components/shared/item-select/cost-center";
import { ProfessorSelect }          from "@/components/shared/item-select/professor-select";
import { SpaceSelect }              from "@/components/shared/item-select/space-select";
import { SizeSelect }               from "@/components/shared/item-select/size-select";
import { SpaceTypeSelect }          from "@/components/shared/item-select/space-type-select";

import {
    type RequestDetail,
    UpdateRequestDetail,
    SpaceType,
    Size,
    Building,
    CreateRequestDetail
}                           from "@/types/request-detail.model";
import {
    errorToast,
    successToast
}                           from "@/config/toast/toast.config";
import { cn }               from "@/lib/utils";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { Method, fetchApi } from "@/services/fetch";
import { Grade }            from "@/types/grade";
import { useSession }       from "@/hooks/use-session";
import { Request }          from "@/types/request";


const numberOrNull = z.union([
    z.string()
        .transform( val => val === '' ? null : Number( val )),
    z.number()
        .nullable()
        .optional(),
    z.null(),
    z.undefined()
]).transform( val => val === undefined ? null : val );


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
    description     : z.string().max( 500, "La descripción no puede tener más de 500 caracteres" ).nullable().default( '' ),
    spaceId         : z.string().nullable().optional(),
    moduleDays      : z.array(z.object({
        day         : z.string(),
        moduleId    : z.string()
    })).default([])
}).superRefine(( data, ctx ) => {
    const { minimum, maximum } = data;

    if ( minimum && maximum && maximum < minimum ) {
        ctx.addIssue({
            code    : z.ZodIssueCode.custom,
            message : "El máximo no puede ser menor que el mínimo.",
            path    : ['maximum'],
        });
    }
});


export type RequestDetailFormValues = z.infer<typeof formSchema>;


interface Props {
    requestDetail   : RequestDetail | undefined;
    onSuccess?      : () => void;
    onCancel        : () => void;
    isOpen          : boolean;
    onClose         : () => void;
    requestId       : string;
    request?        : Request;
}


const defaultRequestDetail = (
    requestDetail   : RequestDetail | undefined,
    request?        : Request       | undefined
): RequestDetailFormValues => ({
    minimum         : requestDetail?.minimum     || null,
    maximum         : requestDetail?.maximum     || null,
    // spaceType       : request ? request.offer.spaceType : requestDetail?.spaceType,
    // spaceSize       : request ? ( request.offer.spaceSize as Size | null ) : requestDetail?.spaceSize,
    // building        : request ? request.offer.building : requestDetail?.building,
    // costCenterId    : request ? request.offer.costCenterId : requestDetail?.costCenterId,
    inAfternoon     : requestDetail?.inAfternoon    || false,
    description     : requestDetail?.description    || '',
    isPriority      : requestDetail?.isPriority     || false,
    gradeId         : requestDetail?.grade?.id,
    professorId     : requestDetail?.professorId,
    spaceId         : requestDetail?.spaceId || '',
    moduleDays      : requestDetail?.moduleDays || [],
});


type Tab = 'form' | 'comments';


function getTypeSpace( requestDetail: RequestDetail | undefined | null ): boolean[] {
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
    request,
}: Props ): JSX.Element {
    const [tab, setTab]                             = useState<Tab>( 'form' );
    const queryClient                               = useQueryClient();
    const [typeSpace, setTypeSpace]                 = useState<boolean[]>([ false, false, false ]);
    const [isOpenProfessor, setIsOpenProfessor ]    = useState( false );
    const [isOpenGrade, setIsOpenGrade ]            = useState( false );
    const { staff }                                 = useSession();


    useEffect(() => {
        setTypeSpace( getTypeSpace( requestDetail ));
    },[requestDetail]);


    const createRequestDetailApi = async ( newRequestDetail: CreateRequestDetail ): Promise<RequestDetail> =>
        fetchApi<RequestDetail>({
            url     : 'request-details',
            method  : Method.POST,
            body    : newRequestDetail
        });


    const updateRequestDetailApi = async ( updatedRequestDetail: UpdateRequestDetail ): Promise<RequestDetail>  =>
        fetchApi<RequestDetail>({
            url     :`request-details/${updatedRequestDetail.id}`,
            method  : Method.PATCH ,
            body    : updatedRequestDetail
        });


    const createRequestDetailMutation = useMutation<RequestDetail, Error, CreateRequestDetail>({
        mutationFn: createRequestDetailApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.REQUEST_DETAIL, requestId] });
            onClose?.();
            form.reset();
            toast( 'Detalle creado exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al crear el detalle: ${mutationError.message}`, errorToast )
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
        data        : grades,
        isLoading   : isLoadingGrades,
        isError     : isErrorGrades,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.GRADES ],
        queryFn     : () => fetchApi<Grade[]>({ url: 'grades' }),
    });


    const form = useForm<RequestDetailFormValues>({
        resolver        : zodResolver( formSchema ) as any,
        defaultValues   : defaultRequestDetail( requestDetail, request ),
    });


    useEffect(() => {
        form.reset( defaultRequestDetail( requestDetail, request ));
        setTab( 'form' );
    }, [requestDetail, isOpen]);


    function handleModuleToggle( day: string, moduleId: string, isChecked: boolean ): void {
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
        console.log("🚀 ~ file: request-detail-form.tsx:340 ~ formData:", formData)
        if ( !staff ) return;

        if ( formData.spaceId ) {
            formData.building = ( formData.spaceId.split( '-' )[1] as Building || 'A' );
        }

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

        if ( requestDetail ) {
            updateRequestDetailMutation.mutate({
                ...formData,
                id              : requestDetail.id,
                staffUpdateId   : staff.id,
            });
        } else {
            createRequestDetailMutation.mutate({
                ...formData,
                requestId,
                staffCreateId: staff.id,
            });
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className=" flex justify-between items-center gap-2">
                        <div className="space-y-1">
                            <DialogTitle>
                                { requestDetail ? 'Editar Detalle' : 'Agregar Nuevo Detalle' }
                            </DialogTitle>

                            <DialogDescription>
                                { requestDetail 
                                    ? 'Modifique los campos necesarios del detalle.' 
                                    : 'Complete los campos para agregar un nuevo detalle.' }
                            </DialogDescription>
                        </div>

                        {requestDetail && (
                            <Badge
                                className="mr-5"
                                variant={requestDetail.isPriority ? 'destructive' : 'default'}
                            >
                                {requestDetail.isPriority ? 'Restrictivo' : 'No restrictivo' }
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <Tabs
                    defaultValue    = { tab }
                    onValueChange   = {( value ) => setTab( value as Tab )}
                    className       = "w-full"
                >
                    { requestDetail &&
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="form">Información</TabsTrigger>

                            <TabsTrigger value="comments">
                                Comentarios 
                            </TabsTrigger>
                        </TabsList>
                    }

                    <TabsContent value="form" className={cn("space-y-4", requestDetail ? 'mt-4': '')}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit( onSubmitForm )} className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <FormField
                                    control = { form.control }
                                    name    = "costCenterId"
                                    render  = {({ field }) => (
                                        <FormItem>
                                            <CostCenterSelect
                                                label               = "Centro de Costos"
                                                placeholder         = "Seleccionar Centro de Costo"
                                                defaultValues       = { field.value || '' }
                                                onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                multiple            = { false }
                                            />

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                    {/* Mínimo de estudiantes */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

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
                                </div>


                                    {/* Grade */}
                                    <FormField
                                        control = { form.control }
                                        name    = "gradeId"
                                        render  = {({ field }) => (
                                            <FormItem>
                                                <FormLabel>Grado</FormLabel>

                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        defaultValue    = { field.value ?? 'Sin especificar' }
                                                        onValueChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                                        disabled        = { isLoadingGrades }

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

                                                    <Button
                                                        size        = "icon"
                                                        type        = "button"
                                                        variant     = "outline"
                                                        className   = "flex-shrink-0"
                                                        onClick     = {() => setIsOpenGrade( true )}
                                                    >
                                                        <Plus className="w-5 h-5"/>
                                                    </Button>
                                                </div>

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
                                                <div className="flex items-end gap-2">
                                                    <div className="w-full">
                                                        <ProfessorSelect
                                                            label               = "Profesor"
                                                            multiple            = { false }
                                                            placeholder         = "Seleccionar profesor"
                                                            defaultValues       = { field.value || '' }
                                                            onSelectionChange   = {( value ) => field.onChange( value === undefined ? null : value )}
                                                            enabled             = { isOpen }
                                                        />
                                                    </div>

                                                    <Button
                                                        size        = "icon"
                                                        type        = "button"
                                                        variant     = "outline"
                                                        className   = "flex-shrink-0"
                                                        onClick     = {() => setIsOpenProfessor( true )}
                                                    >
                                                        <Plus className="w-5 h-5"/>
                                                    </Button>
                                                </div>

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

                                                    <div className="w-full">
                                                        <SpaceSelect
                                                            multiple            = { false }
                                                            placeholder         = "Seleccionar"
                                                            defaultValues       = { field.value || '' }
                                                            onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                            disabled            = { !typeSpace[0] }
                                                        />
                                                    </div>
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

                                                    <div className="w-full">
                                                        <SpaceTypeSelect
                                                            multiple            = { false }
                                                            placeholder         = "Seleccionar tipo"
                                                            defaultValues       = { field.value || '' }
                                                            onSelectionChange   = { ( value ) => field.onChange( value === undefined ? null : value ) }
                                                            disabled            = { !typeSpace[1] }
                                                        />
                                                    </div>
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

                                                <div className="flex gap-2 items-center">
                                                    <Checkbox
                                                        className		= "cursor-default rounded-full p-[0.6rem] flex justify-center items-center"
                                                        checked			= { typeSpace[2] }
                                                        onCheckedChange	= {( checked ) => setTypeSpace([ false, false, checked as boolean ])}
                                                    />

                                                    <div className="w-full">
                                                        <SizeSelect
                                                            onSelectionChange   = {( value ) => field.onChange( value === "Sin especificar" ? null : value )}
                                                            defaultValues    = { field.value || 'Sin especificar' }
                                                            disabled        = { !typeSpace[2] }
                                                            multiple        = { false }
                                                            placeholder="Seleccionar tamaño"
                                                        />
                                                    </div>
                                                </div>

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
                                            <div className="">
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

                                {/* Tabla de módulos */}
                                <RequestDetailModuleDays
                                    requestDetailModule = { form.watch( 'moduleDays' )}
                                    enabled             = { isOpen }
                                    onModuleToggle      = { handleModuleToggle }
                                />

                                {/* Descripción */}
                                <FormField
                                    control = { form.control }
                                    name    = "description"
                                    render  = {({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Descripción</FormLabel>

                                            <FormControl>
                                                <Textarea 
                                                    {...field}
                                                    placeholder = "Agregue una descripción opcional"
                                                    className   = "min-h-[100px] max-h-[250px]"
                                                    value       = { field.value || '' }
                                                />
                                            </FormControl>

                                            <FormDescription className="flex justify-end">
                                                {field.value?.length || 0 } / 500
                                            </FormDescription>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                        disabled    = { createRequestDetailMutation.isPending || updateRequestDetailMutation.isPending }
                                    >
                                        { createRequestDetailMutation.isPending || updateRequestDetailMutation.isPending ? (
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

                    { requestDetail &&
                        <TabsContent value="comments" className="mt-4">
                            <CommentSection
                                requestDetailId = { requestDetail?.id }
                                enabled         = { tab === 'comments' }
                                size            = { 'h-[378px]' }
                                />
                        </TabsContent>
                    }
                </Tabs>

                <ProfessorForm
                    professors = { undefined }
                    isOpen      = { isOpenProfessor }
                    onClose     = { () => setIsOpenProfessor( false )}
                />

                <GradeForm
                    grade   = { undefined }
                    isOpen  = { isOpenGrade }
                    onClose = { () => setIsOpenGrade( false )}
                />
            </DialogContent>
        </Dialog>
    );
}
