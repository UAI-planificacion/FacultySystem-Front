'use client'

import type { ComponentType, JSX }  from 'react';
import { useMemo }                  from 'react';

import {
    CheckCircle,
    CircleCheckBig,
    CircleX,
    Download,
    HelpCircle,
    TriangleAlert,
    XCircle
}                                   from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

import {
    SessionAvailabilityResult,
	Status
}                       from '@/types/session-availability.model';
import { tempoFormat }  from '@/lib/utils';
import { KEY_QUERYS }   from '@/consts/key-queries';
import { Session }      from '@/types/section.model';


const statusLabels    : Record<Status, string> = {
	Available       : 'Disponible',
	Unavailable     : 'No disponible',
	Probable        : 'Probable'
};


const statusStyles    : Record<Status, string> = {
	Available       : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
	Unavailable     : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
	Probable        : 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700'
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

/**
 * Render a cached view with the availability validation results for sessions.
 */
export default function AssignmentPage(): JSX.Element {
	const queryClient = useQueryClient();

	const { data } = useQuery<SessionAvailabilityResult[]>({
		queryKey                : [ KEY_QUERYS.SESSIONS, 'assignment' ],
		queryFn                 : async () => queryClient.getQueryData<SessionAvailabilityResult[]>( [ KEY_QUERYS.SESSIONS, 'assignment' ] ) ?? [],
		initialData             : () => queryClient.getQueryData<SessionAvailabilityResult[]>( [ KEY_QUERYS.SESSIONS, 'assignment' ] ) ?? [],
		refetchOnMount          : false,
		refetchOnReconnect      : false,
		refetchOnWindowFocus    : false
	});


	const rows  = useMemo(() => data ?? [], [ data ]);
	const assignmentColumnLabel = useMemo(() => {
        const columnName = 'Espacio/Profesor';

        if ( !data || data.length === 0 ) return columnName;

        return data[0] ? Object.keys( data[0] ).includes( 'spaceId' ) ? 'Espacio' : 'Profesor' : columnName;
	}, [ data ]);


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
								<TableHead className = "w-[200px]">Estado</TableHead>
								<TableHead className = "min-w-[240px]">Mensaje</TableHead>
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
										<TableRow key = { session.sessionId }>
											<TableCell className="w-[150px]">{ session.SSEC }</TableCell>

											<TableCell className="w-[180px]">
                                                <SessionName session={ session.session as Session } />
                                            </TableCell>

											<TableCell className="w-[180px]">{ tempoFormat( session.date )}</TableCell>

											<TableCell className="w-[180px]">{ session.module }</TableCell>

											<TableCell className="w-[220px]">{ session.spaceId || session.professor?.name || '-' }</TableCell>

											<TableCell className="w-[180px]">
                                                {(() => {
                                                    const IconComponent = statusIcon[session.status];
                                                    const iconColor     = statusIconColor[session.status];

                                                    return (
                                                        <div className="flex items-center">
                                                            <IconComponent className={`${iconColor} w-4 h-4 mr-2`} />

                                                            <Badge className={`${statusStyles[session.status]} text-white flex items-center`}>
                                                                { statusLabels[ session.status ]}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })()}
											</TableCell>

											<TableCell className="min-w-[240px]">{ session.detalle }</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</ScrollArea>
				</CardContent>

                <CardFooter className="border-t pt-6 flex justify-between gap-4">
                    <Button
                        className   = "gap-2 text-red-500 hover:text-red-600 items-center"
                        variant     = "outline"
                    >
                        <CircleX className="w-4 h-4" />

                        Exportar reporte de errores

                        <Download className="w-4 h-4" />
                    </Button>

                    <div className="flex gap-2">
                        <Button className = "bg-amber-500 hover:bg-amber-600 text-white gap-2">
                        {/* <Button className = "text-amber-500 hover:text-amber-600  gap-2" variant = "outline"> */}
                            Asignar con problemas

                            <TriangleAlert className="w-4 h-4" />
                        </Button>

                        <Button className="bg-green-500 hover:bg-green-600 text-white gap-2">
                            Asignar solo disponibles

                            <CircleCheckBig className="w-4 h-4" />
                        </Button>
                    </div>
                </CardFooter>
			</Card>
		</PageLayout>
	);
}
