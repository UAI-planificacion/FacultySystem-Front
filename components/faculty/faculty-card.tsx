"use client"

import { useRouter } from 'next/navigation';

import {
    Users,
    BookOpen,
    Building,
    BookCopy,
    CalendarCog
} from "lucide-react";

import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
}                       from "@/components/ui/card";
import { Button }       from "@/components/ui/button";
import { ActionButton } from '@/components/shared/action';

import { Faculty } from "@/types/faculty.model";


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
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {faculty.name}
                    </CardTitle>

                    <CardDescription className="mt-1">
                        {faculty.description || "Sin descripción proporcionada"}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardFooter className="flex gap-2 pt-2 justify-between">
                <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2">
                    <Button 
                        variant   = "outline"
                        size      = "sm"
                        onClick   = {() => router.push( `/faculties/${ faculty.id }?tab=staff` )}
                        className = "flex items-center gap-1.5"
                    >
                        <Users className="h-4 w-4" />

                        { faculty.totalStaff || 0 } Personal
                    </Button>

                    <Button 
                        variant   = "outline"
                        size      = "sm"
                        onClick   = {() => router.push( `/faculties/${ faculty.id }?tab=subjects` )}
                        className = "flex items-center gap-1.5"
                    >
                        <BookOpen className="h-4 w-4" />

                        { faculty.totalSubjects || 0 } Asignaturas
                    </Button>

                    <Button 
                        variant     = "outline"
                        size        = "sm"
                        onClick     = {() => router.push( `/faculties/${ faculty.id }?tab=requests` )}
                        className   = "flex items-center gap-1.5"
                        disabled    = { faculty.totalSubjects === 0 }
                    >
                        <BookCopy className="h-4 w-4" />

                        { faculty.totalRequests || 0 } Solicitudes
                    </Button>

                    <Button 
                        variant     = "outline"
                        size        = "sm"
                        onClick     = {() => router.push( `/faculties/${ faculty.id }?tab=planning-change` )}
                        className   = "flex items-center gap-1.5"
                        disabled    = { faculty.totalSubjects === 0 }
                    >
                        <CalendarCog className="h-4 w-4" />

                        { faculty.totalPlanningChanges || 0 } Cambio P.
                    </Button>
                </div>

                <ActionButton
                    editItem    = { () => onEdit( faculty ) }
                    deleteItem  = { () => onDelete( faculty.id ) }
                    item        = { faculty }
                />
            </CardFooter>
        </Card>
    );
}
