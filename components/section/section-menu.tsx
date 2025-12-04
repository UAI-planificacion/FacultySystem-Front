'use client'

import { JSX } from "react"

import { BrushCleaning, FileSpreadsheet, Pencil, Trash } from "lucide-react"

import { Button }       from "@/components/ui/button"
import { OfferSection } from "@/types/offer-section.model"


interface Props {
    selectedSessions            : Set<string>;
    selectedSections            : Set<string>;
    handleOpenCleanSpaces()     : void;
    handleOpenDeleteSessions()  : void;
    setIsEditSection            : ( value: React.SetStateAction<boolean> ) => void;
    setIsFileFormOpen           : ( value: React.SetStateAction<boolean> ) => void;
    handleOpenCleanProfessors() : void;
    sectionsData                : OfferSection[];
    gridCols?                   : string;
}


export function SectionMenu({
    selectedSessions,
    selectedSections,
    handleOpenCleanSpaces,
    handleOpenDeleteSessions,
    setIsEditSection,
    setIsFileFormOpen,
    handleOpenCleanProfessors,
    sectionsData,
    gridCols = 'grid-cols-5'
}: Props ): JSX.Element {
    return (
        <div className={`grid ${gridCols} gap-2`}>
            <Button
                onClick     = { handleOpenCleanProfessors }
                className   = "gap-2 w-full"
                disabled    = { selectedSections.size === 0 }
                variant     = "outline"
                title       = "Limpiar Profesores"
            >
                <BrushCleaning className="w-4 h-4" />

                <span className="hidden 2xl:flex">Profesores</span>
            </Button>

            <Button
                onClick     = { handleOpenCleanSpaces }
                className   = "gap-2 w-full"
                disabled    = { selectedSections.size === 0 }
                variant     = "outline"
                title       = "Limpiar Espacios"
            >
                <BrushCleaning className="w-4 h-4" />

                <span className="hidden 2xl:flex">Espacios</span>
            </Button>

            <Button
                onClick     = { handleOpenDeleteSessions }
                className   = "gap-2 w-full"
                disabled    = { selectedSessions.size === 0 }
                variant     = "destructive"
            >
                <Trash className="w-4 h-4" />

                <span className="hidden 2xl:flex">Eliminar ({ selectedSessions.size })</span>
            </Button>

            <Button
                onClick     = {() => setIsEditSection( true )}
                className   = "gap-2 w-full"
                disabled    = { selectedSessions.size === 0 }
            >
                <Pencil className="w-4 h-4" />

                <span className="hidden 2xl:flex">Modificar ({ selectedSessions.size })</span>
            </Button>

            <Button
                onClick     = {() => setIsFileFormOpen( true )}
                className   = "gap-2 w-full"
                disabled    = { sectionsData.length === 0 }
                variant     = "default"
                title       = "Gestionar archivos de sesiones"
            >
                <FileSpreadsheet className="w-4 h-4" />

                <span className="hidden 2xl:flex">Archivos</span>
            </Button>
        </div>
    );
}
