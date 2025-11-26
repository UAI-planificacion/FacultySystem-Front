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
import * as XLSX    from 'xlsx';

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
import { ActiveBadge }  from '@/components/shared/active';

import {
    SessionAssignment,
    SectionAssignment,
    Status,
    AssignmentData
}                                       from '@/types/session-availability.model';
import { tempoFormat }                  from '@/lib/utils';
import { KEY_QUERYS }                   from '@/consts/key-queries';
import { Session }                      from '@/types/section.model';
import { fetchApi, Method }             from '@/services/fetch';
import { successToast, errorToast }     from '@/config/toast/toast.config';
import { OfferSession, OfferSection }   from '@/types/offer-section.model';
import { ExcelIcon }                    from '@/icons/ExcelIcon';


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


    const { data = { type: 'space' as const, data: [] } } = useQuery<AssignmentData>({
        queryKey                : [ KEY_QUERYS.SESSIONS, 'assignment', id ],
        queryFn                 : async () => queryClient.getQueryData<AssignmentData>( [ KEY_QUERYS.SESSIONS, 'assignment', id ] ) ?? { type: 'space' as const, data: [] },
        initialData             : () => queryClient.getQueryData<AssignmentData>( [ KEY_QUERYS.SESSIONS, 'assignment', id ] ) ?? { type: 'space' as const, data: [] },
        refetchOnMount          : false,
        refetchOnReconnect      : false,
        refetchOnWindowFocus    : false
    });


    const rows              = useMemo(() => data.data, [ data ]);
    const assignmentType    = useMemo(() => data.type, [ data ]);


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
        if ( !assignmentType || assignmentType === 'registered' ) {
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


    const createSectionAssignments = useCallback(( statuses: Status[] ): SectionAssignment[] => {
        if ( assignmentType !== 'registered' ) {
            return [];
        }

        const sectionMap = new Map<string, number | null>();

        rows.forEach(( session ) => {
            if ( !statuses.includes( session.Estado! ) || !session.SectionId ) {
                return;
            }

            // Solo agregar si no existe en el Map (tomar el primer valor)
            if ( !sectionMap.has( session.SectionId )) {
                sectionMap.set( session.SectionId, session.Inscritos ?? null );
            }
        });

        return Array.from( sectionMap.entries()).map(([ sectionId, registered ]) => ({
            sectionId,
            registered
        }));
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

            queryClient.setQueryData<AssignmentData>( [ KEY_QUERYS.SESSIONS, 'assignment', id ], ( currentData ) => {
                if ( !currentData ) {
                    return currentData;
                }

                const assignedIds = new Set( assignments.map(( assignment ) => assignment.sessionId ));

                return {
                    ...currentData,
                    data : currentData.data.filter(( session ) => !assignedIds.has( session.SesionId ))
                };
            });

            toast( 'Sesiones asignadas correctamente ', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al asignar sesiones: ${mutationError.message}`, errorToast );
        }
    });


    const assignRegisteredMutation = useMutation<OfferSection[], Error, SectionAssignment[]>({
        mutationFn: async ( assignments ) => {
            return fetchApi<OfferSection[]>({
                url     : `${KEY_QUERYS.SESSIONS}/availability/assign-registered`,
                method  : Method.PATCH,
                body    : assignments
            });
        },
        onSuccess: ( updatedSections, assignments ) => {
            // Actualizar AssignmentData local para remover las filas asignadas
            queryClient.setQueryData<AssignmentData>( [ KEY_QUERYS.SESSIONS, 'assignment', id ], ( currentData ) => {
                if ( !currentData ) {
                    return currentData;
                }

                const assignedSectionIds = new Set( assignments.map(( assignment ) => assignment.sectionId ));

                return {
                    ...currentData,
                    data : currentData.data.filter(( session ) => !session.SectionId || !assignedSectionIds.has( session.SectionId ))
                };
            });

            // Invalidar caché de sections
            queryClient.invalidateQueries({ 
                queryKey        : [ KEY_QUERYS.SECTIONS ],
                refetchType     : 'active'
            });

            // Invalidar todas las sessions
            queryClient.invalidateQueries({ 
                queryKey        : [ KEY_QUERYS.SESSIONS ],
                refetchType     : 'active'
            });

            toast( 'Registros asignados correctamente ', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al asignar registros: ${mutationError.message}`, errorToast );
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
        if ( assignmentType !== 'registered' ) {
            const assignments = createAssignments([ 'Available' ]);

            if ( assignments.length === 0 ) {
                toast( 'No hay sesiones disponibles para asignar.', errorToast );
                return;
            }

            assignSessionsMutation.mutate({ assignments, seamlessly : true });

            return;
        }

        // Para tipo registered
        const sectionAssignments = createSectionAssignments([ 'Available' ]);

        if ( sectionAssignments.length === 0 ) {
            toast( 'No hay secciones disponibles para asignar.', errorToast );
            return;
        }

        assignRegisteredMutation.mutate( sectionAssignments );
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
                                
                                { assignmentType === 'registered' ? (
                                    <>
                                        <TableHead className = "w-[180px]">Profesor</TableHead>
                                        <TableHead className = "w-[180px]">Espacio</TableHead>
                                        <TableHead className = "w-[120px]">Registrados</TableHead>
                                        <TableHead className = "w-[150px]">Sillas Disponibles</TableHead>
                                    </>
                                ) : (
                                    <TableHead className = "w-[220px]">
                                        { assignmentType === 'space' ? 'Espacio' : assignmentType === 'professor' ? 'Profesor' : 'Espacio/Profesor' }
                                    </TableHead>
                                )}
                                
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
                                        <TableCell colSpan = { assignmentType === 'registered' ? 10 : 7 } className = "py-6 text-center text-muted-foreground">
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

                                            { assignmentType === 'registered' ? (
                                                <>
                                                    <TableCell className="w-[180px]">{ session.Profesor || '-' }</TableCell>
                                                    <TableCell className="w-[180px]">{ session.Espacio || '-' }</TableCell>
                                                    <TableCell className="w-[120px]">{ session.Inscritos ?? '-' }</TableCell>
                                                    <TableCell className="w-[150px]">{ session.SillasDisponibles ?? '-' }</TableCell>
                                                </>
                                            ) : (
                                                <TableCell className="w-[220px]">
                                                    { assignmentType === 'space' ? ( session.Espacio || '-' ) : ( session.Profesor || '-' )}
                                                </TableCell>
                                            )}

                                            <TableCell className="w-[170px]">
                                                { assignmentType === 'space' ? (
                                                    (() => {
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
                                                    })()
                                                ) : (
                                                    <ActiveBadge
                                                        isActive        = { session.Estado === 'Available' }
                                                        activeText      = { assignmentType === 'professor' ? 'Disponible' : 'Válido' }
                                                        inactiveText    = { assignmentType === 'professor' ? 'No disponible' : 'No válido' }
                                                    />
                                                )}
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
                        { assignmentType === 'space' &&
                            <Button
                                className   = "bg-amber-500 hover:bg-amber-600 text-white gap-2"
                                disabled    = { assignSessionsMutation.isPending || !rows.some(( session ) => session.Estado === 'Probable' ) }
                                onClick     = { handleAssignWithIssues }
                            >
                                Asignar con problemas

                                <TriangleAlert className="w-4 h-4" />
                            </Button>
                        }

                        <Button
                            className   = "bg-green-500 hover:bg-green-600 text-white gap-2"
                            disabled    = { 
                                assignSessionsMutation.isPending || 
                                assignRegisteredMutation.isPending || 
                                !rows.some(( session ) => session.Estado === 'Available' ) 
                            }
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
                onClose     = {() => {
                    setIsUploadDialogOpen( false );
                }}
            />
		</PageLayout>
	);
}
