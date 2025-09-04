'use client'

import {
    sessionColors,
    sessionLabels
}                   from "@/components/section/section.config";
import { Badge }    from "@/components/ui/badge";
import { Session }  from "@/types/section.model";


interface Props {
    session : Session;
}


export function SessionName({
    session
}:Props ) {
    return (
        <Badge
            variant     = "secondary"
            className   = { sessionColors[session] }
        >
            { sessionLabels[session] }
        </Badge>
    );
}
