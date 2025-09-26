"use client"

import { JSX, useState }    from "react";
import { useRouter }        from 'next/navigation';


import {
    useMutation,
    useQuery,
    useQueryClient
}                                   from "@tanstack/react-query";
import { Grid2x2, Plus }    from "lucide-react";
import { toast }                    from "sonner";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}                               from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
}                               from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                               from "@/components/ui/table"
import {
    OfferForm,
    updateSubjectOffersCount
}                               from "@/components/offer/offer-form"
import { DataPagination }       from "@/components/ui/data-pagination";
import { Button }               from "@/components/ui/button"
import { ScrollArea }           from "@/components/ui/scroll-area"
import { ActionButton }         from "@/components/shared/action";
import { PeriodSelect }         from "@/components/shared/item-select/period-select";
import { SubjectSelect }        from "@/components/shared/item-select/subject-select";
import { SizeSelect }           from "@/components/shared/item-select/size-select";
import { SpaceTypeSelect }      from "@/components/shared/item-select/space-type-select";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Label }                from "@/components/ui/label";
import { Badge }                from "@/components/ui/badge";
import { Skeleton }             from "@/components/ui/skeleton";
import { SessionShort }         from "@/components/section/session-short";
import { SpaceSizeType }        from "@/components/shared/space-size-type";

import { Offer }                    from "@/types/offer.model";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { usePagination }            from "@/hooks/use-pagination";
import { updateFacultyTotal }       from "@/app/faculties/page";


interface OfferManagementProps {
    facultyId   : string;
    enabled     : boolean;
}


export function OfferManagement({
    facultyId,
    enabled
}: OfferManagementProps ): JSX.Element {
    const router                                        = useRouter();
    const queryClient                                   = useQueryClient();
    const [periodFilter, setPeriodFilter]               = useState<string[]>( [] );
    const [subjectFilter, setSubjectFilter]             = useState<string[]>( [] );
    const [sizeFilter, setSizeFilter]                   = useState<string[]>( [] );
    const [spaceTypeFilter, setSpaceTypeFilter]         = useState<string[]>( [] );
    const [buildingFilter, setBuildingFilter]           = useState<string>( 'all' );
    const [englishFilter, setEnglishFilter]             = useState<string>( 'all' );
    const [isFormOpen, setIsFormOpen]                   = useState( false );
    const [editingOffer, setEditingOffer]               = useState<Offer | undefined>( undefined );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [deletingOfferId, setDeletingOfferId]         = useState<string | undefined>( undefined );

    // Fetch offers
    const {
        data: offerList,
        isLoading,
        isError
    } = useQuery({
        queryKey    : [ KEY_QUERYS.OFFERS, facultyId ],
        queryFn     : () => fetchApi<Offer[]>({ url: `offers/facultyId/${facultyId}` }),
        enabled
    });


    const filteredOffers = offerList?.filter( offer => {
        const matchesPeriod = periodFilter.length === 0
            || periodFilter.includes( offer.period.id );

        const matchesSubject = subjectFilter.length === 0
            || subjectFilter.includes( offer.subject.id );

        const matchesSize = sizeFilter.length === 0
            || ( offer.spaceSize && sizeFilter.includes( offer.spaceSize.id ) );

        const matchesSpaceType = spaceTypeFilter.length === 0
            || ( offer.spaceType && spaceTypeFilter.includes( offer.spaceType ) );

        const matchesBuilding = buildingFilter === 'all'
            || offer.building === buildingFilter;

        const matchesEnglish = englishFilter === 'all'
            || ( englishFilter === 'english' && offer.isEnglish )
            || ( englishFilter === 'spanish' && !offer.isEnglish );

        return matchesPeriod && matchesSubject && matchesSize && matchesSpaceType && matchesBuilding && matchesEnglish;
    }) || [];


    /**
     * Hook de paginación
     */
    const {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        paginatedData: paginatedOffers,
        setCurrentPage,
        setItemsPerPage,
        resetToFirstPage
    } = usePagination({
        data: filteredOffers,
        initialItemsPerPage: 10
    });


    /**
     * Resetea la página actual cuando cambian los filtros
     */
    function handleFilterChange( filterType: 'building' | 'english', value: string ): void {
        resetToFirstPage();

        switch ( filterType ) {
            case 'building':
                setBuildingFilter( value );
            break;
            case 'english':
                setEnglishFilter( value );
            break;
        }
    };

    /**
     * Maneja cambios en filtros múltiples
     */
    function handleMultipleFilterChange( filterType: 'period' | 'subject' | 'size' | 'spaceType', values: string[] ): void {
        resetToFirstPage();

        switch ( filterType ) {
            case 'period':
                setPeriodFilter( values );
            break;
            case 'subject':
                setSubjectFilter( values );
            break;
            case 'size':
                setSizeFilter( values );
            break;
            case 'spaceType':
                setSpaceTypeFilter( values );
            break;
        }
    };


    function openNewOfferForm(): void {
        setEditingOffer( undefined );
        setIsFormOpen( true );
    }


    function openEditOfferForm( offer: Offer ): void {
        setEditingOffer( offer );
        setIsFormOpen( true );
    }


    const deleteOfferApi = async ( offerId: string ): Promise<Offer> =>
        fetchApi<Offer>({ url: `offers/${offerId}`, method: Method.DELETE });


    const deleteOfferMutation = useMutation<Offer, Error, string>({
        mutationFn: deleteOfferApi,
        onSuccess: ( deletedOffer ) => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.OFFERS, facultyId] });
            updateSubjectOffersCount( queryClient, facultyId, deletedOffer.subject.id, false );
            updateFacultyTotal( queryClient, facultyId, false, 'totalOffers' );
            setIsDeleteDialogOpen( false );
            toast( 'Oferta eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar oferta: ${mutationError.message}`, errorToast )
    });


    function onOpenDeleteOffer( offer: Offer ): void {
        setDeletingOfferId( offer.id.toString() );
        setIsDeleteDialogOpen( true );
    }


    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="lg:flex lg:justify-between items-end gap-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full items-center">
                            <PeriodSelect
                                label               = "Períodos"
                                defaultValues       = { periodFilter }
                                onSelectionChange   = {( values ) => handleMultipleFilterChange( 'period', values as string[] )}
                                placeholder         = "Seleccionar períodos"
                                className           = "grid"
                            />

                            <SubjectSelect
                                label               = "Asignaturas"
                                defaultValues       = { subjectFilter }
                                onSelectionChange   = {( values ) => handleMultipleFilterChange( 'subject', values as string[] )}
                                placeholder         = "Seleccionar asignaturas"
                                queryKey            = {[ KEY_QUERYS.SUBJECTS, facultyId ]}
                                url                 = { facultyId }
                                className           = "grid"
                            />

                            <SpaceTypeSelect
                                className           = "grid"
                                label               = "Tipo de Espacio"
                                defaultValues       = { spaceTypeFilter[0] || '' }
                                placeholder         = "Tipo de espacio"
                                onSelectionChange   = {( value ) => {
                                    const newValues = value && value !== 'none' ? [value as string] : [];
                                    handleMultipleFilterChange( 'spaceType', newValues );
                                }}
                            />

                            {/* <SizeSelect
                                label               = "Tamaños"
                                defaultValues       = { sizeFilter }
                                onSelectionChange   = {( values ) => handleMultipleFilterChange( 'size', values as string[] )}
                                placeholder         = "Seleccionar tamaños"
                            /> */}

                            <div className="grid space-y-2">
                                <Label htmlFor="building">Edificio</Label>

                                <Select value={buildingFilter} onValueChange={( value ) => handleFilterChange( 'building', value )}>
                                    <SelectTrigger id="building">
                                        <SelectValue placeholder="Filtrar por edificio" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">Todos los edificios</SelectItem>
                                        <SelectItem value="BUILDING_A">Edificio A</SelectItem>
                                        <SelectItem value="BUILDING_B">Edificio B</SelectItem>
                                        <SelectItem value="BUILDING_C">Edificio C</SelectItem>
                                        <SelectItem value="BUILDING_D">Edificio D</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid space-y-2">
                                <Label htmlFor="english">Idioma</Label>

                                <Select value={englishFilter} onValueChange={(value) => handleFilterChange( 'english', value )}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por idioma" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">Todos los idiomas</SelectItem>
                                        <SelectItem value="english">Inglés</SelectItem>
                                        <SelectItem value="spanish">Español</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            onClick     = { openNewOfferForm }
                            className   = "flex items-center gap-1 w-full lg:w-40"
                        >
                            <Plus className="h-4 w-4" />
                            Crear Oferta
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardContent className="mt-5">
                    {offerList?.length === 0 && !isLoading && !isError ? (
                        <div className="text-center p-8 text-muted-foreground">
                            Aún no se han creado ofertas para esta facultad.
                        </div>
                    ) : (
                        <div>
                            {isError ? (
                                <div className="text-center p-8 text-destructive">
                                    Error al cargar las ofertas
                                </div>
                            ) : isLoading ? (
                                <div className="space-y-2 p-4">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <ScrollArea className="h-[calc(100vh-555px)]">
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10 bg-background">
                                            <TableRow>
                                                <TableHead className="bg-background w-[120px]">Espacio</TableHead>
                                                <TableHead className="bg-background w-[140px]">Período</TableHead>
                                                <TableHead className="bg-background w-[250px]">Asignatura</TableHead>
                                                <TableHead className="bg-background w-[120px]">Sesiones</TableHead>
                                                <TableHead className="bg-background w-[80px] text-center">Fechas</TableHead>
                                                <TableHead className="bg-background w-[80px] text-center">Edificio</TableHead>
                                                <TableHead className="bg-background w-[80px] text-center">Inglés</TableHead>
                                                <TableHead className="text-right bg-background w-[150px]">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedOffers.map(( offer ) => (
                                                <TableRow key={ offer.id }>
                                                    {/* Tipo/Tamaño */}
                                                    <TableCell className="w-[120px]">
                                                        <SpaceSizeType
                                                            spaceType   = { offer.spaceType }
                                                            spaceSizeId = { offer.spaceSize?.id }
                                                        />
                                                    </TableCell>

                                                    {/* Periodo */}
                                                    <TableCell className="w-[140px]">
                                                        <Badge variant="outline">
                                                            { offer.period.id } - { offer.period.name }
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Asignatura */}
                                                    <TableCell
                                                        className   = "w-[250px] truncate"
                                                        title       = { `${offer.subject.id} - ${offer.subject.name}` }
                                                    >
                                                        { offer.subject.name }
                                                    </TableCell>

                                                    {/* Sesiones */}
                                                    <TableCell className="w-[120px]">
                                                        <SessionShort
                                                            showZero        = { true }
                                                            sessionCounts   = {{
                                                                C: offer.lecture,
                                                                T: offer.workshop,
                                                                A: offer.tutoringSession,
                                                                L: offer.laboratory,
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Fechas */}
                                                    <TableCell className="text-center w-[80px]">
                                                        <Badge variant="outline">
                                                            {offer.startDate?.length || 0}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Edificio */}
                                                    <TableCell className="text-center w-[80px]">
                                                        {offer.building ? (
                                                            <Badge variant="outline">
                                                                {offer.building.replace('BUILDING_', '')}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>

                                                    {/* Inglés */}
                                                    <TableCell className="text-center w-[80px]">
                                                        <Badge variant={offer.isEnglish ? "default" : "secondary"}>
                                                            {offer.isEnglish ? "Sí" : "No"}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Acciones */}
                                                    <TableCell className="w-[150px]">
                                                        <div className="flex items-center gap-1.5">
                                                            <Button
                                                                title   = "Ver Secciones"
                                                                size    = "icon"
                                                                variant = "outline"
                                                                onClick = { () => router.push( `/sections?subject=${ offer.subject.id }` )}
                                                            >
                                                                <Grid2x2 className="w-4 h-4" />
                                                            </Button>

                                                            <ActionButton
                                                                editItem    = { openEditOfferForm }
                                                                deleteItem  = { onOpenDeleteOffer }
                                                                item        = { offer }
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                            { filteredOffers.length === 0 && ( periodFilter.length > 0 || subjectFilter.length > 0 || sizeFilter.length > 0 || spaceTypeFilter.length > 0 || buildingFilter !== 'all' || englishFilter !== 'all' ) ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-24 text-center">
                                                        No se encontraron ofertas con los filtros aplicados
                                                    </TableCell>
                                                </TableRow>
                                            ) : offerList?.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-24 text-center">
                                                        No hay ofertas registradas
                                                    </TableCell>
                                                </TableRow>
                                            ) : null }
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            <DataPagination
                currentPage             = { currentPage }
                totalPages              = { totalPages }
                totalItems              = { totalItems }
                itemsPerPage            = { itemsPerPage }
                onPageChange            = { setCurrentPage }
                onItemsPerPageChange    = { setItemsPerPage }
            />

            {/* Offer Form Dialog */}
            <OfferForm
                offer       = { editingOffer }
                isOpen      = { isFormOpen }
                facultyId   = { facultyId }
                onClose     = {() => {
                    setIsFormOpen( false )
                    setEditingOffer( undefined );
                }}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = {() => setIsDeleteDialogOpen( false )}
                onConfirm   = {() => deleteOfferMutation.mutate( deletingOfferId! )}
                name        = { deletingOfferId! }
                type        = "la Oferta"
            />
        </div>
    );
}
