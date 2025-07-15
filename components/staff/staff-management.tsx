"use client"

import { useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient
}                   from "@tanstack/react-query";
import { Plus }     from "lucide-react";
import { toast }    from "sonner";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}                                       from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
}                                       from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                                       from "@/components/ui/table"
import { StaffForm, StaffFormValues }   from "@/components/staff/staff-form"
import { Button }                       from "@/components/ui/button"
import { ScrollArea }                   from "@/components/ui/scroll-area"
import { RoleBadge }                    from "@/components/shared/role";
import { ActionButton }                 from "@/components/shared/action";
import { ActiveBadge }                  from "@/components/shared/active";
import { Input }                        from "@/components/ui/input";
import { DeleteConfirmDialog }          from "@/components/dialog/DeleteConfirmDialog";

import { CreateStaff, Staff, UpdateStaff }  from "@/types/staff.model";
import { KEY_QUERYS }                       from "@/consts/key-queries";
import { Method, fetchApi }                 from "@/services/fetch";
import { errorToast, successToast }         from "@/config/toast/toast.config";


interface StaffManagementProps {
    facultyId   : string;
    enabled     : boolean;
}


export function StaffManagement({ facultyId, enabled }: StaffManagementProps) {
    const queryClient                                   = useQueryClient();
    const [searchQuery, setSearchQuery]                 = useState('');
    const [roleFilter, setRoleFilter]                   = useState<string>('all');
    const [statusFilter, setStatusFilter]               = useState<string>('all');
    const [isFormOpen, setIsFormOpen]                   = useState(false)
    const [editingStaff, setEditingStaff]               = useState<Staff | undefined>(undefined)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [deletingStaffId, setDeletingStaffId]         = useState<string | undefined>( undefined );
    
    const { data: staffList, isLoading, isError }       = useQuery({
        queryKey    : [ KEY_QUERYS.STAFF, facultyId ],
        queryFn     : () => fetchApi<Staff[]>( { url: `staff/all/${facultyId}` } ),
        enabled
    });


    const filteredStaff = staffList?.filter(staff => {
        const matchesSearch = searchQuery === '' || 
            staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === 'all' || 
            (roleFilter === 'admin' && staff.role === 'ADMIN') ||
            (roleFilter === 'editor' && staff.role === 'EDITOR') ||
            (roleFilter === 'viewer' && staff.role === 'VIEWER');

        let matchesStatus = true;

        if (statusFilter === 'active') {
            matchesStatus = staff.isActive === true;
        } else if (statusFilter === 'inactive') {
            matchesStatus = staff.isActive === false;
        }

        return matchesSearch && matchesRole && matchesStatus;
    }) || [];


    function openNewStaffForm(): void {
        setEditingStaff( undefined );
        setIsFormOpen( true );
    }


    function openEditStaffForm( staff: Staff ): void {
        setEditingStaff( staff );
        setIsFormOpen( true );
    }


    const createStaffApi = async ( newStaff: CreateStaff ): Promise<Staff>  =>
        fetchApi<Staff>( { url: `staff`, method: Method.POST, body: newStaff } );


    const updateStaffApi = async ( updatedStaff: UpdateStaff ): Promise<Staff>  =>
        fetchApi<Staff>( { url: `staff/${updatedStaff.id}`, method: Method.PATCH, body: updatedStaff } );


    const deleteStaffApi = async ( staffId: string ): Promise<Staff> =>
        fetchApi<Staff>( { url: `staff/${staffId}`, method: Method.DELETE } );


    const createStaffMutation = useMutation<Staff, Error, CreateStaff>({
        mutationFn: createStaffApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.STAFF, facultyId] });
            setIsFormOpen(false);
            setEditingStaff(undefined);
            toast('Personal creado exitosamente', successToast );
        },
        onError: (mutationError) => {
            toast(`Error al crear personal: ${mutationError.message}`, errorToast );
        },
    });


    const updateStaffMutation = useMutation<Staff, Error, UpdateStaff>({
        mutationFn: updateStaffApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.STAFF, facultyId] });
            setIsFormOpen(false);
            setEditingStaff(undefined);
            toast('Personal actualizado exitosamente', successToast );
        },
        onError: (mutationError) => {
            toast(`Error al actualizar personal: ${mutationError.message}`, errorToast );
        },
    });


    const deleteStaffMutation = useMutation<Staff, Error, string>({
        mutationFn: deleteStaffApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.STAFF, facultyId] });
            setIsDeleteDialogOpen(false);
            toast('Personal eliminado exitosamente', successToast );
        },
        onError: (mutationError) => {
            toast(`Error al eliminar personal: ${mutationError.message}`, errorToast );
        },
    });


    function handleFormSubmit( formData: StaffFormValues ): void {
        if ( editingStaff ) {
            updateStaffMutation.mutate({
                ...formData,
                id: editingStaff.id
            } as UpdateStaff );
        } else {
            createStaffMutation.mutate({
                ...formData,
                facultyId,
            } as CreateStaff );
        }
    };


    function onOpenDeleteStaff( staff: Staff ) {
        setDeletingStaffId(staff.id);
        setIsDeleteDialogOpen(true);
    }


    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 w-full max-w-4xl">
                            <Input
                                type        = "search"
                                placeholder = "Buscar personal..."
                                value       = {searchQuery}
                                className   = "w-full max-w-md"
                                onChange    = {(e) => setSearchQuery(e.target.value)}
                            />

                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por rol" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Todos los roles</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="viewer">Visualizador</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por estado" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="active">Activos</SelectItem>
                                    <SelectItem value="inactive">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={openNewStaffForm} className="flex items-center">
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar Personal
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[calc(100vh-363px)]">
                    {
                        isLoading ? (
                            <div className="text-center p-8 text-muted-foreground">
                                Cargando personal...
                            </div>
                        ) : (
                            staffList?.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    Aún no se ha asignado personal a esta facultad.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>

                                            <TableHead>Rol</TableHead>

                                            <TableHead>Correo</TableHead>

                                            <TableHead>Activo</TableHead>

                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {filteredStaff.map((staff) => (
                                            <TableRow key={staff.id}>
                                                <TableCell className="font-medium">{staff.name}</TableCell>

                                                <TableCell>
                                                    <RoleBadge role={staff.role} />
                                                </TableCell>

                                                <TableCell>{staff.email}</TableCell>

                                                <TableCell>
                                                    <ActiveBadge isActive={staff.isActive} />
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <ActionButton
                                                        editItem    = { openEditStaffForm }
                                                        deleteItem  = { () => onOpenDeleteStaff(staff) }
                                                        item        = { staff }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredStaff.length === 0 && searchQuery ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    No se encontraron resultados para "{searchQuery}"
                                                </TableCell>
                                            </TableRow>
                                        ) : staffList?.length === 0 && !searchQuery ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    No hay personal registrado
                                                </TableCell>
                                            </TableRow>
                                        ) : null}
                                    </TableBody>
                                </Table>
                            )
                        )
                    }
                </ScrollArea>
            </CardContent>

            {/* Staff Form Dialog */}
            <StaffForm
                initialData = { editingStaff }
                onSubmit    = { handleFormSubmit }
                onClose     = { () => setIsFormOpen( false )}
                isOpen      = { isFormOpen }
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => deleteStaffMutation.mutate( deletingStaffId! ) }
                name        = { deletingStaffId! }
                type        = "el Personal"
            />
        </Card>
    );
}
