'use client'

import { JSX } from "react";

import { Calendar } from "lucide-react"

import { tempoFormat } from "@/lib/utils";


export interface Props {
    date        : Date | string | undefined;
    className?  : string;
    size?       : string;
}


export function ShowDate({
    date,
    className,
    size = "h-4 w-4"
}: Props ): JSX.Element {
    return (
        <div className="flex items-center gap-1.5">
            <Calendar className={size} />

            <span className={className}>{ tempoFormat( date )}</span>
        </div>
    );
}
