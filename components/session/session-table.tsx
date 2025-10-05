'use client'

import { OfferSection, OfferSession } from "@/types/offer-section.model";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { SessionName } from "./session-name";
import { ActionButton } from "../shared/action";
import { tempoFormat } from "@/lib/utils";
import { SessionForm } from "./session-form";
import { useState } from "react";


interface Props {
    section: OfferSection;
    selectedSessions: Set<string>;
    handleSessionSelection: ( sessionId: string, sectionId: string ) => void;
}

// ***********TODO: VERIFICAR LOS USESATES **************

export function SessionTable({
    section,
    selectedSessions,
    handleSessionSelection
}: Props) {
	const [ isEditSection, setIsEditSection ]               = useState<boolean>( false );
	const [ selectedSessionEdit, setSelectedSesionEdit ]   = useState<OfferSession | null>( null );
	const [ selectedSectionEdit, setSelectedSectionEdit ]   = useState<OfferSection | null>( null );


    return (
        <>
        <TableRow>
        <TableCell colSpan={10} className="p-0">
            <div className="border-l-4 ml-16">
                <Table>
                    <TableHeader>
                        <TableRow className="">
                            <TableHead className="w-10">Seleccionar</TableHead>
                            <TableHead className="pl-12">Sesión</TableHead>
                            <TableHead>Sala</TableHead>
                            <TableHead>Profesor</TableHead>
                            {/* <TableHead>Día</TableHead> */}
                            <TableHead>Módulo</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {section.sessions.map(( session ) => (
                            <TableRow key={session.id} className="border-l-4 border-transparent">
                                <TableCell className="w-10">
                                    <Checkbox
                                        checked         = { selectedSessions.has( session.id ) }
                                        onCheckedChange = {() => handleSessionSelection( session.id, section.id )}
                                        aria-label      = "Seleccionar sesión"
                                        className       = "w-5 h-5"
                                        disabled        = { section.isClosed }
                                    />
                                </TableCell>

                                <TableCell className="pl-12">
                                    <SessionName session={ session.name } />
                                </TableCell>

                                <TableCell>{ session.spaceId ?? '-' }</TableCell>

                                <TableCell title={ `${session.professor?.id} - ${session.professor?.name}` }>
                                    { session.professor?.name ?? '-' }
                                </TableCell>

                                {/* <TableCell>{ dayName[session.dayId - 1] ?? '-' }</TableCell> */}

                                <TableCell 
                                // title={ session.module.name }
                                >
                                    { session.module.name }
                                    {/* { `M${ session.module.code } ${ session.module.diference ? `-${session.module.diference}` : '' }` } */}
                                </TableCell>

                                <TableCell>{ session.date ? tempoFormat( session.date ) : '-' }</TableCell>

                                <TableCell className="text-right">
                                    <ActionButton
                                        editItem            = {() => {
                                            setSelectedSesionEdit( session )
                                            console.log('🚀 ~ file: offer-section-table.tsx:457 ~ session:', session)
                                            setIsEditSection( true );
                                            setSelectedSectionEdit( section );
                                        }}
                                        deleteItem          = {() => {}}
                                        item                = { session }
                                        isDisabledEdit      = { section.isClosed }
                                        isDisabledDelete    = { section.isClosed }
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TableCell>
    </TableRow>

    <SessionForm
        isOpen  = { isEditSection }
        onClose = { () => setIsEditSection( false )}
        session = { selectedSessionEdit }
        section = { selectedSectionEdit }
        onSave  = { () => setIsEditSection( false )}
        />
    </>

    )
}