'use client'

import {
    Edit,
    Trash2,
    User,
    MapPin,
    Users,
    Building2,
} from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
}                           from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
}                   from "@/components/ui/card";
import { Badge }    from "@/components/ui/badge";
import { Button }   from "@/components/ui/button";

import { type RequestDetail } from "@/types/request";


export function RequestDetailCard({
    detail,
    setEditingDetail
}: {
    detail: RequestDetail,
    setEditingDetail: (detail: RequestDetail) => void
}) {
    return (
        <Card className="relative">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">Detalle {detail.id.slice(-8)}</CardTitle>

                    <div className="flex gap-1">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setEditingDetail(detail)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>

                            {/* <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Editar Detalle</DialogTitle>
                                </DialogHeader>

                                <RequestDetailForm
                                    initialData={detail}
                                    onSubmit={(data) => handleUpdateDetail(data as RequestDetail)}
                                    onCancel={() => setEditingDetail(null)}
                                />
                            </DialogContent> */}
                        </Dialog>

                        <Button
                            variant="outline"
                            size="sm"
                            // onClick={() => handleDeleteDetail(detail.id)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {detail.minimum && detail.maximum && (
                        <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>
                                {detail.minimum}-{detail.maximum}
                            </span>
                        </div>
                    )}

                    {detail.spaceType && (
                        <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span>{detail.spaceType}</span>
                        </div>
                    )}

                    {detail.building && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>Edificio {detail.building}</span>
                        </div>
                    )}

                    {detail.spaceSize && (
                        <Badge variant="outline" className="text-xs w-fit">
                            {detail.spaceSize}
                        </Badge>
                    )}
                </div>

                <div className="flex flex-wrap gap-1">
                    <Badge variant={detail.isPriority ? "default" : "secondary"} className="text-xs">
                        {detail.isPriority ? "Prioridad" : "Normal"}
                    </Badge>

                    <Badge variant="outline" className="text-xs">
                        {detail.nivel}
                    </Badge>

                    {detail.inAfternoon && (
                        <Badge variant="outline" className="text-xs">
                            Tarde
                        </Badge>
                    )}
                </div>

                {detail.days.length > 0 && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Días:</p>

                        <div className="flex flex-wrap gap-1 mt-1">
                            {detail.days.map((day, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {day}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {detail.description && (
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Descripción:</p>

                        <p className="text-xs text-muted-foreground mt-1">{detail.description}</p>
                    </div>
                )}

                {detail.professor && (
                    <div className="flex items-center gap-1 text-xs">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{detail.professor.name}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
