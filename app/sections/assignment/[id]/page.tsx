'use client'

import type { ComponentType, JSX }          from 'react';
import { useMemo, useCallback, useState }   from 'react';
import { useParams }                        from 'next/navigation';

import {
    CheckCircle,
    CircleCheckBig,
    CircleX,
    Download,
    HelpCircle,
    TriangleAlert,
    XCircle
}                   from 'lucide-react';
import {
    useMutation,
    useQuery,
    useQueryClient
}                   from '@tanstack/react-query';
import { toast }    from 'sonner';

import {
    Card,
    CardContent,
    CardFooter
}                       from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                       from '@/components/ui/table';
import { Badge }        from '@/components/ui/badge';
import { PageLayout }   from '@/components/layout/page-layout';
import { ScrollArea }   from '@/components/ui/scroll-area';
import { Button }       from '@/components/ui/button';
import { SessionName }  from '@/components/session/session-name';
import { FileForm }     from '@/components/section/file-form';

import {
    SessionAvailabilityResult,
    SessionAssignment,
    Status
}                                   from '@/types/session-availability.model';
import { tempoFormat }              from '@/lib/utils';
import { KEY_QUERYS }               from '@/consts/key-queries';
import { Session }                  from '@/types/section.model';
import { fetchApi, Method }         from '@/services/fetch';
import { successToast, errorToast } from '@/config/toast/toast.config';
import { OfferSession }             from '@/types/offer-section.model';
import * as XLSX                    from 'xlsx';
import { ExcelIcon }                from '@/icons/ExcelIcon';


const statusLabels: Record<Status, string> = {
    Available   : 'Disponible',
    Unavailable : 'No disponible',
    Probable    : 'Probable'
};


const statusStyles: Record<Status, string> = {
    Available   : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
    Unavailable : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
    Probable    : 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700'
};


const statusIcon: Record<Status, ComponentType<{ className?: string }>> = {  
    Available   : CheckCircle,  
    Unavailable : XCircle,  
    Probable    : HelpCircle  
};


const statusIconColor : Record<Status, string> = {
    Available   : 'text-green-500 dark:text-green-600',
    Unavailable : 'text-red-500 dark:text-red-600',
    Probable    : 'text-amber-500 dark:text-amber-600'
};


export default function AssignmentPage(): JSX.Element {
    const queryClient   = useQueryClient();
    const params        = useParams();
    const id            = params.id as string;

    const [ isUploadDialogOpen, setIsUploadDialogOpen ] = useState<boolean>( false );


    const { data } = useQuery<SessionAvailabilityResult[]>({
        queryKey                : [ KEY_QUERYS.SESSIONS, 'assignment', id ],
        queryFn                 : async () => queryClient.getQueryData<SessionAvailabilityResult[]>( [ KEY_QUERYS.SESSIONS, 'assignment', id ] ) ?? [],
        initialData             : () => queryClient.getQueryData<SessionAvailabilityResult[]>( [ KEY_QUERYS.SESSIONS, 'assignment', id ] ) ?? [],
        refetchOnMount          : false,
        refetchOnReconnect      : false,
        refetchOnWindowFocus    : false
    });


    const rows = useMemo(() => data ?? [], [ data ]);


    const assignmentColumnLabel = useMemo(() => {
        const columnName = 'Espacio/Profesor';

        if ( !data || data.length === 0 ) return columnName;

        return data[0] 
            ? Object.keys( data[0] ).includes( 'spaceId' )
                ? 'Espacio'
                : 'Profesor'
            : columnName;
    }, [ data ]);


    const assignmentType = useMemo<'space' | 'professor' | null>(() => {
        if ( rows.length === 0 ) return null;

        if ( rows.some(( session ) => session.Espacio && session.Espacio.trim() !== '' )) {
            return 'space';
        }

        if ( rows.some(( session ) => session.Profesor && session.Profesor.trim() !== '' )) {
            return 'professor';
        }

        return null;
    }, [ rows ]);


    const updateSessionsCache = useCallback(( updatedSessions: OfferSession[] ) => {
        if ( updatedSessions.length === 0 ) {
            return;
        }

        const groupedSessions = updatedSessions.reduce<Map<string, OfferSession[]>>(( accumulator, session ) => {
            const sectionId = session.section.id;

            if ( !accumulator.has( sectionId )) {
                accumulator.set( sectionId, [] );
            }

            accumulator.get( sectionId )?.push( session );

            return accumulator;
        }, new Map<string, OfferSession[]>());

        groupedSessions.forEach(( sessions, sectionId ) => {
            queryClient.setQueryData<OfferSession[]>( [ KEY_QUERYS.SESSIONS, sectionId ], ( cachedSessions ) => {
                if ( !cachedSessions ) {
                    return cachedSessions;
                }

                const updates = new Map<string, OfferSession>( sessions.map(( session ) => [ session.id, session ] ));

                return cachedSessions.map(( session ) => updates.get( session.id ) ?? session );
            });
        });
    }, [ queryClient ]);


    const createAssignments = useCallback(( statuses: Status[] ): SessionAssignment[] => {
        if ( !assignmentType ) {
            return [];
        }

        return rows.reduce<SessionAssignment[]>(( accumulator, session ) => {
            if ( !statuses.includes( session.Estado! )) {
                return accumulator;
            }

            if ( assignmentType === 'space' && session.Espacio ) {
                accumulator.push({
                    sessionId   : session.SesionId,
                    spaceId     : session.Espacio
                });
                return accumulator;
            }

            if ( assignmentType === 'professor' && session.Profesor ) {
                accumulator.push({
                    sessionId      : session.SesionId,
                    professorId    : session.Profesor
                });
            }

            return accumulator;
        }, [] );
    }, [ assignmentType, rows ]);


    const assignSessionsMutation = useMutation<OfferSession[], Error, { assignments: SessionAssignment[]; seamlessly: boolean }>({
        mutationFn: async ({ assignments, seamlessly }) => {
            const queryParam = seamlessly ? '' : '?seamlessly=false';

            return fetchApi<OfferSession[]>({
                url     : `${KEY_QUERYS.SESSIONS}/availability/assign${ queryParam }`,
                method  : Method.PATCH,
                body    : assignments
            });
        },
        onSuccess: ( updatedSessions, { assignments }) => {
            updateSessionsCache( updatedSessions );

            queryClient.setQueryData<SessionAvailabilityResult[]>( [ KEY_QUERYS.SESSIONS, 'assignment', id ], ( currentData ) => {
                if ( !currentData ) {
                    return currentData;
                }

                const assignedIds = new Set( assignments.map(( assignment ) => assignment.sessionId ));

                return currentData.filter(( session ) => !assignedIds.has( session.SesionId ));
            });

            toast( 'Sesiones asignadas correctamente ', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al asignar sesiones: ${mutationError.message}`, errorToast );
        }
    });


    const handleExportErrors = (): void => {
        // const unavailableSessions = rows.filter(( session ) => session.status === 'Unavailable' );

        // if ( unavailableSessions.length === 0 ) {
        //     toast( 'No hay sesiones con errores para exportar.', errorToast );
        //     return;
        // }

        const worksheet = XLSX.utils.json_to_sheet( rows );
        const workbook  = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet( workbook, worksheet, 'Sesiones' );
        XLSX.writeFile( workbook, 'reporte_errores_sesiones.xlsx' );
        toast( 'Reporte exportado correctamente ', successToast );
    };


    const handleAssignOnlyAvailable = (): void => {
        const assignments = createAssignments([ 'Available' ]);

        if ( assignments.length === 0 ) {
            toast( 'No hay sesiones disponibles para asignar.', errorToast );
            return;
        }

        assignSessionsMutation.mutate({ assignments, seamlessly : true });
    };


    const handleAssignWithIssues = (): void => {
        const assignments = createAssignments([ 'Available', 'Probable' ]);

        if ( assignments.length === 0 ) {
            toast( 'No hay sesiones disponibles o probables para asignar.', errorToast );
            return;
        }

        assignSessionsMutation.mutate({ assignments, seamlessly : false });
    };


    return (
        <PageLayout title = "Validación de Sesiones">
            <Card>
                <CardContent className = "p-0">
                    <Table>
                        <TableHeader className = "sticky top-0 z-10 bg-background">
                            <TableRow>
                                <TableHead className = "w-[150px]">SSEC</TableHead>
                                <TableHead className = "w-[180px]">Sesión</TableHead>
                                <TableHead className = "w-[180px]">Fecha</TableHead>
                                <TableHead className = "w-[180px]">Módulo</TableHead>
                                <TableHead className = "w-[220px]">{ assignmentColumnLabel }</TableHead>
                                <TableHead className = "w-[170px]">Estado</TableHead>
                                <TableHead className = "w-[320px]">Mensaje</TableHead>
                            </TableRow>
                        </TableHeader>
                    </Table>

                    <ScrollArea className = "h-[calc(100vh-350px)]">
                        <Table>
                            <TableBody>
                                { rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan = { 7 } className = "py-6 text-center text-muted-foreground">
                                            No hay resultados. Sube un archivo para ver la validación.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map(( session ) => (
                                        <TableRow key = { session.SesionId }>
                                            <TableCell className="w-[150px]">{ session.SSEC }</TableCell>

                                            <TableCell className="w-[180px]">
                                                <SessionName session={ session.TipoSesion as Session } />
                                            </TableCell>

                                            <TableCell className="w-[180px]">{ tempoFormat( session.Fecha )}</TableCell>

                                            <TableCell className="w-[180px]">{ session.Modulo }</TableCell>

                                            <TableCell className="w-[220px]">{ session.Espacio || session.Profesor || '-' }</TableCell>

                                            <TableCell className="w-[170px]">
                                                {(() => {
                                                    const IconComponent = statusIcon[session.Estado!];
                                                    const iconColor     = statusIconColor[session.Estado!];

                                                    return (
                                                        <div className="flex items-center">
                                                            <IconComponent className={`${iconColor} w-4 h-4 mr-2`} />

                                                            <Badge className={`${statusStyles[session.Estado!]} text-white flex items-center`}>
                                                                { statusLabels[ session.Estado! ]}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })()}
                                            </TableCell>

                                            <TableCell className="w-[320px]">{ session.Detalle }</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="border-t pt-6 flex justify-between gap-4">
                    <div className="flex gap-2">
                        <Button
                            className   = "gap-2 text-red-500 hover:text-red-600 items-center"
                            variant     = "outline"
                            disabled    = { !rows.some(( session ) => session.Estado === 'Unavailable' ) }
                            onClick     = { handleExportErrors }
                        >
                            <CircleX className="w-4 h-4" />

                            Exportar reporte de errores

                            <Download className="w-4 h-4" />
                        </Button>

                        <Button
                            className   = "gap-2"
                            onClick     = {() => setIsUploadDialogOpen( true )}
                            variant     = "outline"
                        >
                            <ExcelIcon />

                            Gestionar archivos
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className   = "bg-amber-500 hover:bg-amber-600 text-white gap-2"
                            disabled    = { assignSessionsMutation.isPending || !rows.some(( session ) => session.Estado === 'Probable' ) }
                            onClick     = { handleAssignWithIssues }
                        >
                            Asignar con problemas

                            <TriangleAlert className="w-4 h-4" />
                        </Button>

                        <Button
                            className   = "bg-green-500 hover:bg-green-600 text-white gap-2"
                            disabled    = { assignSessionsMutation.isPending || !rows.some(( session ) => session.Estado === 'Available' ) }
                            onClick     = { handleAssignOnlyAvailable }
                        >
                            Asignar solo disponibles

                            <CircleCheckBig className="w-4 h-4" />
                        </Button>
                    </div>
                </CardFooter>
			</Card>

            <FileForm
                isOpen      = { isUploadDialogOpen }
                isRouting   = { false }
                onClose     = {() => {
                    setIsUploadDialogOpen( false );
                    queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.SESSIONS, 'assignment', id ] });
                }}
            />
		</PageLayout>
	);
}
