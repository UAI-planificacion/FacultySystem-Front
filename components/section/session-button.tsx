'use client'

import { Minus, Plus } from 'lucide-react';

import {
    sessionColors,
    sessionLabels
}                   from '@/components/section/section.config';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';

import { Session, SectionData } from '@/types/section.model';


interface Props {
    session             : Session,
    updateSessionCount  : ( sectionId: string, session: Session, delta: number ) => void,
    setSessionCount     : ( sectionId: string, session: Session, value: string ) => void;
    section             : SectionData;
}


export function SessionButton({
    session,
    updateSessionCount,
    setSessionCount,
    section
}: Props ) {
    return (
        <div key={session} className="space-y-2 ">
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${sessionColors[session]}`} />

                <Label className="text-sm">{sessionLabels[session]}</Label>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant     = "outline"
                    size        = "sm"
                    onClick     = {() => updateSessionCount(section.id, session, -1)}
                    disabled    = {section.sessionCounts[session] === 0}
                    className   = "h-8 w-8 p-0"
                >
                    <Minus className="h-3 w-3" />
                </Button>

                <Input
                    type        = "number"
                    value       = {section.sessionCounts[session]}
                    onChange    = {(e) => setSessionCount(section.id, session, e.target.value)}
                    className   = "text-center h-8 w-16"
                    min         = "0"
                />

                <Button
                    variant     = "outline"
                    size        = "sm"
                    onClick     = {() => updateSessionCount(section.id, session, 1)}
                    className   = "h-8 w-8 p-0"
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}
