'use client'

import { JSX, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { RequestForm }          from '@/components/request/request-form';
import { RequestDetailForm }    from '@/components/request-detail/request-detail-form';

import { Request }          from '@/types/request';
import { KEY_QUERYS }       from '@/consts/key-queries';
import { fetchApi }         from '@/services/fetch';
import { RequestDetail }    from '@/types/request-detail.model';


interface NotificationDialogManagerProps {
	children: React.ReactNode | (( props: {
		onRequestClick      : ( requestId: string ) => void;
		onRequestDetailClick: ( requestId: string, detailId: string ) => void;
	}) => React.ReactNode );
}


/**
 * Manager component for handling notification-triggered dialogs
 */
export function NotificationDialogManager({
    children
}: NotificationDialogManagerProps ): JSX.Element {
	const queryClient = useQueryClient();

	const [requestDialog, setRequestDialog] = useState<{
		isOpen      : boolean;
		request     : Request | null;
	}>({
		isOpen      : false,
		request     : null,
	});

	const [requestDetailDialog, setRequestDetailDialog] = useState<{
		isOpen          : boolean;
		requestDetail   : RequestDetail | null;
		requestId       : string;
	}>({
		isOpen          : false,
		requestDetail   : null,
		requestId       : '',
	});


    function handleRequestClick( requestId: string ): void {
		console.log( 'handleRequestClick called with requestId:', requestId );

		// Find request in cache from any faculty
		const allQueries = queryClient.getQueriesData({ queryKey: [KEY_QUERYS.REQUESTS] });
		console.log( 'All queries found:', allQueries );

		let foundRequest: Request | undefined;

		for ( const [, requests] of allQueries ) {
			if ( Array.isArray( requests )) {
				foundRequest = requests.find( r => r.id === requestId );

                if ( foundRequest ) {
					console.log( 'Found request in cache:', foundRequest );
					break;
				}
			}
		}

		if ( foundRequest ) {
			console.log( 'Opening request dialog for:', foundRequest );
			setRequestDialog({
				isOpen      : true,
				request     : foundRequest,
			});
		} else {
			console.log( 'Request not found in cache for ID:', requestId );
			console.log( 'Attempting to fetch request directly...' );

			// If not found in cache, try to fetch the specific request
			fetchApi<Request>({ url: `requests/${requestId}` })
				.then( ( request ) => {
					console.log( 'Fetched request directly:', request );
					setRequestDialog({
						isOpen      : true,
						request     : request,
					});
				})
				.catch( ( error ) => {
					console.error( 'Error fetching request:', error );
				});
		}
	};


    function handleRequestDetailClick( requestId: string, detailId: string ): void {
		console.log( 'handleRequestDetailClick called with requestId:', requestId, 'detailId:', detailId );

		// First check if request details are in cache
		const cachedRequestDetails = queryClient.getQueryData<RequestDetail[]>([KEY_QUERYS.REQUEST_DETAIL, requestId]);
		console.log( 'Request details found in cache:', cachedRequestDetails );

		if ( cachedRequestDetails ) {
			// If in cache, find the specific detail
			const requestDetail = cachedRequestDetails.find( rd => rd.id === detailId );
			console.log( 'Found request detail in cache:', requestDetail );

			if ( requestDetail ) {
				console.log( 'Opening request detail dialog for:', requestDetail );
				setRequestDetailDialog({
					isOpen          : true,
					requestDetail   : requestDetail,
					requestId,
				});
				return;
			}
		}

		// If not in cache, fetch the request details
		console.log( 'Request details not in cache, fetching...' );
		queryClient.fetchQuery({
			queryKey    : [KEY_QUERYS.REQUEST_DETAIL, requestId],
			queryFn     : () => fetchApi<RequestDetail[]>({ url: `request-details/request/${requestId}` }),
		}).then( ( requestDetails ) => {
			console.log( 'Fetched request details:', requestDetails );
			const requestDetail = requestDetails?.find( rd => rd.id === detailId );
			console.log( 'Found request detail after fetch:', requestDetail );

			if ( requestDetail ) {
				console.log( 'Opening request detail dialog after fetch:', requestDetail );
				setRequestDetailDialog({
					isOpen          : true,
					requestDetail   : requestDetail,
					requestId,
				});
			} else {
				console.log( 'Request detail not found after fetch for detailId:', detailId );
			}
		}).catch( ( error ) => {
			console.error( 'Error fetching request details:', error );
		});
	};

	// const handleRequestSubmit = ( data: any ): void => {
	// 	// Handle request form submission
	// 	console.log( 'Request form submitted:', data );
	// 	setRequestDialog( prev => ({ ...prev, isOpen: false }));
	// };

	// const handleRequestDetailSubmit = ( data: any ): void => {
	// 	// Handle request detail form submission
	// 	console.log( 'Request detail form submitted:', data );
	// 	setRequestDetailDialog( prev => ({ ...prev, isOpen: false }));
	// };

	return (
		<>
			{/* Pass handlers to children (Notifications component) */}
			{typeof children === 'function' 
				? children({ 
					onRequestClick      : handleRequestClick, 
					onRequestDetailClick: handleRequestDetailClick 
				})
				: children
			}

			{/* Request Dialog */}
			{requestDialog.request && (
				<RequestForm
					isOpen      = { requestDialog.isOpen }
					onClose     = { () => setRequestDialog( prev => ({ ...prev, isOpen: false }))}
					request     = { requestDialog.request }
					facultyId   = { requestDialog.request.facultyId }
				/>
			)}

			{/* Request Detail Dialog */}
			{requestDetailDialog.requestDetail && (
				<RequestDetailForm
					isOpen              = { requestDetailDialog.isOpen }
					onClose             = {() => setRequestDetailDialog( prev => ({ ...prev, isOpen: false }))}
					onCancel            = {() => setRequestDetailDialog( prev => ({ ...prev, isOpen: false }))}
					requestDetail       = { requestDetailDialog.requestDetail }
                    requestId           = { requestDetailDialog.requestDetail.requestId }
				/>
			)}
		</>
	);
}
