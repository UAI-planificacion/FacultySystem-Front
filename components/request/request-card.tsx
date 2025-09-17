'use client'

import { JSX }          from "react";
import { useRouter }    from 'next/navigation';

import {
    Eye,
    User,
    BookOpen,
    CalendarDays,
    Grid2x2
} from "lucide-react";

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
import { ActionButton } from "@/components/shared/action";

import LoaderMini       from "@/icons/LoaderMini";
import { usePeriods }   from "@/hooks/use-periods";
import { type Request } from "@/types/request";


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
        getPeriodName,
        isLoadingPeriods,
        isErrorPeriods
    }               = usePeriods();
    const router    = useRouter();


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
                            { request.offer.id }
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
                                { getPeriodName( request.periodId )}
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
                    {/* <Button
                        size        = "sm"
                        onClick     = { () => router.push( `/sections?subject=${request.subject.id}&period=${request.periodId}` )}
                        className   = "flex items-center"
                        variant     = "outline"
                    >
                        <Grid2x2 className="h-4 w-4" />
                    </Button> */}

                    <ActionButton
                        item        = { request }
                        editItem    = { onEdit }
                        deleteItem  = { onDelete }
                    />

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
