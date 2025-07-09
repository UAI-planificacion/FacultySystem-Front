'use client'

import {
    ArrowLeft,
    User,
    BookOpen,
    Ellipsis,
} from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
}                   from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import { Button }   from "@/components/ui/button";

import { type Request }     from "@/types/request";
import { getStatusColor }   from "@/lib/utils";


interface RequestInfoCardProps {
    request : Request;
    onBack  : () => void;
}

export function RequestInfoCard({ request, onBack }: RequestInfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex flex-col">
                            <CardTitle>{request.title}</CardTitle>
                            <p className="text-[11px] text-muted-foreground">{request.id}</p>
                        </div>
                    </div>

                    <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="col-span-2 space-y-3">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />

                            <div>
                                <p className="font-medium">Creado por</p>
                                <p className="text-sm text-muted-foreground">{request.staffCreate.name}</p>
                                <p className="text-sm text-muted-foreground">{new Date(request.createdAt).toDateString()}</p>
                            </div>
                        </div>

                        {request.staffUpdate && (
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />

                                <div>
                                    <p className="font-medium">Actualizado por</p>
                                    <p className="text-sm text-muted-foreground">{request.staffUpdate.name}</p>
                                    <p className="text-sm text-muted-foreground">{request.updatedAt ? new Date(request.updatedAt).toDateString(): '-'}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />

                            <div>
                                <p className="font-medium">Asignatura</p>
                                <p className="text-sm text-muted-foreground">{request.subject.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Ellipsis className="h-4 w-4 text-muted-foreground" />

                            <div>
                                <p className="font-medium">Consecutivo</p>

                                <Badge variant={request.isConsecutive ? "default" : "secondary"}>
                                    {request.isConsecutive ? "Sí" : "No"}
                                </Badge>
                            </div>
                        </div>

                        {request.description && (
                            <div>
                                <p className="font-medium">Descripción</p>
                                <p className="text-sm text-muted-foreground">{request.description}</p>
                            </div>
                        )}

                        {request.comment && (
                            <div>
                                <p className="font-medium">Comentario</p>
                                <p className="text-sm text-muted-foreground">{request.comment}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
