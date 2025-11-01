"use client"

import { JSX, useMemo, useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient
}                   from "@tanstack/react-query";
import { toast }    from "sonner";

import { SubjectForm }          from "@/components/subject/subject-form";
import { SubjectFilter }        from "@/components/subject/subject-filter";
import { SubjectTable }         from "@/components/subject/subject-table";
import { DataPagination }       from "@/components/ui/data-pagination";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { OfferSubjectForm }     from "@/components/subject/offer-subject-form";

import { Subject }                  from "@/types/subject.model";
import { KEY_QUERYS }               from "@/consts/key-queries"
import { Method, fetchApi }         from "@/services/fetch"
import { errorToast, successToast } from "@/config/toast/toast.config"
import { usePagination }            from "@/hooks/use-pagination";
import { updateFacultyTotal }       from "@/app/faculties/page";


interface Props {
    facultyId   : string;
    enabled     : boolean;
}


export function SubjectsManagement({
    facultyId,
    enabled
}: Props ): JSX.Element {
    const queryClient                                   = useQueryClient();
    const [isFormOpen, setIsFormOpen]                   = useState( false );
    const [isOfferSubjectOpen, setIsOfferSubjectOpen]   = useState( false );
    const [editingSubject, setEditingSubject]           = useState<Subject | undefined>( undefined );
    const [offeringSubject, setOfferingSubject]         = useState<Subject | undefined>( undefined );
    const [searchQuery, setSearchQuery]                 = useState( '' );
    const [selectedSpaceTypes, setSelectedSpaceTypes]   = useState<string[]>( [] );
    const [selectedSizes, setSelectedSizes]             = useState<string[]>( [] );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [deletingSubjectId, setDeletingSubjectId]     = useState<string | undefined>( undefined );


    const {
        data: subjects,
        isLoading,
        isError
    } = useQuery<Subject[]>({
        queryKey: [KEY_QUERYS.SUBJECTS, facultyId],
        queryFn : () => fetchApi({ url: `subjects/all/${facultyId}` }),
        enabled,
    });


    const filteredSubjects = useMemo(() => {
        if ( !subjects ) return [];

        const searchLower = searchQuery.toLowerCase();

        return subjects.filter(subject => {
            const matchesSearch = subject.id.toLowerCase().includes( searchLower )
                || subject.name.toLowerCase().includes( searchLower );

            const matchesSpaceType = selectedSpaceTypes.length === 0 
                || selectedSpaceTypes.includes('none') && !subject.spaceType
                || (subject.spaceType && selectedSpaceTypes.includes(subject.spaceType));

            const matchesSize = selectedSizes.length === 0 
                || (subject.spaceSizeId && selectedSizes.includes(subject.spaceSizeId));

            return matchesSearch && matchesSpaceType && matchesSize;
        });
    }, [subjects, searchQuery, selectedSpaceTypes, selectedSizes]);

    /**
     * Hook de paginación
     */
    const {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        paginatedData: paginatedSubjects,
        setCurrentPage,
        setItemsPerPage,
        resetToFirstPage
    } = usePagination({
        data: filteredSubjects,
        initialItemsPerPage: 10
    });

    /**
     * Manejadores de filtros
     */
    const handleSearchChange = ( value: string ) => {
        resetToFirstPage();
        setSearchQuery( value );
    };

    const handleSpaceTypeChange = ( value: string | string[] | undefined ) => {
        resetToFirstPage();
        setSelectedSpaceTypes( Array.isArray(value) ? value : value ? [value] : [] );
    };

    const handleSizeChange = ( value: string | string[] | undefined ) => {
        resetToFirstPage();
        setSelectedSizes( Array.isArray(value) ? value : value ? [value] : [] );
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedSpaceTypes([]);
        setSelectedSizes([]);
        resetToFirstPage();
    };


    const deleteSubjectApi = async ( subjectId: string ): Promise<Subject> =>
        fetchApi<Subject>( { url: `subjects/${subjectId}`, method: Method.DELETE } );


    const deleteSubjectMutation = useMutation<Subject, Error, string>({
        mutationFn: deleteSubjectApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SUBJECTS, facultyId] });
            updateFacultyTotal( queryClient, facultyId, false, 'totalSubjects' );
            setIsDeleteDialogOpen( false );
            toast( 'Asignatura eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar asignatura: ${mutationError.message}`, errorToast ),
    });


    const openNewSubjectForm = () => {
        setEditingSubject( undefined );
        setIsFormOpen( true );
    }


    const openEditSubjectForm = ( subject: Subject ) => {
        setEditingSubject( subject );
        setIsFormOpen( true );
    }


    const openOfferSubjectForm = ( subject?: Subject ) => {
        setOfferingSubject( subject );
        setIsOfferSubjectOpen( true );
    }


    const closeOfferSubjectForm = () => {
        setOfferingSubject( undefined );
        setIsOfferSubjectOpen( false );
    }


    function onOpenDeleteSubject( subject: Subject ): void {
        setDeletingSubjectId( subject.id );
        setIsDeleteDialogOpen( true );
    }


    return (
        <div className="space-y-4">
            {/* Filtros */}
            <SubjectFilter
                searchQuery         = { searchQuery }
                selectedSpaceTypes  = { selectedSpaceTypes }
                selectedSizes       = { selectedSizes }
                onSearchChange      = { handleSearchChange }
                onSpaceTypeChange   = { handleSpaceTypeChange }
                onSizeChange        = { handleSizeChange }
                onClearFilters      = { handleClearFilters }
                onNewSubject        = { openNewSubjectForm }
                onOfferSubjects     = { () => openOfferSubjectForm() }
                showOfferButton     = { true }
            />

            {/* Tabla */}
            <SubjectTable
                subjects        = { paginatedSubjects }
                isLoading       = { isLoading }
                isError         = { isError }
                searchQuery     = { searchQuery }
                onEdit          = { openEditSubjectForm }
                onDelete        = { onOpenDeleteSubject }
                onOfferSubject  = { openOfferSubjectForm }
                showFacultyColumn = { false }
            />

            {/* Paginación */}
            <DataPagination
                currentPage             = { currentPage }
                totalPages              = { totalPages }
                totalItems              = { totalItems }
                itemsPerPage            = { itemsPerPage }
                onPageChange            = { setCurrentPage }
                onItemsPerPageChange    = { setItemsPerPage }
            />

            {/* Subject Form Dialog */}
            <SubjectForm
                subject     = { editingSubject }
                facultyId   = { facultyId }
                onClose     = { () => setIsFormOpen( false )}
                isOpen      = { isFormOpen }
            />

            <OfferSubjectForm
                facultyId   = { facultyId }
                subject     = { offeringSubject }
                onClose     = { closeOfferSubjectForm }
                isOpen      = { isOfferSubjectOpen }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => deleteSubjectMutation.mutate( deletingSubjectId! ) }
                name        = { deletingSubjectId! }
                type        = "la Asignatura"
            />
        </div>
    );
}
