'use client'

import {  Eye, Calendar, User, BookOpen, Trash, Pencil } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                   from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import { Button }   from "@/components/ui/button";

import { type Request }                 from "@/types/request";
import { dateToString, getStatusColor } from "@/lib/utils";


export interface RequestCardProps {
    request         : Request;
    onViewDetails   : ( request: Request ) => void;
    onEdit          : ( request: Request ) => void;
    onDelete        : ( request: Request ) => void;
}

export function RequestCard({
    request,
    onViewDetails,
    onEdit,
    onDelete
}: RequestCardProps ) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="">
                        <CardTitle className="text-md font-medium line-clamp-1 truncate">{request.title}</CardTitle>

                        <p className="text-[11px] text-muted-foreground mb-2">{request.id}</p>

                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>

                    {request.isConsecutive && (
                        <Badge variant="outline" className="text-xs">
                            Consecutivo
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.subject.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{request.staffCreate.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{dateToString(request.createdAt)}</span>
                    </div>
                </div>

                {request.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 truncate">{request.description}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                    <Badge variant="secondary">
                        {request.totalDetails} detalle{request.totalDetails !== 1 ? "s" : ""}
                    </Badge>

                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => onEdit(request)} className="flex items-center gap-1" variant="outline">
                            <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>

                        <Button size="sm" onClick={() => onDelete(request)} className="flex items-center gap-1" variant="outline">
                            <Trash className="h-4 w-4 text-red-500" />
                        </Button>

                        <Button size="sm" onClick={() => onViewDetails(request)} className="flex items-center gap-1" variant="secondary">
                            <Eye className="h-4 w-4" />
                            Ver detalles
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
