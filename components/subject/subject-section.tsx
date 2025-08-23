'use client'

import { JSX } from "react";

import { useQuery } from "@tanstack/react-query";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                       from "@/components/ui/table";
import { Badge }        from "@/components/ui/badge";
import { Skeleton }     from "@/components/ui/skeleton";
import { Card }         from "@/components/ui/card";

import { Subject }      from "@/types/subject.model";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { Section }      from "@/types/section.model";
import { ENV }          from "@/config/envs/env";


interface Props {
    subject: Subject;
    enabled : boolean;
}


export function SubjectSection({
    subject,
    enabled
}: Props ): JSX.Element {
    const {
        data: sections,
        isLoading,
        isError,
    } = useQuery({
        queryKey    : [ KEY_QUERYS.SECCTIONS, subject.id ],
        queryFn     : () => fetchApi<Section[]>({ url: `${ENV.ACADEMIC_SECTION}Sections`, isApi: false }),
        enabled
    });


    if ( isLoading ) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if ( isError ) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Error al cargar las secciones</p>
            </div>
        );
    }

    if ( !sections || sections.length === 0 ) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No hay secciones disponibles</p>
            </div>
        );
    }

    return (
        <Card className="h-[813px] w-[750px] overflow-x-auto overflow-y-auto">
            <Table noWrapper>
                <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                        <TableHead className="w-20">Código</TableHead>
                        <TableHead className="w-24">Sala</TableHead>
                        <TableHead className="w-16">Día</TableHead>
                        <TableHead className="w-24">Módulo</TableHead>
                        <TableHead className="w-96">Período</TableHead>
                        <TableHead className="w-40">Profesor</TableHead>
                        <TableHead className="w-24">Sesión</TableHead>
                        <TableHead className="w-20">Tamaño</TableHead>
                        <TableHead className="w-28">Registrados Corregidos</TableHead>
                        <TableHead className="w-28">Registrados Reales</TableHead>
                        <TableHead className="w-32">Edificio Planificado</TableHead>
                        <TableHead className="w-28">Sillas Disponibles</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {sections.map(( section ) => (
                        <TableRow key={section.id}>
                            <TableCell  className="font-medium">{section.code}</TableCell>

                            <TableCell >{section.room}</TableCell>

                            <TableCell  className="text-center">{section.day}</TableCell>

                            <TableCell >{section.moduleId}</TableCell>

                            <TableCell  className="whitespace-nowrap">
                                {section.period}
                            </TableCell>

                            <TableCell  className="truncate" title={section.professorName}>
                                {section.professorName}
                            </TableCell>

                            <TableCell >{section.session}</TableCell>

                            <TableCell >
                                <Badge variant="outline">
                                    {section.size}
                                </Badge>
                            </TableCell>

                            <TableCell  className="text-center">{section.correctedRegistrants}</TableCell>

                            <TableCell  className="text-center">{section.realRegistrants}</TableCell>

                            <TableCell  className="truncate" title={section.plannedBuilding}>
                                {section.plannedBuilding}
                            </TableCell>

                            <TableCell  className="text-center">{section.chairsAvailable}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
