'use client'

import { Session } from "@/types/section.model";
import { sessionColors, sessionColorsHover, sessionLabels } from "../section/section.config";
import { Badge } from "../ui/badge";

interface Props {
    session : Session;
}

export function SessionType({ session }: Props ) {
    return (
        <Badge
            className   = {`text-sm font-medium text-white ${sessionColors[session]} ${sessionColorsHover[session]}`}
            title       = { sessionLabels[session] }
        >
            {sessionLabels[session]}
        </Badge>
    );
}