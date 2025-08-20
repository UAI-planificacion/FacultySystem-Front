import { useState, useMemo } from "react";

interface UsePaginationProps<T> {
    data: T[];
    initialItemsPerPage?: number;
}

interface UsePaginationReturn<T> {
    currentPage         : number;
    itemsPerPage        : number;
    totalItems          : number;
    totalPages          : number;
    startIndex          : number;
    endIndex            : number;
    paginatedData       : T[];
    setCurrentPage      : ( page: number ) => void;
    setItemsPerPage     : ( itemsPerPage: number ) => void;
    resetToFirstPage    : () => void;
}

export function usePagination<T>({
    data,
    initialItemsPerPage = 10
}: UsePaginationProps<T>): UsePaginationReturn<T> {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

    const paginationData = useMemo(() => {
        const totalItems    = data.length;
        const totalPages    = Math.ceil( totalItems / itemsPerPage );
        
        // Auto-adjust current page if it exceeds total pages
        let adjustedCurrentPage = currentPage;
        if ( totalPages > 0 && currentPage > totalPages ) {
            adjustedCurrentPage = totalPages;
            // Use setTimeout to avoid state update during render
            setTimeout(() => setCurrentPage( totalPages ), 0);
        }
        
        const startIndex    = ( adjustedCurrentPage - 1 ) * itemsPerPage;
        const endIndex      = startIndex + itemsPerPage;
        const paginatedData = data.slice( startIndex, endIndex );

        return {
            totalItems,
            totalPages,
            startIndex,
            endIndex,
            paginatedData,
            adjustedCurrentPage
        };
    }, [data, currentPage, itemsPerPage]);

    function setItemsPerPage( newItemsPerPage: number ): void {
        setItemsPerPageState( newItemsPerPage );
        setCurrentPage( 1 );
    };

    const resetToFirstPage = () => {
        setCurrentPage( 1 );
    };

    return {
        currentPage: paginationData.adjustedCurrentPage,
        itemsPerPage,
        totalItems: paginationData.totalItems,
        totalPages: paginationData.totalPages,
        startIndex: paginationData.startIndex,
        endIndex: paginationData.endIndex,
        paginatedData: paginationData.paginatedData,
        setCurrentPage,
        setItemsPerPage,
        resetToFirstPage
    };
}
