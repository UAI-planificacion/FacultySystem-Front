'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                       from "@/components/ui/table"
import {
    sessionColors,
    sessionLabels
}                       from '@/components/section/section.config';
import { ScrollArea }   from "@/components/ui/scroll-area";

import { SectionToCreate } from "@/types/section.model"


interface Props {
    generatedSections: SectionToCreate[];
}


export function SectionTable({
    generatedSections,
}: Props ) {
    return (
        <ScrollArea className="h-[calc(100vh-500px)]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead>Sesión</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {generatedSections.map((section, index) => (
                        <TableRow key={`${section.period}-${section.session}-${index}`}>
                            <TableCell>{section.period}</TableCell>

                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${sessionColors[section.session]}`} />
                                    {sessionLabels[section.session]}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    );
}
