"use client"

import { JSX, useEffect } from "react"

import {
    useMutation,
    useQueryClient
}                       from "@tanstack/react-query";
import { toast }        from "sonner";
import { zodResolver }  from "@hookform/resolvers/zod";
import { useForm }      from "react-hook-form";
import * as z           from "zod";
import {
    Calendar as CalendarIcon,
    Plus,
    Trash
}                       from "lucide-react";

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                           from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
}                           from "@/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                           from "@/components/ui/table";
import { Input }            from "@/components/ui/input";
import { Button }           from "@/components/ui/button";
import { Switch }           from "@/components/ui/switch";
import { Calendar }         from "@/components/ui/calendar";
import { ScrollArea }       from "@/components/ui/scroll-area";
import { PeriodSelect }     from "@/components/shared/item-select/period-select";
import { SizeSelect }       from "@/components/shared/item-select/size-select";
import { SubjectSelect }    from "@/components/shared/item-select/subject-select";

import {
    Building,
    Size,
    SpaceType
}                           from "@/types/request-detail.model";
import {
    CreateOffer,
    Offer,
    UpdateOffer
}                           from "@/types/offer.model";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { Method, fetchApi } from "@/services/fetch";
import { cn, getSpaceType } from "@/lib/utils";

import { errorToast, successToast } from "@/config/toast/toast.config";


// Form schema with Zod validation
const formSchema = z.object({
    startDate       : z.array( z.date() ).min( 1, "Al menos una fecha de inicio es requerida" ),
    endDate         : z.array( z.date() ).min( 1, "Al menos una fecha de fin es requerida" ),
    building        : z.nativeEnum( Building ).nullable(),
    isEnglish       : z.boolean(),
    workshop        : z.number().min( 0, "El taller debe ser mayor o igual a 0" ),
    lecture         : z.number().min( 0, "La conferencia debe ser mayor o igual a 0" ),
    tutorialSession : z.number().min( 0, "La sesión tutorial debe ser mayor o igual a 0" ),
    laboratory      : z.number().min( 0, "El laboratorio debe ser mayor o igual a 0" ),
    subjectId       : z.string().min( 1, "La materia es requerida" ),
    spaceType       : z.nativeEnum( SpaceType ).nullable(),
    spaceSize       : z.nativeEnum( Size ).nullable(),
    periodId        : z.string().min( 1, "El período es requerido" ),
}).refine(
    ( data ) => {
        const { workshop, lecture, tutorialSession, laboratory } = data;
        return workshop > 0 || lecture > 0 || tutorialSession > 0 || laboratory > 0;
    },
    {
        message : "Al menos uno de los campos (Taller, Cátedra, Ayudantía o Laboratorio) debe ser mayor que 0",
        path    : [ "workshop" ], // This will show the error on the workshop field
    }
);


export type OfferFormValues = z.infer<typeof formSchema>;


// Interface for date pairs
interface DatePair {
    startDate   : Date;
    endDate     : Date;
}


// Props interface
interface OfferFormProps {
    offer?      : Offer;
    isOpen      : boolean;
    onClose     : () => void;
    onSubmit?   : ( offer: Offer ) => void;
    facultyId   : string;
}


// Default values function
function defaultOfferValues( offer?: Offer ): Partial<OfferFormValues> {
    if ( !offer ) {
        return {
            startDate       : [],
            endDate         : [],
            building        : null,
            isEnglish       : false,
            workshop        : 0,
            lecture         : 0,
            tutorialSession : 0,
            laboratory      : 0,
            subjectId       : '',
            spaceType       : null,
            spaceSize       : null,
            periodId        : '',
        };
    }

    return {
        startDate       : offer.startDate,
        endDate         : offer.endDate,
        building        : offer.building,
        isEnglish       : offer.isEnglish,
        workshop        : offer.workshop,
        lecture         : offer.lecture,
        tutorialSession : offer.tutorialSession,
        laboratory      : offer.laboratory,
        subjectId       : offer.subjectId,
        spaceType       : offer.spaceType,
        spaceSize       : offer.spaceSize,
        periodId        : offer.periodId,
    };
}


/**
 * API call to create a new offer
 */
const createOfferApi = async ( newOffer: CreateOffer ): Promise<Offer> =>
    fetchApi<Offer>({
        url     : 'offers',
        method  : Method.POST,
        body    : newOffer
    });


/**
 * API call to update an existing offer
 */
const updateOfferApi = async ( updatedOffer: UpdateOffer ): Promise<Offer> =>
    fetchApi<Offer>({
        url     : `offers/${updatedOffer.id}`,
        method  : Method.PATCH,
        body    : updatedOffer
    });


export function OfferForm({
    offer,
    isOpen,
    onClose,
    onSubmit,
    facultyId
}: OfferFormProps ): JSX.Element {
    const queryClient = useQueryClient();


    const form = useForm<OfferFormValues>({
        resolver        : zodResolver( formSchema ),
        defaultValues   : defaultOfferValues( offer ),
    });


    const { watch, setValue } = form;
    const dates = watch( 'startDate' )  || [];
    const endDates = watch( 'endDate' ) || [];


    /**
     * Mutation to create an offer
     */
    const createOfferMutation = useMutation<Offer, Error, CreateOffer>({
        mutationFn: createOfferApi,
        onSuccess: ( newOffer ) => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.OFFERS, facultyId ]});
            onClose();
            onSubmit?.( newOffer );
            toast( 'Oferta creada exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al crear oferta: ${mutationError.message}`, errorToast );
        },
    });


    /**
     * Mutation to update an offer
     */
    const updateOfferMutation = useMutation<Offer, Error, UpdateOffer>({
        mutationFn: updateOfferApi,
        onSuccess: ( updatedOffer ) => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.OFFERS, facultyId ]});
            onClose();
            onSubmit?.( updatedOffer );
            toast( 'Oferta actualizada exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al actualizar oferta: ${mutationError.message}`, errorToast );
        },
    });


    /**
     * Handle form submission
     */
    function handleSubmit( values: OfferFormValues ): void {
        console.log("🚀 ~ file: offer-form.tsx:244 ~ values:", values)
        // if ( offer ) {
        //     // Update existing offer
        //     const updateData: UpdateOffer = {
        //         id              : offer.id,
        //         ...values
        //     };
        //     updateOfferMutation.mutate( updateData );
        // } else {
        //     // Create new offer
        //     const createData: CreateOffer = values;
        //     createOfferMutation.mutate( createData );
        // }
    }


    /**
     * Add a new date pair
     */
    function addDatePair(): void {
        const newStartDates = [ ...dates, new Date() ];
        const newEndDates = [ ...endDates, new Date() ];
        setValue( 'startDate', newStartDates );
        setValue( 'endDate', newEndDates );
    }


    /**
     * Remove a date pair
     */
    function removeDatePair( index: number ): void {
        const newStartDates = dates.filter( ( _, i ) => i !== index );
        const newEndDates = endDates.filter( ( _, i ) => i !== index );
        setValue( 'startDate', newStartDates );
        setValue( 'endDate', newEndDates );
    }


    /**
     * Update start date at specific index
     */
    function updateStartDate( index: number, date: Date | undefined ): void {
        if ( !date ) return;

        const newDates = [ ...dates ];
        newDates[ index ] = date;
        setValue( 'startDate', newDates );
    }


    /**
     * Update end date at specific index
     */
    function updateEndDate( index: number, date: Date | undefined ): void {
        if ( !date ) return;

        const newDates = [ ...endDates ];
        newDates[ index ] = date;
        setValue( 'endDate', newDates );
    }


    // Reset form when offer changes
    useEffect(() => {
        form.reset( defaultOfferValues( offer ));
    }, [offer, isOpen]);


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        { offer ? 'Editar Oferta' : 'Crear Nueva Oferta' }
                    </DialogTitle>

                    <DialogDescription>
                        { offer
                            ? 'Modifica los datos de la oferta existente.'
                            : 'Completa los datos para crear una nueva oferta.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit( handleSubmit )} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Subject Selection */}
                            <FormField
                                control = { form.control }
                                name    = "subjectId"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <SubjectSelect
                                            label               = "Asignatura *"
                                            defaultValues       = { field.value }
                                            onSelectionChange   = { field.onChange }
                                            multiple            = { false }
                                        />

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Period Selection */}
                            <FormField
                                control = { form.control }
                                name    = "periodId"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <PeriodSelect
                                            label               = "Período *"
                                            defaultValues       = { field.value || '' }
                                            multiple            = { false }
                                            onSelectionChange   = {( values ) => field.onChange( values || '' )}
                                        />

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Capacity and Numbers Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField
                                control = { form.control }
                                name    = "workshop"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Taller</FormLabel>

                                        <FormControl>
                                            <Input
                                                type        = "number"
                                                placeholder = "Taller"
                                                {...field}
                                                onChange    = {( e ) => field.onChange( parseInt( e.target.value ) || 0 )}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control = { form.control }
                                name    = "lecture"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cátedra</FormLabel>

                                        <FormControl>
                                            <Input
                                                type        = "number"
                                                placeholder = "Cátedra"
                                                {...field}
                                                onChange    = {( e ) => field.onChange( parseInt( e.target.value ) || 0 )}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control = { form.control }
                                name    = "tutorialSession"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ayudantía</FormLabel>

                                        <FormControl>
                                            <Input
                                                type        = "number"
                                                placeholder = "Ayudantía"
                                                {...field}
                                                onChange    = {( e ) => field.onChange( parseInt( e.target.value ) || 0 )}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control = { form.control }
                                name    = "laboratory"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Laboratorio</FormLabel>

                                        <FormControl>
                                            <Input
                                                type        = "number"
                                                placeholder = "Laboratorio"
                                                {...field}
                                                onChange    = {( e ) => field.onChange( parseInt( e.target.value ) || 0 )}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Building and Space Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control = { form.control }
                                name    = "building"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Edificio</FormLabel>

                                        <Select
                                            onValueChange   = {( value ) => field.onChange( value === "null" ? null : value )}
                                            defaultValue    = { field.value || "null" }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar edificio" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="null">Sin especificar</SelectItem>

                                                {Object.values( Building ).map( building => (
                                                    <SelectItem key={building} value={building}>
                                                        {building}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control = { form.control }
                                name    = "spaceType"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Espacio</FormLabel>

                                        <Select
                                            onValueChange   = {( value ) => field.onChange( value === "null" ? null : value )}
                                            defaultValue    = { field.value || "null" }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                <SelectItem value="null">Sin especificar</SelectItem>
                                                {Object.values( SpaceType ).map( type => (
                                                    <SelectItem key={type} value={type}>
                                                        { getSpaceType( type )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control = { form.control }
                                name    = "spaceSize"
                                render  = {({ field }) => (
                                    <FormItem>
                                        <SizeSelect
                                            label               = "Tamaño del Espacio"
                                            defaultValues       = { field.value || '' }
                                            multiple            = { false }
                                            onSelectionChange   = {( values ) => field.onChange( values === '' ? null : values )}
                                        />

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* English Switch */}
                        <FormField
                            control = { form.control }
                            name    = "isEnglish"
                            render  = {({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Materia en Inglés
                                        </FormLabel>
                                        <FormDescription>
                                            Indica si la materia se imparte en inglés
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

                        {/* Dates Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-base font-semibold">
                                    Fechas de la Oferta *
                                </FormLabel>

                                <Button
                                    type        = "button"
                                    onClick     = { addDatePair }
                                    className   = "gap-2"
                                    size        = "sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Agregar Fecha
                                </Button>
                            </div>

                            {dates.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground h-72">
                                    No hay fechas configuradas. Haz clic en "Agregar Fecha" para comenzar.
                                </div>
                            ) : (
                                <ScrollArea className="h-72">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fecha de Inicio</TableHead>
                                                <TableHead>Fecha de Fin</TableHead>
                                                <TableHead className="w-[50px]">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dates.map( ( dateItem, index ) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant     = "outline"
                                                                    className   = "w-full justify-start text-left font-normal gap-2"
                                                                >
                                                                    <CalendarIcon className="h-4 w-4" />
                                                                    {dateItem ? dateItem.toLocaleDateString() : "Seleccionar fecha"}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar
                                                                    mode        = "single"
                                                                    selected    = { dateItem }
                                                                    onSelect    = {( selectedDate ) => updateStartDate( index, selectedDate )}
                                                                    disabled    = {( date ) => date < new Date() }
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant     = "outline"
                                                                    className   = "w-full justify-start text-left font-normal gap-2"
                                                                >
                                                                    <CalendarIcon className="h-4 w-4" />
                                                                    {endDates[index] ? endDates[index].toLocaleDateString() : "Seleccionar fecha"}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar
                                                                    mode        = "single"
                                                                    selected    = { endDates[index] }
                                                                    onSelect    = {( selectedDate ) => updateEndDate( index, selectedDate )}
                                                                    disabled    = {( date ) => date < dateItem || date < new Date() }
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type    = "button"
                                                            variant = "destructive"
                                                            size    = "icon"
                                                            onClick = {() => removeDatePair( index )}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-between gap-2 pt-4 border-t">
                            <Button
                                type    = "button"
                                variant = "outline"
                                onClick = { onClose }
                            >
                                Cancelar
                            </Button>
                            <Button
                                type        = "submit"
                                disabled    = { createOfferMutation.isPending || updateOfferMutation.isPending }
                            >
                                {createOfferMutation.isPending || updateOfferMutation.isPending
                                    ? (offer ? 'Actualizando...' : 'Creando...')
                                    : (offer ? 'Actualizar Oferta' : 'Crear Oferta')
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
