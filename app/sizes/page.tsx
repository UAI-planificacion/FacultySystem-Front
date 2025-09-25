"use client"

import { useState } from "react"

import {
    Plus,
    Ruler,
    Search
}                           from "lucide-react";
import { toast }            from "sonner";
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button }               from "@/components/ui/button";
import { Badge }                from "@/components/ui/badge";
import {
    Card,
    CardContent,
}                               from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                               from "@/components/ui/table";
import { Input }                from "@/components/ui/input";
import { Label }                from "@/components/ui/label";
import { ScrollArea }           from "@/components/ui/scroll-area";
import { DataPagination }       from "@/components/ui/data-pagination";
import { ActionButton }         from "@/components/shared/action";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";

import { SizeModal }            from "@/app/sizes/size-modal";
import { Size }                 from "@/types/size.model";
import { KEY_QUERYS }           from '@/consts/key-queries';
import { Method, fetchApi }     from '@/services/fetch';
import { useSizes }             from "@/hooks/use-sizes";
import { DeleteConfirmDialog } from "@/components/dialog/DeleteConfirmDialog";


const endpoint = 'sizes';

export default function SizesPage() {
    const queryClient = useQueryClient();
    const {
        data: sizes = [],
        isError,
        error
    } = useSizes();

    const [searchQuery, setSearchQuery]             = useState( '' );
    const [isModalOpen, setIsModalOpen]             = useState( false );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState( false );
    const [currentSize, setCurrentSize]             = useState<Size | null>( null );
    const [currentPage, setCurrentPage]             = useState( 1 );
    const [itemsPerPage, setItemsPerPage]           = useState( 10 );


    /**
     * Filtra la lista de tamaños según los criterios de búsqueda
     */
    const filteredSizes = sizes.filter( size => {
        const matchesSearch = searchQuery === ''
            || size.id.toLowerCase().includes( searchQuery.toLowerCase() )
            || size.detail.toLowerCase().includes( searchQuery.toLowerCase() );

        return matchesSearch;
    });

    /**
     * Paginación
     */
    const totalItems = filteredSizes.length;
    const totalPages = Math.ceil( totalItems / itemsPerPage );
    const startIndex = ( currentPage - 1 ) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSizes = filteredSizes.slice( startIndex, endIndex );

    /**
     * Resetea la página actual cuando cambian los filtros
     */
    const handleSearchChange = ( value: string ) => {
        setCurrentPage( 1 );
        setSearchQuery( value );
    };

    /**
     * API call para eliminar un tamaño
     */
    const deleteSizeApi = async (id: string): Promise<void> => {
        await fetchApi<void>({
            url    : `${endpoint}/${id}`,
            method : Method.DELETE,
        });
    };

    /**
     * Mutación para eliminar tamaño
     */
    const deleteSizeMutation = useMutation<void, Error, string>({
        mutationFn : deleteSizeApi,
        onSuccess  : () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SIZES] });
            toast('Tamaño eliminado exitosamente', successToast);
            setIsDeleteDialogOpen( false );
        },
        onError: (mutationError) => {
            toast(`Error al eliminar tamaño: ${mutationError.message}`, errorToast);
            setIsDeleteDialogOpen( false );
        },
    });

    /**
     * Maneja la eliminación de un tamaño
     */
    const handleDeleteSize = (): void => {
        if ( currentSize?.id ) {
            deleteSizeMutation.mutate( currentSize.id );
        }
    };


    function openAddModal(): void {
        setCurrentSize( null );
        setIsModalOpen( true );
    }

    function openEditModal( size: Size ): void {
        setCurrentSize( size );
        setIsModalOpen( true );
    }

    function openDeleteDialog( size: Size ): void {
        setCurrentSize( size );
        setIsDeleteDialogOpen( true );
    }

    if (isError) {
        return (
            <main className="container mx-auto py-10">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-destructive mb-2">Error al cargar tamaños</p>
                        <p className="text-muted-foreground text-sm">{error?.message}</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="container mx-auto py-10">
            <header className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold tracking-tight">
                    Gestión de Tamaños
                </h1>

                <Button 
                    onClick={ openAddModal } 
                    className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                >
                    <Plus className="h-5 w-5" />
                    Crear Tamaño
                </Button>
            </header>

            <div className="space-y-6">
                {/* Filtros */}
                <Card>
                    <CardContent className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Buscar</Label>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />

                                    <Input
                                        id          = "search"
                                        placeholder = "Buscar por ID o detalle..."
                                        value       = { searchQuery }
                                        onChange    = { (e) => handleSearchChange( e.target.value ) }
                                        className   = "pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla de tamaños */}
                <div className="space-y-4">
                    <Card>
                        <CardContent className="mt-5">
                            { sizes.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    No se han encontrado tamaños.
                                </div>
                            ) : (
                                <div>
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10 bg-background">
                                            <TableRow>
                                                <TableHead className="bg-background w-[80px]">ID</TableHead>
                                                <TableHead className="bg-background w-[200px]">Detalle</TableHead>
                                                <TableHead className="bg-background w-[100px]">Mínimo</TableHead>
                                                <TableHead className="bg-background w-[100px]">Máximo</TableHead>
                                                <TableHead className="bg-background w-[120px]">Mayor que</TableHead>
                                                <TableHead className="bg-background w-[120px]">Menor que</TableHead>
                                                <TableHead className="bg-background w-[120px] text-end">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                    </Table>

                                    <ScrollArea className="h-[calc(100vh-500px)]">
                                        <Table>
                                            <TableBody>
                                                {paginatedSizes.map( size => (
                                                    <TableRow key={ size.id }>
                                                        <TableCell className="font-medium w-[80px]">
                                                            <div className="flex items-center">
                                                                <Ruler className="mr-2 h-4 w-4" />
                                                                { size.id }
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="w-[200px]">{ size.detail }</TableCell>

                                                        <TableCell className="w-[100px]">{ size.min ?? '-' }</TableCell>

                                                        <TableCell className="w-[100px]">{ size.max ?? '-' }</TableCell>

                                                        <TableCell className="w-[120px]">{ size.greaterThan ?? '-' }</TableCell>

                                                        <TableCell className="w-[120px]">{ size.lessThan ?? '-' }</TableCell>

                                                        <TableCell className="w-[120px]">
                                                            <ActionButton
                                                                editItem   = { openEditModal }
                                                                deleteItem = { openDeleteDialog }
                                                                item       = { size }
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}

                                                { filteredSizes.length === 0 && searchQuery ? (
                                                    <TableRow>
                                                        <TableCell colSpan={ 7 } className="h-24 text-center">
                                                            No se encontraron resultados para &quot;{ searchQuery }&quot;
                                                        </TableCell>
                                                    </TableRow>
                                                ) : sizes.length === 0 && !searchQuery ? (
                                                    <TableRow>
                                                        <TableCell colSpan={ 7 } className="h-24 text-center">
                                                            No hay tamaños registrados
                                                        </TableCell>
                                                    </TableRow>
                                                ) : null }
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </div>
                            ) }
                        </CardContent>
                    </Card>

                    {/* Paginación */}
                    <DataPagination
                        currentPage             = { currentPage }
                        totalPages              = { totalPages }
                        totalItems              = { totalItems }
                        itemsPerPage            = { itemsPerPage }
                        onPageChange            = { setCurrentPage }
                        onItemsPerPageChange    = { setItemsPerPage }
                    />
                </div>
            </div>

            <SizeModal
                isOpen          = { isModalOpen }
                onClose         = { () => setIsModalOpen( false )}
                size            = { currentSize }
                existingSizes   = { sizes }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { handleDeleteSize }
                name        = { currentSize?.id || '' }
                type        = "el Tamaño"
            />
        </main>
    );
}
