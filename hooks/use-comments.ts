'use client'

import { useState, useEffect } from "react";

import { toast } from "sonner";

import { Comment } from "@/types/comment.model";


interface UseCommentsReturn {
	comments            : Comment[];
	isLoading           : boolean;
	isCreating          : boolean;
	isError             : boolean;
	error               : string | null;
	handleAddComment    : ( content: string ) => void;
	handleEditComment   : ( commentId: string, content: string ) => void;
	handleDeleteComment : ( commentId: string ) => void;
	retryLoadComments   : () => void;
}


/**
 * Custom hook to manage comments for a request or request detail
 * @param requestId - The ID of the request
 * @param requestDetailId - Optional ID of the request detail
 * @returns Object containing comments data and management functions
 */
export function useComments( requestId: string, requestDetailId?: string ): UseCommentsReturn {
	const [comments, setComments]       = useState<Comment[]>( [] );
	const [isLoading, setIsLoading]     = useState( true );
	const [isCreating, setIsCreating]   = useState( false );
	const [isError, setIsError]         = useState( false );
	const [error, setError]             = useState<string | null>( null );


	// Mock comments data for testing
	const mockComments: Comment[] = [
		{
			id              : "1",
			content         : "Este es un comentario de prueba del staff.",
			parentCommentId : null,
			request         : {
				id      : "req1",
				name    : "Solicitud de Prueba"
			},
			requestDetail   : null,
			staff           : {
				id      : "staff1",
				name    : "Juan Pérez",
				email   : "kevin.candia@uai.cl"
			},
			adminName       : null,
			adminEmail      : null,
			createdAt       : new Date( "2024-01-15T10:30:00" ),
			updatedAt       : new Date( "2024-01-15T10:30:00" )
		},
		{
			id              : "2",
			content         : "Comentario del administrador del sistema.",
			parentCommentId : null,
			request         : {
				id              : "req1",
				name            : "Solicitud de Prueba"
			},
			requestDetail   : null,
			staff           : null,
			adminName       : "Admin Principal",
			adminEmail      : "admin@example.com",
			createdAt       : new Date( "2024-01-15T11:00:00" ),
			updatedAt       : new Date( "2024-01-15T11:00:00" )
		},
		{
			id              : "3",
			content         : "Otro comentario de prueba para verificar la funcionalidad.",
			parentCommentId : null,
			request         : {
				id      : "req1",
				name    : "Solicitud de Prueba"
			},
			requestDetail   : null,
			staff           : {
				id      : "staff2",
				name    : "María García",
				email   : "maria@example.com"
			},
			adminName       : null,
			adminEmail      : null,
			createdAt       : new Date( "2024-01-15T12:00:00" ),
			updatedAt       : new Date( "2024-01-15T12:00:00" )
		},
		{
			id              : "4",
			content         : "Comentario editable del usuario de prueba.",
			parentCommentId : null,
			request         : {
				id      : "req1",
				name    : "Solicitud de Prueba"
			},
			requestDetail   : null,
			staff           : {
				id      : "staff3",
				name    : "Usuario de Prueba",
				email   : "test@example.com"
			},
			adminName       : null,
			adminEmail      : null,
			createdAt       : new Date( "2024-01-15T13:00:00" ),
			updatedAt       : new Date( "2024-01-15T13:00:00" )
		},
		{
			id              : "5",
			content         : "Comentario del admin que también se puede editar.",
			parentCommentId : null,
			request         : {
				id      : "req1",
				name    : "Solicitud de Prueba"
			},
			requestDetail   : null,
			staff           : null,
			adminName       : "Admin de Prueba",
			adminEmail      : "admin@example.com",
			createdAt       : new Date( "2024-01-15T14:00:00" ),
			updatedAt       : new Date( "2024-01-15T14:00:00" )
		}
	];


	/**
	 * Load comments for the given request
	 */
	const loadComments = async () => {
		try {
			setIsLoading( true );
			setIsError( false );
			setError( null );
			
			// Simulate API call delay
			await new Promise( resolve => setTimeout( resolve, 1000 ) );
			
			// Simulate random error for testing (remove in production)
			if ( Math.random() < 0.3 ) {
				throw new Error( 'Error simulado de red' );
			}
			
			// Filter comments by requestId if needed (for now, return all mock comments)
			setComments( mockComments );
			
		} catch ( error ) {
			console.error( 'Error loading comments:', error );
			setIsError( true );
			setError( error instanceof Error ? error.message : 'Error desconocido al cargar comentarios' );
			toast.error( 'Error al cargar los comentarios' );
		} finally {
			setIsLoading( false );
		}
	};


	/**
	 * Retry loading comments
	 */
	const retryLoadComments = () => {
		if ( requestId ) {
			loadComments();
		}
	};


	/**
	 * Load comments on mount and when dependencies change
	 */
	useEffect(() => {
		if ( requestId ) {
			loadComments();
		}
	}, [requestId, requestDetailId]);


	/**
	 * Add a new comment
	 */
	const handleAddComment = async ( content: string ) => {
		try {
			setIsCreating( true );

			await new Promise( resolve => setTimeout( resolve, 1500 ) );

			const newComment: Comment = {
				id              : `new-${Date.now()}`,
				content         : content,
				parentCommentId : null,
				request         : {
					id      : requestId,
					name    : "Solicitud Actual"
				},
				requestDetail   : requestDetailId ? {
					id      : requestDetailId
				} : null,
				staff           : {
					id      : "current-user",
					name    : "Usuario Actual",
					email   : "test@example.com"
				},
				adminName       : null,
				adminEmail      : null,
				createdAt       : new Date(),
				updatedAt       : new Date()
			};

			setComments( prev => [newComment, ...prev] );
			toast.success( 'Comentario agregado exitosamente' );
		} catch ( error ) {
			console.error( 'Error adding comment:', error );
			toast.error( 'Error al agregar el comentario' );
		} finally {
			setIsCreating( false );
		}
	};


	/**
	 * Edit an existing comment
	 */
	const handleEditComment = async ( commentId: string, content: string ) => {
		try {
			setIsLoading( true );
			await new Promise( resolve => setTimeout( resolve, 1000 ) );
			setComments( prev => 
				prev.map( comment => 
					comment.id === commentId 
						? { ...comment, content, updatedAt: new Date() }
						: comment
				)
			);

			toast.success( 'Comentario editado exitosamente' );
		} catch ( error ) {
			console.error( 'Error editing comment:', error );
			toast.error( 'Error al editar el comentario' );
		} finally {
			setIsLoading( false );
		}
	};


	/**
	 * Delete a comment
	 */
	const handleDeleteComment = async ( commentId: string ) => {
		try {
			setIsLoading( true );
			await new Promise( resolve => setTimeout( resolve, 1000 ) );
			setComments( prev => prev.filter( comment => comment.id !== commentId ) );
			toast.success( 'Comentario eliminado exitosamente' );
		} catch ( error ) {
			console.error( 'Error deleting comment:', error );
			toast.error( 'Error al eliminar el comentario' );
		} finally {
			setIsLoading( false );
		}
	};


	return {
		comments,
		isLoading,
		isCreating,
		isError,
		error,
		handleAddComment,
		handleEditComment,
		handleDeleteComment,
		retryLoadComments
	};
}
