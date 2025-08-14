'use client'

import { JSX, useMemo } from "react";

import {
    Eye,
    User,
    BookOpen,
    Trash,
    Pencil,
    CalendarDays
}                   from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                       from "@/components/ui/card";
import { Button }       from "@/components/ui/button";
import { ShowStatus }   from "@/components/shared/status";
import { ShowDate }     from "@/components/shared/date";
import { Consecutive }  from "@/components/shared/consecutive";

import { type Request } from "@/types/request";
import { Period }       from "@/types/periods.model";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { ENV }          from "@/config/envs/env";
import LoaderMini       from "@/icons/LoaderMini";


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
}: RequestCardProps ): JSX.Element {
    const {
        data        : periods,
        isLoading   : isLoadingPeriods,
        isError     : isErrorPeriods
    } = useQuery<Period[]>({
        queryKey: [KEY_QUERYS.PERIODS],
        queryFn: () => fetchApi({ isApi: false, url: `${ENV.ACADEMIC_SECTION}periods` }),
    });


    const periodName = useMemo(() => {
        const period = periods?.find( item => item.id === request.periodId );

        return period ? `${period.id} - ${period.name}` : '';
    }, [request, periods]);


    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="space-y-1.5">
                    <CardTitle className="text-md font-medium max-w-full">{ request.title }</CardTitle>

                    <p className="text-[11px] text-muted-foreground">{ request.id }</p>

                    <div className="flex items-center gap-2">
                        <ShowStatus status={ request.status } />

                        <Consecutive isConsecutive={ request.isConsecutive } />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />

                        <span className="font-medium max-w-full truncate overflow-hidden whitespace-nowrap">
                            {request.subject.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />

                        <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                            { request.staffCreate.name }
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />

                        { isLoadingPeriods
                            ? <LoaderMini/>
                            : <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                                { periodName }
                            </span>
                        }

                        { isErrorPeriods && (
                            <span className="max-w-full truncate overflow-hidden whitespace-nowrap">
                                Sin Peridodo
                            </span>
                        )}
                    </div>

                    <ShowDate date={ request.createdAt } />
                </div>

                {request.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 truncate">
                        { request.description }
                    </p>
                )}

                <div className="flex items-center gap-2 justify-end">
                    <Button
                        size        = "sm"
                        onClick     = { () => onEdit( request )}
                        className   = "flex items-center gap-1"
                        variant     = "outline"
                    >
                        <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>

                    <Button
                        size        = "sm"
                        onClick     = { () => onDelete( request )}
                        className   = "flex items-center gap-1"
                        variant     = "outline"
                    >
                        <Trash className="h-4 w-4 text-red-500" />
                    </Button>

                    <Button
                        size        = "sm"
                        onClick     = { () => onViewDetails( request )}
                        className   = "flex items-center gap-1"
                        variant     = "secondary"
                    >
                        <Eye className="h-4 w-4" />

                        { request.totalDetails } detalle{ request.totalDetails !== 1 ? "s" : "" }
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
