'use client'

import {
	JSX,
	useCallback,
	useEffect,
	useMemo,
	useState
}                       from 'react';
import { useRouter }    from 'next/navigation';

import {
	Upload,
	FileSpreadsheet,
	AlertCircle,
	Table,
	Users,
	X,
    DownloadIcon
}                       from 'lucide-react';
import {
	useMutation,
	useQueryClient
}                       from '@tanstack/react-query';
import { useDropzone }  from 'react-dropzone';
import { toast }        from 'sonner';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
}                                   from '@/components/ui/dialog';

import { Card, CardContent }        from '@/components/ui/card';
import { Button }                   from '@/components/ui/button';
import { Alert, AlertDescription }  from '@/components/ui/alert';

import { SessionAvailabilityResult } from '@/types/session-availability.model';
import { OfferSection }             from '@/types/offer-section.model';
import { successToast, errorToast } from '@/config/toast/toast.config';
import { ENV }                      from '@/config/envs/env';
import { KEY_QUERYS }               from '@/consts/key-queries';
import { cn }                       from '@/lib/utils';
import { Method }                   from '@/services/fetch';
import { ExcelIcon }                from '@/icons/ExcelIcon';


interface UploadError {
	type    : 'format' | 'size' | 'general';
	message : string;
}


interface FileFormProps {
	isOpen      : boolean;
	onClose     : () => void;
	sections    : OfferSection[];
}

const MAX_FILE_SIZE     = 10 * 1024 * 1024;
const DOWNLOAD_ENDPOINT = `${ENV.REQUEST_BACK_URL}${KEY_QUERYS.SESSIONS}/without-reservation`;
const UPLOAD_ENDPOINT   = `${ENV.REQUEST_BACK_URL}${KEY_QUERYS.SESSIONS}/bulk-upload`;


export function FileForm({
	isOpen,
	onClose,
	sections
}: FileFormProps ): JSX.Element {
	const router        = useRouter();
	const queryClient   = useQueryClient();

	const [ selectedFile, setSelectedFile ]         = useState<File | null>( null );
	const [ uploadError, setUploadError ]           = useState<UploadError | null>( null );
	const [ isDownloading, setIsDownloading ]       = useState<boolean>( false );
	const [ currentDownload, setCurrentDownload ]   = useState<string | null>( null );

	const availability = useMemo(() => {
		const hasMissingSpaces = sections.some(( section ) =>
			// section.sessions.some(( session ) => !session.spaceId || session.spaceId.trim() === '' )
        section.sessions.spaceIds.some(( spaceId ) => !spaceId || spaceId.trim() === '' )
		);

		const hasMissingProfessors = sections.some(( section ) =>
            section.sessions.professorIds.some(( professorId ) => !professorId || professorId.trim() === '' )
			// section.sessions.some(( session ) => !session.professorId || session.professorId.trim() === '' )
		);

		return {
			space       : hasMissingSpaces,
			professor   : hasMissingProfessors
		};
	}, [ sections ]);


	useEffect(() => {
		if ( !isOpen ) {
			setSelectedFile( null );
			setUploadError( null );
			setCurrentDownload( null );
		}
	}, [ isOpen ]);


    const validateFile = useCallback(( file: File ): UploadError | null => {
		const allowedTypes = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
			'text/csv'
		];

		if ( !allowedTypes.includes( file.type )) {
			return {
				type    : 'format',
				message : 'Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)'
			};
		}

		if ( file.size > MAX_FILE_SIZE ) {
			return {
				type    : 'size',
				message : 'El archivo no puede ser mayor a 10MB'
			};
		}

		return null;
	}, []);


	const onDrop = useCallback(( acceptedFiles: File[] ) => {
		setUploadError( null );

		if ( acceptedFiles.length === 0 ) {
			setUploadError({
				type    : 'general',
				message : 'No se pudo procesar el archivo seleccionado'
			});
			return;
		}

		const file = acceptedFiles[0];
		const validationError = validateFile( file );

		if ( validationError ) {
			setUploadError( validationError );
			toast( validationError.message, errorToast );
			return;
		}

		setSelectedFile( file );
		toast( 'Archivo seleccionado correctamente', successToast );
	}, [ validateFile ]);


	// const uploadMutation = useMutation<SessionAvailabilityResult[] | OfferSection[], Error, File>({
	const uploadMutation = useMutation<any[], Error, File>({
		mutationFn  : async ( file ) => {
			const formData = new FormData();
			formData.append( 'file', file );
			const response = await fetch( `${UPLOAD_ENDPOINT}`, {
				method  : Method.POST,
				body  : formData
			});

			if ( !response.ok ) {
				const errorBody = await response.json();
				throw new Error(errorBody.message || `API error: ${response.status} ${response.statusText}`);
			}

			return await response.json() as SessionAvailabilityResult[];
		},
		onSuccess  : ( data ) => {
			const ulid = crypto.randomUUID();

            if ( data[0].id ) {
                toast( 'Registros actualizados correctamente ✅', successToast );
                return;
            }

            queryClient.setQueryData<SessionAvailabilityResult[]>(
				[ KEY_QUERYS.SESSIONS, 'assignment', ulid ],
				data as SessionAvailabilityResult[]
			);

			router.push( `/sections/assignment/${ ulid }` );

            toast( 'Archivo procesado correctamente ✅', successToast );
		},
		onError  : ( mutationError ) => {
			toast( `Error al cargar archivo: ${mutationError.message}`, errorToast );
		}
	});

	const handleUpload = (): void => {
		if ( !selectedFile ) {
			toast( 'Por favor selecciona un archivo primero', errorToast );
			return;
		}

		uploadMutation.mutate( selectedFile );
	};

	const handleDownload = async ( type: 'space' | 'professor' | 'registered' ): Promise<void> => {
		if ( type === 'space' && !availability.space ) {
			toast( 'Todas las sesiones tienen espacios asignados', errorToast );
			return;
		}

		if ( type === 'professor' && !availability.professor ) {
			toast( 'Todas las sesiones tienen profesores asignados', errorToast );
			return;
		}

		try {
			setIsDownloading( true );
			setCurrentDownload( type );
			const response = await fetch( `${DOWNLOAD_ENDPOINT}/${type}`, {
				method  : Method.GET,
				headers  : {
					'Accept' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				}
			});

			if ( !response.ok ) {
				throw new Error(`Error al descargar el Excel (${response.status})`);
			}

			const blob  = await response.blob();
			const url   = window.URL.createObjectURL( blob );
			const link  = document.createElement( 'a' );
			link.href   = url;

			link.setAttribute( 'download', `sesiones_${type}.xlsx` );

            document.body.appendChild( link );
			link.click();
			link.remove();

            window.URL.revokeObjectURL( url );
			toast( 'Excel descargado correctamente ✅', successToast );
		} catch ( error ) {
			console.error( 'Error generando Excel:', error );
			toast( 'Error al descargar el Excel ❌', errorToast );
		} finally {
			setIsDownloading( false );
			setCurrentDownload( null );
		}
	};


	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		multiple  : false,
		disabled  : uploadMutation.isPending,
		accept  : {
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : [ '.xlsx' ],
			'application/vnd.ms-excel' : [ '.xls' ],
			'text/csv' : [ '.csv' ]
		}
	});


	return (
		<Dialog open = { isOpen } onOpenChange = { onClose }>
			<DialogContent className = "max-w-2xl max-h-[90vh] overflow-y-auto space-y-2">
				<DialogHeader>
					<DialogTitle>Gestión de archivos de sesiones</DialogTitle>

					<DialogDescription>
						Descarga el Excel correspondiente, complétalo y vuelve a subirlo para validar la disponibilidad.
					</DialogDescription>
				</DialogHeader>

				<Card>
					<CardContent className = "p-4 space-y-3">
						<h3 className = "text-sm font-semibold">Descarga el tipo de archivo que necesitas</h3>
						<div className = "space-y-2">
							<Button
								variant     = "outline"
								className   = "w-full justify-between"
								onClick     = {() => handleDownload( 'space' )}
								disabled    = { !availability.space || ( isDownloading && currentDownload !== 'space' ) }
							>
								<span className = "flex items-center gap-2">
									<ExcelIcon />
									<span>Sesiones sin espacios</span>
								</span>

								<span className = "ml-auto flex items-center gap-2 text-sm text-muted-foreground">
									{ !availability.space ? 'Sin pendientes' : 'Descargar' }

                                    <DownloadIcon className = "h-4 w-4" />
								</span>
							</Button>

							<Button
								variant     = "outline"
								className   = "w-full justify-between"
								onClick     = {() => handleDownload( 'professor' )}
								disabled    = { !availability.professor || ( isDownloading && currentDownload !== 'professor' ) }
							>
								<span className = "flex items-center gap-2">
									<Users className = "h-4 w-4" />
									<span>Sesiones sin profesores</span>
								</span>
								<span className = "ml-auto flex items-center gap-2 text-sm text-muted-foreground">
									{ !availability.professor ? 'Sin pendientes' : 'Descargar' }

                                    <DownloadIcon className = "h-4 w-4" />
								</span>
							</Button>

							<Button
								variant     = "outline"
								className   = "w-full justify-between"
								onClick     = {() => handleDownload( 'registered' )}
							>
								<span className = "flex items-center gap-2">
									<Table className = "h-4 w-4" />
									<span>Asignar registros a sesiones</span>
								</span>
								<span className = "ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                                    Descargar

                                    <DownloadIcon className = "h-4 w-4" />
								</span>
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className = "p-0">
						<div
							{ ...getRootProps() }
							className = { cn(
								'border-4 border-dashed rounded-lg p-8 text-center transition-colors',
								uploadMutation.isPending
									? 'cursor-not-allowed opacity-60'
									: 'cursor-pointer hover:border-primary/50',
								isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
							)}
						>
							<input { ...getInputProps() } />

							<div className = "flex flex-col items-center gap-4">
								<div className = "p-4 rounded-full bg-muted">
									<Upload className = "h-8 w-8 text-muted-foreground" />
								</div>

								<div className = "space-y-2">
									<h3 className = "text-lg font-semibold">
										{ isDragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo Excel' }
									</h3>

									<p className = "text-sm text-muted-foreground">
										o haz clic para seleccionar un archivo
									</p>

									<p className = "text-xs text-muted-foreground">
										Formatos soportados: .xlsx, .xls, .csv (máx. 10MB)
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{ uploadError && (
					<Alert variant = "destructive">
						<AlertCircle className = "h-4 w-4" />
						<AlertDescription>{ uploadError.message }</AlertDescription>
					</Alert>
				)}

				{ selectedFile && (
					<Card>
						<CardContent className = "p-4">
							<div className = "flex items-center justify-between">
								<div className = "flex items-center gap-3">
									<div className = "p-2 rounded bg-green-100 dark:bg-green-900/20">
										<FileSpreadsheet className = "h-5 w-5 text-green-600 dark:text-green-400" />
									</div>

									<div>
										<p className = "font-medium text-sm">{ selectedFile.name }</p>
										<p className = "text-xs text-muted-foreground">{ ( selectedFile.size / 1024 / 1024 ).toFixed( 2 ) } MB</p>
									</div>
								</div>

                                <div className = "flex items-center gap-2">
                                    <Button
										className   = "w-full sm:w-auto gap-2"
										onClick     = { handleUpload }
									>
										<Upload className = "h-4 w-4" />
                                        { uploadMutation.isPending ? 'Subiendo...' : 'Subir archivo' }
                                    </Button>

                                    <Button
                                        variant     = "ghost"
                                        size        = "sm"
                                        disabled    = { uploadMutation.isPending }
                                        onClick     = {() => {
                                            setSelectedFile( null );
                                            setUploadError( null );
                                        }}
                                    >
                                        <X className = "h-4 w-4" />
                                    </Button>
                                </div>
							</div>
						</CardContent>
					</Card>
				)}

				<DialogFooter className = "flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Card>
                        <CardContent className = "p-4 space-y-2">
                            <h4 className = "font-medium">Instrucciones para el archivo Excel:</h4>

                            <ul className = "text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Solo debe ser formato .xls, .xlsx o .csv.</li>
                                <li>No puede superar los 10mb.</li>
                                <li>Solo se realiza la lectura de la hoja 1.</li>
                                <li>Si se registra con algún problema puedes modificarlo manualmente.</li>
                                <li>No elimine ni modifique la hoja _meta, esto sirve para identificar el tipo de archivo.</li>
                            </ul>
                        </CardContent>
                    </Card>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
