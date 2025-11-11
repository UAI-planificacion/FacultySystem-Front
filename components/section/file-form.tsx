'use client'

import {
	JSX,
	useCallback,
	useEffect,
	useMemo,
	useState
} from 'react';
import { useRouter } from 'next/navigation';

import {
	Upload,
	HardDriveDownload,
	FileSpreadsheet,
	AlertCircle,
	Table,
	Users,
	X
} from 'lucide-react';
import {
	useMutation,
	useQueryClient
} from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	Card,
	CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
	ToggleGroup,
	ToggleGroupItem
} from '@/components/ui/toggle-group';

import { successToast, errorToast } from '@/config/toast/toast.config';
import { ENV } from '@/config/envs/env';
import { KEY_QUERYS } from '@/consts/key-queries';
import { cn } from '@/lib/utils';
import { Method } from '@/services/fetch';
import { ExcelIcon } from '@/icons/ExcelIcon';
import {
	SessionAvailabilityResult,
	SessionAssignmentCache,
	SessionAssignmentType
} from '@/types/session-availability.model';
import { OfferSection } from '@/types/offer-section.model';

interface UploadError {
	type  : 'format' | 'size' | 'general';
	message  : string;
}

interface UploadVariables {
	file  : File;
	type  : SessionAssignmentType;
}

interface FileFormProps {
	isOpen  : boolean;
	onClose  : () => void;
	sections  : OfferSection[];
}

interface DownloadAvailability {
	space  : boolean;
	professor  : boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DOWNLOAD_ENDPOINT = `${ENV.REQUEST_BACK_URL}${KEY_QUERYS.SESSIONS}/without-reservation`;

const UPLOAD_ENDPOINT = `${ENV.REQUEST_BACK_URL}${KEY_QUERYS.SESSIONS}/bulk-upload`;

const FILE_NAMES: Record<SessionAssignmentType, string> = {
	space  : 'sesiones_sin_espacios.xlsx',
	professor  : 'sesiones_sin_profesores.xlsx',
	registrants  : 'sesiones_registros.xlsx'
};

export function FileForm({
	isOpen,
	onClose,
	sections
}: FileFormProps ): JSX.Element {
	const router  = useRouter();
	const queryClient  = useQueryClient();
	const [ selectedType, setSelectedType ] = useState<SessionAssignmentType | null>( null );
	const [ selectedFile, setSelectedFile ] = useState<File | null>( null );
	const [ uploadError, setUploadError ] = useState<UploadError | null>( null );
	const [ isDownloading, setIsDownloading ] = useState<boolean>( false );

	const availability = useMemo<DownloadAvailability>(() => {
		const hasMissingSpaces = sections.some(( section ) =>
			section.sessions.some(( session ) => !session.spaceId || session.spaceId.trim() === '' )
		);

		const hasMissingProfessors = sections.some(( section ) =>
			section.sessions.some(( session ) => !session.professorId || session.professorId.trim() === '' )
		);

		return {
			space  : hasMissingSpaces,
			professor  : hasMissingProfessors
		};
	}, [ sections ]);

	useEffect(() => {
		if ( !isOpen ) {
			setSelectedType( null );
			setSelectedFile( null );
			setUploadError( null );
		}
	}, [ isOpen ]);

	useEffect(() => {
		setSelectedFile( null );
		setUploadError( null );
	}, [ selectedType ]);

	const validateFile = useCallback(( file: File ): UploadError | null => {
		const allowedTypes = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
			'text/csv'
		];

		if ( !allowedTypes.includes( file.type )) {
			return {
				type  : 'format',
				message  : 'Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)'
			};
		}

		if ( file.size > MAX_FILE_SIZE ) {
			return {
				type  : 'size',
				message  : 'El archivo no puede ser mayor a 10MB'
			};
		}

		return null;
	}, []);

	const onDrop = useCallback(( acceptedFiles: File[] ) => {
		setUploadError( null );

		if ( acceptedFiles.length === 0 ) {
			setUploadError({
				type  : 'general',
				message  : 'No se pudo procesar el archivo seleccionado'
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

	const uploadMutation = useMutation<SessionAvailabilityResult[], Error, UploadVariables>({
		mutationFn  : async ({ file, type }) => {
			const formData = new FormData();
			formData.append( 'file', file );
			const response = await fetch( `${UPLOAD_ENDPOINT}/${type}`, {
				method  : Method.POST,
				body  : formData
			});

			if ( !response.ok ) {
				const errorBody = await response.json();
				throw new Error(errorBody.message || `API error: ${response.status} ${response.statusText}`);
			}

			return await response.json() as SessionAvailabilityResult[];
		},
		onSuccess  : ( data, variables ) => {
			const cacheValue: SessionAssignmentCache = {
				type  : variables.type,
				results  : data
			};

			queryClient.setQueryData<SessionAssignmentCache>(
				[ KEY_QUERYS.SESSIONS ],
				cacheValue
			);

			console.log( 'SessionAvailabilityResult', cacheValue );
			toast( 'Archivo procesado correctamente ✅', successToast );
			router.push( '/sections/assignment' );
		},
		onError  : ( mutationError ) => {
			toast( `Error al cargar archivo: ${mutationError.message}`, errorToast );
		}
	});

	const handleUpload = (): void => {
		if ( !selectedType ) {
			toast( 'Selecciona un tipo antes de subir un archivo', errorToast );
			return;
		}

		if ( selectedType === 'registrants' ) {
			toast( 'La subida para Registros estará disponible próximamente', errorToast );
			return;
		}

		if ( !selectedFile ) {
			toast( 'Por favor selecciona un archivo primero', errorToast );
			return;
		}

		uploadMutation.mutate({
			file  : selectedFile,
			type  : selectedType
		});
	};

	const handleDownload = async (): Promise<void> => {
		if ( !selectedType ) {
			toast( 'Selecciona un tipo antes de descargar', errorToast );
			return;
		}

		if ( selectedType === 'registrants' ) {
			toast( 'La descarga para Registros estará disponible próximamente', errorToast );
			return;
		}

		if ( selectedType === 'space' && !availability.space ) {
			toast( 'Todas las sesiones tienen espacios asignados', errorToast );
			return;
		}

		if ( selectedType === 'professor' && !availability.professor ) {
			toast( 'Todas las sesiones tienen profesores asignados', errorToast );
			return;
		}

		try {
			setIsDownloading( true );
			const response = await fetch( `${DOWNLOAD_ENDPOINT}/${selectedType}`, {
				method  : Method.GET,
				headers  : {
					'Accept' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				}
			});

			if ( !response.ok ) {
				throw new Error(`Error al descargar el Excel (${response.status})`);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL( blob );
			const link = document.createElement( 'a' );
			link.href = url;
			link.setAttribute( 'download', FILE_NAMES[selectedType] );
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
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		multiple  : false,
		disabled  : uploadMutation.isPending || !selectedType || selectedType === 'registrants',
		accept  : {
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : [ '.xlsx' ],
			'application/vnd.ms-excel' : [ '.xls' ],
			'text/csv' : [ '.csv' ]
		}
	});

	const canDownload = useMemo(() => {
		if ( !selectedType || selectedType === 'registrants' ) return false;
		if ( selectedType === 'space' ) return availability.space;
		if ( selectedType === 'professor' ) return availability.professor;
		return false;
	}, [ selectedType, availability ]);

	const canUpload = useMemo(() => {
		return Boolean( selectedType && selectedType !== 'registrants' && selectedFile && !uploadMutation.isPending );
	}, [ selectedType, selectedFile, uploadMutation.isPending ]);

	return (
		<Dialog open = { isOpen } onOpenChange = { onClose }>
			<DialogContent className = "max-w-3xl max-h-[90vh] overflow-y-auto space-y-6">
				<DialogHeader>
					<DialogTitle>Gestión de archivos de sesiones</DialogTitle>
					<DialogDescription>
						Descarga el Excel correspondiente, complétalo y vuelve a subirlo para validar la disponibilidad.
					</DialogDescription>
				</DialogHeader>

				<Card>
					<CardContent className = "p-4 space-y-4">
						<h3 className = "text-sm font-semibold">Selecciona el tipo de archivo</h3>

						<ToggleGroup
							type  = "single"
							value  = { selectedType || undefined }
							onValueChange  = {( value ) => setSelectedType( ( value || null ) as SessionAssignmentType | null ) }
							className  = "grid grid-cols-3 gap-3"
						>
							<ToggleGroupItem
								value  = "space"
								className  = { cn( 'gap-2 py-3', selectedType === 'space' ? 'bg-primary/10' : '' ) }
								disabled  = { uploadMutation.isPending }
							>
								<span className = "h-4 w-4">
									<ExcelIcon />
								</span>
								<span>Espacios</span>
								{ !availability.space && (
									<Badge variant = "outline" className = "ml-auto">Sin pendientes</Badge>
								)}
							</ToggleGroupItem>

							<ToggleGroupItem
								value  = "professor"
								className  = { cn( 'gap-2 py-3', selectedType === 'professor' ? 'bg-primary/10' : '' ) }
								disabled  = { uploadMutation.isPending }
							>
								<Users className = "h-4 w-4" />
								<span>Profesores</span>
								{ !availability.professor && (
									<Badge variant = "outline" className = "ml-auto">Sin pendientes</Badge>
								)}
							</ToggleGroupItem>

							<ToggleGroupItem
								value  = "registrants"
								className  = { cn( 'gap-2 py-3', selectedType === 'registrants' ? 'bg-primary/10' : '' ) }
								disabled  = { true }
								title  = "Disponible próximamente"
							>
								<Table className = "h-4 w-4" />
								<span>Registros</span>
								<Badge variant = "outline" className = "ml-auto">Próximamente</Badge>
							</ToggleGroupItem>
						</ToggleGroup>
					</CardContent>
				</Card>

				<Card>
					<CardContent className = "p-0">
						<div
							{ ...getRootProps() }
							className = { cn(
								'border-4 border-dashed rounded-lg p-8 text-center transition-colors',
								uploadMutation.isPending || !selectedType || selectedType === 'registrants'
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

								<Button
									variant  = "ghost"
									size  = "sm"
									onClick  = {() => {
										setSelectedFile( null );
										setUploadError( null );
									}}
									disabled  = { uploadMutation.isPending }
								>
									<X className = "h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardContent className = "p-4 space-y-2">
						<h4 className = "font-medium">Instrucciones para el archivo Excel:</h4>
						<ul className = "text-sm text-muted-foreground space-y-1 list-disc list-inside">
							<li>Solo debe ser formato .xls, .xlsx o .csv.</li>
							<li>No puede superar los 10mb.</li>
							<li>Solo se realiza la lectura de la hoja 1.</li>
							<li>Si se registra con algún problema puedes modificarlo manualmente.</li>
						</ul>
					</CardContent>
				</Card>

				<DialogFooter className = "flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<Button
						variant  = "secondary"
						className  = "w-full sm:w-auto gap-2"
						onClick  = { handleDownload }
						disabled  = { !canDownload || isDownloading }
					>
						<HardDriveDownload className = "h-4 w-4" />
						Descargar Excel
					</Button>

					<Button
						className  = "w-full sm:w-auto gap-2"
						onClick  = { handleUpload }
						disabled  = { !canUpload }
					>
						<Upload className = "h-4 w-4" />
						{ uploadMutation.isPending ? 'Subiendo...' : 'Subir archivo' }
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
