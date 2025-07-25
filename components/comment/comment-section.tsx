"use client"

import { JSX, useState } from "react";
import { MessageCircle, Send, User, Edit2, Trash2, Check, X } from "lucide-react";

import { Button }               from "@/components/ui/button";
import { Textarea }             from "@/components/ui/textarea";
import { Card }                 from "@/components/ui/card";
import { ScrollArea }           from "@/components/ui/scroll-area";
import { CommentsSkeleton }     from "@/components/comment/comment-card-skeleton";
import { CommentErrorCard }     from "@/components/comment/comment-error-card";

import { Comment }              from "@/types/comment.model";
import { useSession }           from "@/hooks/use-session";
import { useComments }          from "@/hooks/use-comments";


interface CommentSectionProps {
	requestId       : string;
	requestDetailId?: string;
}


/**
 * Component for displaying and managing comments in a request
 */
export function CommentSection( { 
	requestId,
	requestDetailId
}: CommentSectionProps ): JSX.Element {
	const [newComment, setNewComment] = useState( "" );
	const { session } = useSession();
	
	// Use the comments hook to manage all comment-related logic
	const {
		comments,
		isLoading,
		isCreating,
		isError,
		error,
		handleAddComment,
		handleEditComment,
		handleDeleteComment,
		retryLoadComments
	} = useComments( requestId, requestDetailId );


	/**
	 * Handle submitting a new comment
	 */
	const handleSubmitComment = () => {
		if ( newComment.trim() ) {
			handleAddComment( newComment.trim() );
			setNewComment( "" );
		}
	};


	/**
	 * Handle key press in textarea (Ctrl+Enter to submit)
	 */
	const handleKeyPress = ( e: React.KeyboardEvent ) => {
		if ( e.key === "Enter" && e.ctrlKey ) {
			e.preventDefault();
			handleSubmitComment();
		}
	};


	return (
		<div className="space-y-4">
			{/* Comments List */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<MessageCircle className="h-4 w-4" />
					<h3 className="text-sm font-medium">
						Comentarios ({isLoading ? "..." : comments.length})
					</h3>
				</div>

				{/* Error State */}
				{isError && (
					<CommentErrorCard 
						onRetry={retryLoadComments}
					/>
				)}

				{/* Loading State */}
				{isLoading && !isError && (
					<CommentsSkeleton count={3} />
				)}

				{/* Empty State */}
				{!isLoading && !isError && comments.length === 0 && (
					<Card className="p-4">
						<p className="text-sm text-muted-foreground text-center">
							No hay comentarios aún. ¡Sé el primero en comentar!
						</p>
					</Card>
				)}

				{/* Comments List */}
				{!isLoading && !isError && comments.length > 0 && (
					<ScrollArea className="h-[450px] w-full">
						<div className="space-y-3 pr-4">
							{comments.map( ( comment ) => (
								<CommentItem 
									key             = { comment.id } 
									comment         = { comment }
									currentUserEmail = { session?.user?.email || "" }
									onEdit          = { handleEditComment }
									onDelete        = { handleDeleteComment }
									isLoading       = { isLoading }
								/>
							))}
						</div>
					</ScrollArea>
				)}
			</div>

			{/* Add New Comment */}
			<Card className="p-4">
				<div className="space-y-3">
					<h4 className="text-sm font-medium">Agregar comentario</h4>
					
					<Textarea
						placeholder     = "Escribe tu comentario aquí... (Ctrl+Enter para enviar)"
						value           = { newComment }
						onChange        = { ( e ) => setNewComment( e.target.value ) }
						onKeyDown       = { handleKeyPress }
						className       = "min-h-[100px] max-h-[200px] resize-none"
						maxLength       = { 500 }
						disabled        = { isError } // Disable commenting when there's an error
					/>

					<div className="flex justify-between items-center">
						<span className="text-xs text-muted-foreground">
							{newComment.length} / 500
						</span>

						<Button
							onClick     = { handleSubmitComment }
							disabled    = { !newComment.trim() || isCreating || isError }
							size        = "sm"
						>
							<Send className="h-4 w-4 mr-2" />
							{isCreating ? "Enviando..." : "Enviar"}
						</Button>
					</div>

					{/* Error message for commenting */}
					{isError && (
						<p className="text-xs text-destructive">
							Los comentarios están deshabilitados debido a un error al cargar.
						</p>
					)}
				</div>
			</Card>
		</div>
	);
}


interface CommentItemProps {
	comment         : Comment;
	currentUserEmail : string;
	onEdit          : ( commentId: string, content: string ) => void;
	onDelete        : ( commentId: string ) => void;
	isLoading       : boolean;
}


/**
 * Individual comment item component
 */
function CommentItem( { 
	comment, 
	currentUserEmail, 
	onEdit, 
	onDelete, 
	isLoading 
}: CommentItemProps ): JSX.Element {
	const [isEditing, setIsEditing] = useState( false );
	const [editContent, setEditContent] = useState( comment.content );


	/**
	 * Check if current user can edit/delete this comment
	 */
	const canEditComment = () => {
		if ( !currentUserEmail ) return false;
		
		// Check if user is the staff author
		if ( comment.staff?.email === currentUserEmail ) return true;
		
		// Check if user is the admin author
		if ( comment.adminEmail === currentUserEmail ) return true;
		
		return false;
	};


	/**
	 * Handle saving edited comment
	 */
	const handleSaveEdit = () => {
		if ( editContent.trim() && editContent !== comment.content ) {
			onEdit( comment.id, editContent.trim() );
		}
		setIsEditing( false );
	};


	/**
	 * Handle canceling edit
	 */
	const handleCancelEdit = () => {
		setEditContent( comment.content );
		setIsEditing( false );
	};


	/**
	 * Handle deleting comment
	 */
	const handleDelete = () => {
		if ( window.confirm( "¿Estás seguro de que quieres eliminar este comentario?" ) ) {
			onDelete( comment.id );
		}
	};
	/**
	 * Get the author information from comment
	 */
	const getAuthorInfo = () => {
		if ( comment.staff ) {
			return {
				name    : comment.staff.name,
				email   : comment.staff.email,
				type    : "staff" as const
			};
		}
		
		if ( comment.adminName && comment.adminEmail ) {
			return {
				name    : comment.adminName,
				email   : comment.adminEmail,
				type    : "admin" as const
			};
		}

		return {
			name    : "Usuario desconocido",
			email   : "",
			type    : "unknown" as const
		};
	};


	/**
	 * Format date to readable string
	 */
	const formatDate = ( date: Date | string ) => {
		return new Intl.DateTimeFormat( "es-ES", {
			year    : "numeric",
			month   : "short",
			day     : "numeric",
			hour    : "2-digit",
			minute  : "2-digit"
		}).format( new Date( date ) );
	};


	const author = getAuthorInfo();


	return (
		<Card className="p-4">
			<div className="space-y-3">
				{/* Author Info */}
				<div className="flex items-start gap-3">
					<div className="flex-shrink-0">
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
							<User className="h-4 w-4 text-primary" />
						</div>
					</div>

					<div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h5 className="text-sm font-medium truncate">
                                        {author.name}
                                    </h5>

                                    {author.type === "admin" && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                            Admin
                                        </span>
                                    )}

                                    {author.type === "staff" && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                            Staff
                                        </span>
                                    )}
                                </div>

                                {author.email && (
                                    <p className="text-xs text-muted-foreground truncate">
                                        {author.email}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
								<p className="text-xs text-muted-foreground">
									{formatDate( comment.createdAt )}
								</p>

								{/* Edit/Delete buttons for comment owner */}
								{canEditComment() && !isEditing && (
									<div className="flex gap-1">
										<Button
											variant     = "ghost"
											size        = "sm"
											onClick     = { () => setIsEditing( true ) }
											disabled    = { isLoading }
											className   = "h-6 w-6 p-0"
										>
											<Edit2 className="h-3 w-3" />
										</Button>

										<Button
											variant     = "ghost"
											size        = "sm"
											onClick     = { handleDelete }
											disabled    = { isLoading }
											className   = "h-6 w-6 p-0 text-destructive hover:text-destructive"
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								)}

								{/* Save/Cancel buttons when editing */}
								{isEditing && (
									<div className="flex gap-1">
										<Button
											variant     = "ghost"
											size        = "sm"
											onClick     = { handleSaveEdit }
											disabled    = { isLoading || !editContent.trim() }
											className   = "h-6 w-6 p-0 text-green-600 hover:text-green-700"
										>
											<Check className="h-3 w-3" />
										</Button>

										<Button
											variant     = "ghost"
											size        = "sm"
											onClick     = { handleCancelEdit }
											disabled    = { isLoading }
											className   = "h-6 w-6 p-0"
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								)}
							</div>
                        </div>
					</div>
				</div>

				{/* Comment Content */}
				<div className="pl-11">
					{isEditing ? (
						<Textarea
							value       = { editContent }
							onChange    = { ( e ) => setEditContent( e.target.value ) }
							className   = "min-h-[80px] max-h-[200px] resize-none"
							maxLength   = { 500 }
							placeholder = "Edita tu comentario..."
						/>
					) : (
						<p className="text-sm text-foreground whitespace-pre-wrap">
							{comment.content}
						</p>
					)}
				</div>
			</div>
		</Card>
	);
}