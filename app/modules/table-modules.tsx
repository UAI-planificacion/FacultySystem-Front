"use client";

import { JSX, useState } from "react";

import {
    Clock,
    CheckCircle,
    XCircle,
    Search
}                           from "lucide-react";
import { toast }            from "sonner";

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


import { ModuleModal }      from "@/app/modules/ModuleModal";
import { ModuleOriginal }   from "@/types/module.model";


interface Props {
    modules : ModuleOriginal[];
    onSave  : ( modules: ModuleOriginal[] ) => void;
    days    : number[];
}


export default function TableModules({
    modules,
    onSave,
    days
}: Props ): JSX.Element {
    const [searchQuery, setSearchQuery]             = useState( '' );
    const [isModalOpen, setIsModalOpen]             = useState( false );
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState( false );
    const [currentModule, setCurrentModule]         = useState<ModuleOriginal>( modules[0] || {} as ModuleOriginal );
    const [currentPage, setCurrentPage]             = useState( 1 );
    const [itemsPerPage, setItemsPerPage]           = useState( 10 );


    function onOpenModal( module: ModuleOriginal ): void {
        setCurrentModule( module );
        setIsModalOpen( true );
    }


    function onOpenDeleteDialog( module: ModuleOriginal ): void {
        setCurrentModule( module );
        setIsModalDeleteOpen( true );
    }


    /**
     * Filtra la lista de módulos según los criterios de búsqueda
     */
    const filteredModules = modules.filter( module => {
        const matchesSearch = searchQuery === ''
            || module.id.toLowerCase().includes( searchQuery.toLowerCase() )
            || module.code.toLowerCase().includes( searchQuery.toLowerCase() )
            || module.name.toLowerCase().includes( searchQuery.toLowerCase() )
            || (module.difference && module.difference.toLowerCase().includes( searchQuery.toLowerCase() ));

        return matchesSearch;
    });

    /**
     * Paginación
     */
    const totalItems = filteredModules.length;
    const totalPages = Math.ceil( totalItems / itemsPerPage );
    const startIndex = ( currentPage - 1 ) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedModules = filteredModules.slice( startIndex, endIndex );

    /**
     * Resetea la página actual cuando cambian los filtros
     */
    const handleSearchChange = ( value: string ) => {
        setCurrentPage( 1 );
        setSearchQuery( value );
    };


    return (
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
                                    placeholder = "Buscar por ID, código, nombre o diferencia..."
                                    value       = { searchQuery }
                                    onChange    = { (e) => handleSearchChange( e.target.value ) }
                                    className   = "pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de módulos */}
            <div className="space-y-4">
                <Card>
                    <CardContent className="mt-5">
                        { modules.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground">
                                No se han encontrado módulos.
                            </div>
                        ) : (
                            <div>
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-background">
                                        <TableRow>
                                            <TableHead className="bg-background w-[80px]">ID</TableHead>
                                            <TableHead className="bg-background w-[100px]">Código</TableHead>
                                            <TableHead className="bg-background w-[200px]">Nombre</TableHead>
                                            <TableHead className="bg-background w-[120px]">Estado</TableHead>
                                            <TableHead className="bg-background w-[120px]">Hora Inicio</TableHead>
                                            <TableHead className="bg-background w-[120px]">Hora Fin</TableHead>
                                            <TableHead className="bg-background w-[100px]">Diferencia</TableHead>
                                            <TableHead className="bg-background w-[120px] text-end">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>

                                <ScrollArea className="h-[calc(100vh-500px)]">
                                    <Table>
                                        <TableBody>
                                            {paginatedModules.map( module => (
                                                <TableRow key={ module.id }>
                                                    <TableCell className="font-medium w-[80px]">{ module.id }</TableCell>

                                                    <TableCell className="w-[100px]">{ module.code }</TableCell>

                                                    <TableCell className="w-[200px]">{ module.name }</TableCell>

                                                    <TableCell className="w-[120px]">
                                                        <div className="flex items-center">
                                                            {module.isActive ? (
                                                                <>
                                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                    <Badge className="bg-green-500">Activo</Badge>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                                    <Badge className="bg-red-500">Inactivo</Badge>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="w-[120px]">
                                                        <div className="flex items-center">
                                                            <Clock className="mr-2 h-4 w-4" />
                                                            { module.startHour }
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="w-[120px]">
                                                        <div className="flex items-center">
                                                            <Clock className="mr-2 h-4 w-4" />
                                                            { module.endHour }
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="w-[100px]">{ module.difference || '-' }</TableCell>

                                                    <TableCell className="w-[120px]">
                                                        <ActionButton
                                                            editItem   = { onOpenModal }
                                                            deleteItem = { onOpenDeleteDialog }
                                                            item       = { module }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                            { filteredModules.length === 0 && searchQuery ? (
                                                <TableRow>
                                                    <TableCell colSpan={ 8 } className="h-24 text-center">
                                                        No se encontraron resultados para &quot;{ searchQuery }&quot;
                                                    </TableCell>
                                                </TableRow>
                                            ) : modules.length === 0 && !searchQuery ? (
                                                <TableRow>
                                                    <TableCell colSpan={ 8 } className="h-24 text-center">
                                                        No hay módulos registrados
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

            <ModuleModal
                isOpen  = { isModalOpen }
                onClose = { () => setIsModalOpen( false )}
                module  = { currentModule }
                days    = { days }
            />

            {/* <DeleteConfirmDialog
                isOpen      = { isModalDeleteOpen }
                onClose     = { () => setIsModalDeleteOpen( false )}
                onConfirm   = { () => { handleDeleteModule( currentModule?.id || '' )}}
                name        = { currentModule?.name || '' }
                type        = "el Módulo"
            /> */}
        </div>
    );
}
