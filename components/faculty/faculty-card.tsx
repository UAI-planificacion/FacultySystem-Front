"use client"

import { useRouter } from 'next/navigation';

import {
    Pencil,
    Trash2,
    Users,
    BookOpen,
    Building,
    BookCopy
} from "lucide-react";

import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
}                   from "@/components/ui/card";
import { Button }   from "@/components/ui/button";
import { Faculty }  from "@/types/faculty.model";


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

    return (
        <Card className="w-full transition-all duration-300 shadow-lg">
            <CardHeader className="pb-2">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {faculty.name}
                    </CardTitle>

                    <CardDescription className="mt-1">
                        {faculty.description || "Sin descripción proporcionada"}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardFooter className="flex flex-wrap gap-2 pt-4">
                <Button 
                    variant   = "outline"
                    size      = "sm"
                    onClick   = {() => router.push(`/faculties/${faculty.id}?tab=personnel`)}
                    className = "flex items-center gap-1.5"
                >
                    <Users className="h-4 w-4" />
                    {faculty.totalPersonnel || 0} Personal
                </Button>

                <Button 
                    variant   = "outline"
                    size      = "sm"
                    onClick   = {() => router.push(`/faculties/${faculty.id}?tab=subjects`)}
                    className = "flex items-center gap-1.5"
                >
                    <BookOpen className="h-4 w-4" />
                    {faculty.totalSubjects || 0} Asignaturas
                </Button>

                <Button 
                    variant   = "outline"
                    size      = "sm"
                    onClick   = {() => router.push(`/faculties/${faculty.id}?tab=offers`)}
                    className = "flex items-center gap-1.5"
                >
                    <BookOpen className="h-4 w-4" />
                    {faculty.totalOffers || 0} Ofertas
                </Button>

                <Button 
                    variant     = "outline"
                    size        = "sm"
                    onClick     = {() => router.push(`/faculties/${faculty.id}?tab=requests`)}
                    className   = "flex items-center gap-1.5"
                >
                    <BookCopy className="h-4 w-4" />
                    {faculty.totalRequests || 0} Solicitudes
                </Button>

                <div className="flex gap-2 ml-auto">
                    <Button 
                        variant   = "outline"
                        size      = "sm"
                        onClick   = {() => onEdit( faculty )}
                        className = "flex items-center gap-1"
                    >
                        <Pencil className="h-4 w-4" />

                        <span className="hidden 2xl:flex">Editar</span>
                    </Button>

                    <Button 
                        variant   = "destructive"
                        size      = "sm"
                        onClick   = {() => onDelete( faculty.id )}
                        className = "flex items-center gap-1"
                    >
                        <Trash2 className="h-4 w-4" />

                        <span className="hidden 2xl:flex">Eliminar</span>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
