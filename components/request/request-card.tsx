'use client'

import {  Eye, Calendar, User, BookOpen } from "lucide-react";

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


export function RequestCard({
    request,
    onViewDetails
}: {
    request: Request,
    onViewDetails: (request: Request) => void
}) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="">
                        <CardTitle className="text-md font-medium">{request.title.slice(-8)}</CardTitle>

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
                    <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
                )}

                <div className="flex items-center justify-between pt-2">
                    <Badge variant="secondary">
                        {request.totalDetails} detalle{request.totalDetails !== 1 ? "s" : ""}
                    </Badge>

                    <Button size="sm" onClick={() => onViewDetails(request)} className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        Ver detalles
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
