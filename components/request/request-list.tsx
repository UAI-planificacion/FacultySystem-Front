"use client"

import { useState, useMemo } from "react";

import { Card, CardContent }    from "@/components/ui/card";
import { RequestFilter }        from "@/components/request/request-filter";
import { RequestCard }          from "@/components/request/request-card";

import { type Request, Status } from "@/types/request";


interface RequestListProps {
    requests: Request[]
    onViewDetails: (request: Request) => void
}

export default function RequestList({ requests, onViewDetails }: RequestListProps) {
    const [searchId, setSearchId] = useState("")
    const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL")
    const [consecutiveFilter, setConsecutiveFilter] = useState<"ALL" | "TRUE" | "FALSE">("ALL")
    const [sortBy, setSortBy] = useState<"status" | "staffCreate" | "staffUpdate" | "subjectId" | "createdAt">(
        "createdAt",
    )
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    const filteredAndSortedRequests = useMemo(() => {
        const filtered = requests.filter((request) => {
            const matchesId = searchId === "" || request.id.toLowerCase().includes(searchId.toLowerCase())
            const matchesStatus = statusFilter === "ALL" || request.status === statusFilter
            const matchesConsecutive =
                consecutiveFilter === "ALL" ||
                (consecutiveFilter === "TRUE" && request.isConsecutive) ||
                (consecutiveFilter === "FALSE" && !request.isConsecutive)

            return matchesId && matchesStatus && matchesConsecutive
        })

        return filtered.sort(( a, b ) => {
            const [aValue, bValue] = {
                status      : [a.status, b.status],
                staffCreate : [a.staffCreate.name, b.staffCreate.name],
                staffUpdate : [a.staffUpdate?.name || "", b.staffUpdate?.name || ""],
                subjectId   : [a.subject.name, b.subject.name],
                createdAt   : [a.createdAt, b.createdAt],
            }[sortBy];

            if ( aValue < bValue ) return sortOrder === "asc" ? -1 : 1;
            if ( aValue > bValue ) return sortOrder === "asc" ? 1 : -1;

            return 0;
        })
    }, [requests, searchId, statusFilter, consecutiveFilter, sortBy, sortOrder]);

    return (
        <div className="space-y-4">
            {/* Filters */}
            <RequestFilter
                searchId                = { searchId }
                setSearchId             = { setSearchId }
                statusFilter            = { statusFilter }
                setStatusFilter         = { setStatusFilter }
                consecutiveFilter       = { consecutiveFilter }
                setConsecutiveFilter    = { setConsecutiveFilter }
                sortBy                  = { sortBy }
                setSortBy               = { setSortBy }
                sortOrder               = { sortOrder }
                setSortOrder            = { setSortOrder }
            />

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedRequests.map((request) => (
                    <RequestCard
                        request         = { request }
                        key             = { request.id }
                        onViewDetails   = { () => onViewDetails( request )}
                    />
                ))}
            </div>

            {filteredAndSortedRequests.length === 0 && (
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-muted-foreground">No se encontraron solicitudes que coincidan con los filtros.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
