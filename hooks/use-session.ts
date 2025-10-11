'use client'

import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getSession }   from "@/config/better-auth/auth-client";
import { Staff }        from "@/types/staff.model";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";

interface User {
    id              : string;
    name            : string
    emailVerified   : boolean;
    email           : string;
    createdAt       : Date;
    updatedAt       : Date;
    image?          : string | null | undefined | undefined;
}


interface Data {
    id          : string;
    token       : string;
    userId      : string;
    userAgent?  : string | null | undefined | undefined;
}


interface SessionData {
    user        : User | null;
    data        : Data | null;
}


interface UseSessionReturn {
    data        : SessionData | null;
    staff       : Staff | null;
	isLoading	: boolean;
	error		: string | null;
}

/**
 * Custom hook to manage user session state
 * @returns Object containing session data, loading state, and error state
 */
export function useSession(): UseSessionReturn {
	const [session, setSession]		= useState<SessionData | null >( null );
	const [isLoading, setIsLoading]	= useState( true );
	const [error, setError]			= useState<string | null>( null );

	useEffect(() => {
		( async () => {
			try {
				setIsLoading( true );
				setError( null );
				const sessionData = await getSession();
                setIsLoading( false );

				setSession( {
                    user: sessionData?.data?.user || null,
                    data: sessionData?.data?.session || null,
                } );
			} catch ( err ) {
				console.error( 'Error al cargar sesión:', err );
				setError( err instanceof Error ? err.message : 'Error desconocido' );
				setSession( null );
			} finally {
				setIsLoading( false );
			}
		})();
	}, []);

    const {
        data        : staffData,
        isLoading   : isStaffLoading,
        error       : staffError
    } = useQuery({
        queryKey	: [ KEY_QUERYS.STAFF, session?.user?.email ],
        queryFn		: () => fetchApi<Staff>({ url: `staff/${session?.user?.email}` }),
        enabled     : !!session?.user?.email,
		staleTime	: 1000 * 60 * 5,		// 5 minutos - mantener datos frescos
		gcTime		: 1000 * 60 * 10,		// 10 minutos - mantener en caché
		retry		: 2,					// Reintentar 2 veces en caso de error
    });


	return {
        data        : session               || null,
        staff       : staffData             || null,
        isLoading   : isLoading             || isStaffLoading,
        error       : staffError?.message   || null,
	};

}
