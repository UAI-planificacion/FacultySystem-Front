'use client'

import { JSX } from "react"

import { Ban, BrushCleaning, FileSpreadsheet, Pencil, Trash } from "lucide-react"

import { Button }       from "@/components/ui/button"
import { OfferSection } from "@/types/offer-section.model"


interface Props {
    selectedSessions            : Set<string>;
    selectedSections            : Set<string>;
    handleOpenCleanSpaces()     : void;
    handleOpenDeleteSessions()  : void;
    closeOpenSections()         : void;
    setIsEditSection            : ( value: React.SetStateAction<boolean> ) => void;
    setIsFileFormOpen           : ( value: React.SetStateAction<boolean> ) => void;
    handleOpenCleanProfessors() : void;
    sectionsData                : OfferSection[];
    gridCols?                   : string;
    isHidden?                   : boolean;
}


export function SectionMenu({
    selectedSessions,
    selectedSections,
    handleOpenCleanSpaces,
    handleOpenDeleteSessions,
    closeOpenSections,
    setIsEditSection,
    setIsFileFormOpen,
    handleOpenCleanProfessors,
    sectionsData,
    gridCols = 'grid-cols-6',
    isHidden = true
}: Props ): JSX.Element {
    const hidden = isHidden ? 'hidden 2xl:flex' : '';

    return (
        <div className={`grid ${gridCols} gap-2`}>
            <Button
                onClick     = { handleOpenCleanProfessors }
                className   = "gap-2 w-full text-red-500 hover:text-red-600"
                disabled    = { selectedSections.size === 0 }
                variant     = "outline"
                title       = "Limpiar Profesores"
            >
                <BrushCleaning className="w-4 h-4" />

                <span className={`${hidden}`}>Profesores</span>
            </Button>

            <Button
                onClick     = { handleOpenCleanSpaces }
                className   = "gap-2 w-full text-red-500 hover:text-red-600"
                disabled    = { selectedSections.size === 0 }
                variant     = "outline"
                title       = "Limpiar Espacios"
            >
                <BrushCleaning className="w-4 h-4" />

                <span className={`${hidden}`}>Espacios</span>
            </Button>

            <Button
                onClick     = { closeOpenSections }
                className   = "gap-2 w-full"
                title       = "Abrir/Cerrar Secciones"
                disabled    = { selectedSections.size === 0 }
            >
                <Ban className="h-4 w-4 text-red-500" />

                <span className={`${hidden}`}>Abrir/Cerrar ({ selectedSections.size })</span>
            </Button>

            <Button
                onClick     = { handleOpenDeleteSessions }
                className   = "gap-2 w-full"
                disabled    = { selectedSessions.size === 0 }
                variant     = "destructive"
                title       = "Eliminar Secciones"
            >
                <Trash className="w-4 h-4" />

                <span className={`${hidden}`}>Eliminar ({ selectedSessions.size })</span>
            </Button>

            <Button
                onClick     = {() => setIsEditSection( true )}
                className   = "gap-2 w-full"
                disabled    = { selectedSessions.size === 0 }
                title       = "Modificar Sesiones"
            >
                <Pencil className="w-4 h-4" />

                <span className={`${hidden}`}>Modificar ({ selectedSessions.size })</span>
            </Button>

            <Button
                onClick     = {() => setIsFileFormOpen( true )}
                className   = "gap-2 w-full"
                disabled    = { sectionsData.length === 0 }
                variant     = "default"
                title       = "Gestionar archivos de sesiones"
            >
                <FileSpreadsheet className="w-4 h-4" />

                <span className={`${hidden}`}>Archivos</span>
            </Button>
        </div>
    );
}
