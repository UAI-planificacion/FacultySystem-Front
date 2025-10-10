"use client"

import { JSX } from "react";

import { Eye } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
}                               from "@/components/ui/table";
import {
    RequestCardSkeletonGrid,
    RequestErrorCard
}                               from "@/components/request/request-card-skeleton";
import { Card, CardContent }    from "@/components/ui/card";
import { Button }               from "@/components/ui/button";
import { Badge }                from "@/components/ui/badge";
import { Consecutive }          from "@/components/shared/consecutive";
import { ShowStatus }           from "@/components/shared/status";
import { ScrollArea }           from "@/components/ui/scroll-area";
import { ActionButton }         from "@/components/shared/action";

import { type Request } from "@/types/request";


interface RequestTableProps {
    requests        : Request[];
    onViewDetails   : ( request: Request ) => void;
    onEdit          : ( request: Request ) => void;
    onDelete        : ( request: Request ) => void;
    isLoading       : boolean;
    isError         : boolean;
}


export function RequestTable({
    requests,
    onViewDetails,
    onEdit,
    onDelete,
    isLoading,
    isError
}: RequestTableProps ): JSX.Element {
    if ( isLoading ) {
        return <RequestCardSkeletonGrid count={8} />;
    }

    if ( isError ) {
        return <RequestErrorCard />;
    }

    if ( requests.length === 0 ) {
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No se encontraron solicitudes.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="mt-5">
                <ScrollArea className="h-[calc(100vh-507px)]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Estado</TableHead>
                                {/* <TableHead>Consecutivo</TableHead> */}
                                <TableHead>Período</TableHead>
                                <TableHead>Creado por</TableHead>
                                <TableHead>Actualizado por</TableHead>
                                <TableHead>Asignatura</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map(( request ) => (
                                <TableRow key={request.id} className="hover:bg-muted/50">
                                    <TableCell
                                        className   = "font-medium max-w-[200px] truncate"
                                        title       = { request.title }
                                    >
                                        { request.title }
                                    </TableCell>

                                    <TableCell>
                                        <ShowStatus status={ request.status } />
                                    </TableCell>
{/* 
                                    <TableCell>
                                        <Consecutive isConsecutive={ request.isConsecutive } />
                                    </TableCell> */}

                                    {/* <TableCell>
                                        <Badge variant="outline">
                                            { request.offer.period.id } - { request.offer.period.name }
                                        </Badge>
                                    </TableCell> */}

                                    <TableCell
                                        className   = "max-w-[150px] truncate"
                                        title       = { request.staffCreate.name }
                                    >
                                        { request.staffCreate.name }
                                    </TableCell>

                                    <TableCell>
                                        { request.staffUpdate ? (
                                            <div
                                                className   = "max-w-[150px] truncate"
                                                title       = { request.staffUpdate.name }
                                            >
                                                { request.staffUpdate.name }
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>

                                    {/* <TableCell
                                        className   = "max-w-[150px] truncate"
                                        title       = {`${request.offer.subject.id} - ${request.offer.subject.name}`}
                                    >
                                        { request.offer.subject.name }
                                    </TableCell> */}

                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant     = "outline"
                                                size        = "sm"
                                                onClick     = {() => onViewDetails( request )}
                                                title       = "Ver detalles"
                                                className   = "gap-2 py-5"
                                            >
                                                { request.totalDetails }
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            <ActionButton
                                                editItem    = { () => onEdit( request ) }
                                                deleteItem  = { () => onDelete( request )}
                                                item        = { request }
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
