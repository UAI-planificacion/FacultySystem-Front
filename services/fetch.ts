export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export type ErrorApi = {
    ok: boolean;
    error: any;
}

/**
 * Type guard to check if a value is an ErrorApi
 * @param value The value to check
 * @returns boolean indicating if the value is an ErrorApi
 */
export function isErrorApi<T>( value: T | ErrorApi ): value is ErrorApi {
    return (
        value !== null &&
        typeof value === 'object' &&
        'ok' in value &&
        'error' in value
    );
}

export async function fetchApi<T>(
    url     : string,
    method  : Method,
    body?   : object
): Promise<T | ErrorApi> {
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
            return {
                ok: false,
                error: "Error al hacer la petición"
            };
        }

        return await response.json() as T;
    } catch ( error ) {
        return {
            ok: false,
            error: error
        };
    }
}
