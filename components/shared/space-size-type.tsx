'use client'

import { JSX } from "react";

import { Badge }            from "@/components/ui/badge";
import { getSpaceType }     from "@/lib/utils";
import { Size, SpaceType }  from "@/types/request-detail.model";


interface Props {
    spaceType?      : SpaceType | undefined | null;
    spaceSizeId?    : Size | undefined | null
}


export function SpaceSizeType({
    spaceSizeId,
    spaceType
} : Props ): JSX.Element {
    return (
        <div className="space-y-1">
            { spaceType && (
                <Badge variant="outline" className="text-xs">
                    { getSpaceType( spaceType )}
                </Badge>
            )}

            { spaceSizeId && (
                <Badge variant="secondary" className="text-xs">
                    { spaceSizeId }
                </Badge>
            )}
        </div>
    );
}
