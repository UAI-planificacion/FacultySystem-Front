import { ENV } from "@/config/envs/env";

export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface ErrorApi {
    ok: false;
    error: string | object;
}

export function isErrorApi<T>( value: T | ErrorApi ): value is ErrorApi {
    return (
        value !== null &&
        typeof value === 'object' &&
        'ok' in value &&
        value.ok === false
    );
}

export async function fetchApi<T>(
    url     : string,
    method  : Method,
    body?   : object
): Promise<T> {
    const bodyRequest = method !== 'GET' ? body : undefined;

    try {
        const response = await fetch( url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( bodyRequest ),
        } );

        if ( !response.ok ) {
            const errorBody = await response.json();

            throw new Error(errorBody.message || `API error: ${response.status} ${response.statusText}`);
        }

        return await response.json() as T;
    } catch ( error ) {
        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Network or unexpected error occurred.');
    }
}


export async function fetchData<T>( endpoint: string ): Promise<T> {
    const API_URL   = `${ENV.REQUEST_BACK_URL}${endpoint}`;
    const response  = await fetch( API_URL );

    return response.json();
}
