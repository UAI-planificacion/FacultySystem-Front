'use client'

import { JSX, useMemo }         from "react";
import { useParams, useRouter } from 'next/navigation';

import { useQuery } from "@tanstack/react-query";
import { toast }    from "sonner";

import {
	Card,
	CardContent
}									from "@/components/ui/card";
import { Label }					from "@/components/ui/label";
import { PageLayout }				from "@/components/layout";
import { SessionName }				from "@/components/session/session-name";
import { SessionInfoRequest }		from "@/components/session/session-info-request";
import { PlanningStepperComponent } from "@/components/section/planning/planning-stepper";
import { Badge }                    from "@/components/ui/badge";

import {
    cn,
    getBuildingName,
    getSpaceType,
    tempoFormat
}                       from "@/lib/utils";
import { OfferSection } from "@/types/offer-section.model";
import { Session }	    from "@/types/section.model";
import { fetchApi }	    from "@/services/fetch";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { errorToast }   from "@/config/toast/toast.config";


export default function SectionDetailPage(): JSX.Element {
    const params    = useParams();
    const route     = useRouter();
    const sectionId = params.sectionId as string;

    const {
        data: section,
        isLoading,
        isError
    }   = useQuery({
		queryKey: [ KEY_QUERYS.SECTIONS, sectionId ],
		queryFn : () => fetchApi<OfferSection>({ url: `sections/${sectionId}` }),
	});

    if ( (section?.sessions?.ids?.length ?? 0) > 0 ) {
        toast('Sección ya está planificada', errorToast);
        route.push(`/sections?id=${sectionId}`);
    }

	// Calcular cuántas sesiones de cada tipo necesitamos basado en section
	const sessionRequirements = useMemo(() => {
		if ( !section ) return {};

		const requirements: Partial<Record<Session, number>> = {};

		if ( section.lecture > 0 )          requirements[Session.C] = section.lecture;
		if ( section.tutoringSession > 0 )  requirements[Session.A] = section.tutoringSession;
		if ( section.workshop > 0 )         requirements[Session.T] = section.workshop;
		if ( section.laboratory > 0 )       requirements[Session.L] = section.laboratory;

		return requirements;
	}, [ section ]);


	if ( !section ) return <></>;


    return (
        <PageLayout 
			title   = {`Planificación de sección ${section.subject.id}-${section.code}`}
		>
            <div className="space-y-4">
                {/* Información de la sección */}
                <Card>
                    <CardContent className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>
                                <Label className="text-xs text-muted-foreground">Asignatura</Label>

                                <p className="font-medium">{ section.subject.id } - { section.subject.name }</p>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Período</Label>

                                <p className="font-medium">{ section.period.id } - { section.period.name }</p>
                            </div>

                            { section.professor && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Profesor por Defecto</Label>

                                    <p className="font-medium">{ section.professor.id } - { section.professor.name }</p>
                                </div>
                            )}

                            <div>
                                <Label className="text-xs text-muted-foreground">Sesiones Requeridas</Label>

                                <div className="flex gap-2 mt-1">
                                    {Object.entries( sessionRequirements ).map(([ session, count ]) => (
                                        <SessionName
                                            key     = { session }
                                            session = { session as Session }
                                            count   = { count }
                                            isShort = { true }
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Detalle Espacio por defecto</Label>

                                <div className="flex gap-2 items-center">
                                    { section?.building &&
                                        <span className="font-medium">{ getBuildingName( section.building )}</span>
                                    }
                                    { section?.spaceType &&
                                        <span className="font-medium">{ getSpaceType( section.spaceType )}</span>
                                    }

                                    { section?.spaceSizeId &&
                                        <Badge>
                                            { section.spaceSizeId }
                                        </Badge>
                                    }
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Fechas inicio - fin</Label>

                                <p className="font-medium">{ tempoFormat( section.startDate )} - { tempoFormat( section.endDate )}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className={cn(
                    "grid grid-cols-1 gap-4", section.haveRequest && "xl:grid-cols-2"
                )}>
                    <SessionInfoRequest
                        section = { section }
                        enabled = { !!section }
                    />

                    {/* Componente de planificación por pasos */}
                    <PlanningStepperComponent section={ section } />
                </div>
            </div>
		</PageLayout>
    );
}
