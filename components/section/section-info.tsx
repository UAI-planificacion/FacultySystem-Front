'use client'

import { JSX } from "react";

import { Card, CardContent }    from "@/components/ui/card"
import { Badge }                from "@/components/ui/badge";
import { SessionShort }         from "@/components/section/session-short";
import { SectionGroup }         from "@/components/section/types";

import { Section } from "@/types/section.model";


interface Props {
    group?      : SectionGroup | null;
    section?    : Section | null;
    showCode?   : boolean;
}


export function SectionInfo({
    group,
    section,
    showCode = true
}: Props ): JSX.Element {
    return (
        <Card>
            <CardContent className="mt-4">
                <h4 className="font-medium mb-2">Información { group ? 'del ' : 'de la ' } { group ? 'Grupo' : 'Sección' }</h4>

                <div className="grid grid-cols-1 gap-2 text-sm pt-1">
                    { group &&
                        <>
                            <div className="flex items-center gap-2">
                                <span className="font-medium w-20">Sesiones:</span>

                                <SessionShort sessionCounts={ group!.sessionCounts } />
                            </div>

                            <hr className="my-1" />
                        </>
                    }

                    { showCode &&
                        <>
                            <div className="flex items-center gap-2">
                                <span className="font-medium w-20">Número:</span>

                                <Badge>
                                    { section?.code || group?.code }
                                </Badge>
                            </div>

                            <hr className="my-1" />
                        </>
                    }

                    <div className="flex items-center gap-2">
                        <span className="font-medium w-20">Periodo:</span>

                        { section?.period?.name || group?.period }
                    </div>

                    <hr className="my-1" />

                    <div className="flex items-center gap-2">
                        <span className="font-medium w-20">Asignatura:</span>

                        { section?.subject.name || group?.subjectName }
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
