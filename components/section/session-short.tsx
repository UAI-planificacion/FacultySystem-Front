'use client'

import { Session }      from "@/types/section.model";
import { SessionName }  from "@/components/section/session-name";
import { SessionCount } from "@/components/section/types";


interface Props {
    sessionCounts: SessionCount;
    showZero? : boolean
}


export function SessionShort({
    sessionCounts,
    showZero = false
}: Props ) {
    return (
        <div className="flex gap-1 items-center">
            { Object.entries( sessionCounts ).map( ( [ session, count ] ) => {
                if ( showZero || count > 0 ) {
                    return (
                        <SessionName
                            key     = { session }
                            session = { session as Session }
                            isShort = { true }
                            count   = { count }
                        />
                    );
                }
                return null;
            }) }
        </div>
    );
}
