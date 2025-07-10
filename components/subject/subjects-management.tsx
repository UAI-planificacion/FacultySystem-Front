"use client"

import { useMemo, useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient
}                   from "@tanstack/react-query";
import { Plus }     from "lucide-react";
import { toast }    from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                               from "@/components/ui/table";
import {
    SubjectForm,
    SubjectFormValues
}                               from "@/components/subject/subject-form";
import {
    Card,
    CardContent,
    CardHeader
}                               from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                               from "@/components/ui/select";
import { Button }               from "@/components/ui/button";
import { ScrollArea }           from "@/components/ui/scroll-area";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Input }                from "@/components/ui/input";
import { ShowDate }             from "@/components/shared/date";
import { ActionButton }         from "@/components/shared/action";

import {
    CreateSubject,
    Subject,
    UpdateSubject
}                                   from "@/types/subject.model";
import { KEY_QUERYS }               from "@/consts/key-queries"
import { Method, fetchApi }         from "@/services/fetch"
import { errorToast, successToast } from "@/config/toast/toast.config"
import { costCenterData }           from "@/data/cost-center";


interface SubjectsManagementProps {
    facultyId: string;
    enabled: boolean;
}


export function SubjectsManagement({ facultyId, enabled }: SubjectsManagementProps) {
    const queryClient                                   = useQueryClient();
    const [isFormOpen, setIsFormOpen]                   = useState(false)
    const [editingSubject, setEditingSubject]           = useState<Subject | undefined>(undefined)
    const [searchQuery, setSearchQuery]                 = useState('');
    const [selectedCostCenter, setSelectedCostCenter]   = useState<string>('all');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [deletingSubjectId, setDeletingSubjectId]     = useState<string | undefined>( undefined );
    const { data: subjects, isLoading }                 = useQuery<Subject[]>({
        queryKey: [KEY_QUERYS.SUBJECTS, facultyId],
        queryFn: () => fetchApi(`subjects/all/${facultyId}`),
        enabled,
    });


    const filteredSubjects = useMemo(() => {
        if ( !subjects ) return [];

        const searchLower = searchQuery.toLowerCase();

        return subjects.filter(subject => {
            const matchesSearch = 
                subject.id.toLowerCase().includes( searchLower ) ||
                subject.name.toLowerCase().includes( searchLower );

            const matchesCostCenter = 
                selectedCostCenter === 'all' || 
                subject.costCenterId === selectedCostCenter;

            return matchesSearch && matchesCostCenter;
        });
    }, [subjects, searchQuery, selectedCostCenter]);


    const createSubjectApi = async ( newSubject: CreateSubject ): Promise<Subject>  =>
        fetchApi<Subject>( `subjects`, Method.POST, newSubject );


    const updateSubjectApi = async ( updatedSubject: UpdateSubject ): Promise<Subject>  =>
        fetchApi<Subject>( `subjects/${updatedSubject.id}`, Method.PATCH, updatedSubject );


    const deleteSubjectApi = async ( subjectId: string ): Promise<Subject> =>
        fetchApi<Subject>( `subjects/${subjectId}`, Method.DELETE );


    function saveSuject( isCreated: boolean ): void {
        queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SUBJECTS, facultyId] });
        setIsFormOpen( false );
        setEditingSubject( undefined );
        toast( `Asignatura ${isCreated ? 'creada' : 'actualizada'} exitosamente`, successToast );
    }


    const createSubjectMutation = useMutation<Subject, Error, CreateSubject>({
        mutationFn  : createSubjectApi,
        onSuccess   : () => saveSuject( true ),
        onError     : ( mutationError ) => toast(`Error al crear asignatura: ${mutationError.message}`, errorToast ),
    });


    const updateSubjectMutation = useMutation<Subject, Error, UpdateSubject>({
        mutationFn  : updateSubjectApi,
        onSuccess   : () => saveSuject( false ),
        onError     : ( mutationError ) => toast(`Error al actualizar asignatura: ${mutationError.message}`, errorToast ),
    });


    const deleteSubjectMutation = useMutation<Subject, Error, string>({
        mutationFn: deleteSubjectApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SUBJECTS, facultyId] });
            setIsDeleteDialogOpen(false);
            toast('Asignatura eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast(`Error al eliminar asignatura: ${mutationError.message}`, errorToast ),
    });


    const openNewSubjectForm = () => {
        setEditingSubject(undefined)
        setIsFormOpen(true)
    }
    
    const openEditSubjectForm = (subject: Subject) => {
        setEditingSubject(subject)
        setIsFormOpen(true)
    }


    function handleFormSubmit( formData: SubjectFormValues ): void {
        if ( editingSubject ) {
            updateSubjectMutation.mutate({
                ...formData,
            } as UpdateSubject );
        } else {
            createSubjectMutation.mutate({
                ...formData,
                facultyId,
            } as CreateSubject );
        }
    };


    function onOpenDeleteSubject( subject: Subject ): void {
        setDeletingSubjectId( subject.id );
        setIsDeleteDialogOpen( true );
    }


    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <Input
                            type="search"
                            placeholder="Buscar por código o nombre..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full max-w-md"
                        />

                        <Select value={selectedCostCenter} onValueChange={setSelectedCostCenter}>
                            <SelectTrigger className="w-[450px]">
                                <SelectValue placeholder="Filtrar por centro de costos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los centros de costo</SelectItem>
                                {costCenterData.map(cc => (
                                    <SelectItem key={cc.code} value={cc.code}>
                                        {cc.name} ({cc.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={openNewSubjectForm} className="flex items-center">
                        <Plus className="h-4 w-4 mr-1" />
                        Crear Asignatura
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[calc(100vh-355px)]">
                    {
                        isLoading ? (
                            <div className="text-center p-8 text-muted-foreground">
                                Loading subjects...
                            </div>
                        ) : (
                            filteredSubjects.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                {searchQuery || selectedCostCenter !== 'all' 
                                    ? 'No se encontraron asignaturas que coincidan con los filtros.'
                                    : 'No se han agregado asignaturas a esta facultad.'}
                            </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>

                                            <TableHead>Nombre</TableHead>

                                            <TableHead>Fecha Inicio</TableHead>

                                            <TableHead>Fecha Fin</TableHead>

                                            <TableHead className="text-right">Alumnos</TableHead>

                                            <TableHead>Centro de Costo</TableHead>

                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {filteredSubjects.map((subject) => (
                                            <TableRow key={subject.id}>
                                                <TableCell className="font-medium">{subject.id}</TableCell>

                                                <TableCell>{subject.name}</TableCell>

                                                <TableCell><ShowDate date={subject.startDate} /></TableCell>

                                                <TableCell><ShowDate date={subject.endDate} /></TableCell>

                                                <TableCell className="text-right">{subject.students}</TableCell>

                                                <TableCell>{subject.costCenterId}</TableCell>

                                                <TableCell className="text-right">
                                                    <ActionButton
                                                        editItem    = { openEditSubjectForm }
                                                        deleteItem  = { () => onOpenDeleteSubject(subject) }
                                                        item        = { subject }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )
                        )
                    }
                </ScrollArea>
            </CardContent>

            {/* Subject Form Dialog */}
            <SubjectForm
                initialData = { editingSubject }
                onSubmit    = { handleFormSubmit }
                onClose     = { () => setIsFormOpen( false )}
                isOpen      = { isFormOpen }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => deleteSubjectMutation.mutate( deletingSubjectId! ) }
                name        = { deletingSubjectId! }
                type        = "la Asignatura"
            />
        </Card>
    );
}
