"use client"

import { useState } from "react";

import { Pencil, Trash2, Users, BookOpen, ChevronDown, ChevronUp, Building, BookCopy } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
}                   from "@/components/ui/card";
import { Button }   from "@/components/ui/button";

import { cn }       from "@/lib/utils";
import { Faculty } from "@/types/faculty.model";
import { useRouter } from 'next/navigation';


interface FacultyCardProps {
    faculty     : Faculty;
    onEdit      : ( faculty: Faculty ) => void;
    onDelete    : ( id: string ) => void;
}


export function FacultyCard({
    faculty,
    onEdit,
    onDelete,
}: FacultyCardProps) {
    const router = useRouter();
    const [expanded, setExpanded] = useState(false)

    return (
        <Card className={cn(
            "w-full transition-all duration-300",
            expanded ? "shadow-lg" : "shadow-md"
        )}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Building className="h-5 w-5" /> 
                            {faculty.name}
                        </CardTitle>

                        <CardDescription className="mt-1">
                            {faculty.description || "Sin descripción proporcionada"}
                        </CardDescription>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpanded(!expanded)}
                        aria-label={expanded ? "Contraer detalles" : "Expandir detalles"}
                    >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>

            {expanded && (
                <CardContent className="pb-2 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                            <h4 className="text-sm font-medium flex items-center mb-1">
                                <BookOpen className="h-4 w-4 mr-1 text-primary" />

                                Asignaturas
                            </h4>

                            <p className="text-sm text-muted-foreground">
                                {faculty.totalSubjects || 0} asignaturas
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium flex items-center mb-1">
                                <Users className="h-4 w-4 mr-1 text-primary" />
                                Personal
                            </h4>

                            <p className="text-sm text-muted-foreground">
                                {faculty.totalPersonnel || 0} miembros
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium flex items-center mb-1">
                                <BookCopy className="h-4 w-4 mr-1 text-primary" />
                                Solicitudes
                            </h4>

                            <p className="text-sm text-muted-foreground">
                                {faculty.totalRequests || 0} solicitudes
                            </p>
                        </div>
                    </div>
                </CardContent>
            )}

            <CardFooter className={cn(
                "flex flex-wrap gap-2 pt-4",
                expanded ? "border-t" : ""
            )}>
                <Button 
                    variant     = "outline"
                    size        = "sm"
                    onClick     = {() => router.push(`/faculties/${faculty.id}?tab=requests`)}
                    className   = "flex items-center"
                >
                    <BookCopy className="h-4 w-4 mr-1" />
                    Solicitudes
                </Button>

                <Button 
                    variant   = "outline"
                    size      = "sm"
                    onClick   = {() => router.push(`/faculties/${faculty.id}?tab=personnel`)}
                    className = "flex items-center"
                >
                    <Users className="h-4 w-4 mr-1" />
                    Personal
                </Button>

                <Button 
                    variant   = "outline"
                    size      = "sm"
                    onClick   = {() => router.push(`/faculties/${faculty.id}?tab=subjects`)}
                    className = "flex items-center"
                >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Asignaturas
                </Button>

                <div className="flex gap-2 ml-auto">
                    <Button 
                        variant   = "outline"
                        size      = "sm"
                        onClick   = {() => onEdit( faculty )}
                        className = "flex items-center"
                    >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                    </Button>

                    <Button 
                        variant   = "destructive"
                        size      = "sm"
                        onClick   = {() => onDelete( faculty.id )}
                        className = "flex items-center"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
