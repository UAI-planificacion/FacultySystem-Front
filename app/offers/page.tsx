'use client'

import { JSX, useState, useMemo }   from "react";
import { useRouter }                from "next/navigation";
import { useForm, useFieldArray }   from "react-hook-form";

import {
    Plus,
    Save,
    Trash2,
    Upload,
    CheckCircle2,
    AlertCircle,
    Hash
}                                       from "lucide-react";
import { useMutation, useQueryClient }  from "@tanstack/react-query";
import { toast }                        from "sonner";
import { zodResolver }                  from "@hookform/resolvers/zod";
import { z }                            from "zod";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                           from "@/components/ui/card";
import { Form}              from "@/components/ui/form";
import { Button }           from "@/components/ui/button";
import { PageLayout }       from "@/components/layout/page-layout";
import { bulkOfferSchema }  from "@/components/offer/offer-schema";
import { SubjectSelect }    from "@/components/shared/item-select/subject-select";
import { PeriodSelect }     from "@/components/shared/item-select/period-select";
import { OfferList }        from "@/components/offer/offer-list";
import { OfferTable }       from "@/components/offer/offer-table";
import { ViewMode }         from "@/components/shared/view-mode";
import { useViewMode }      from "@/hooks/use-view-mode";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
}                           from "@/components/ui/dialog";
import { SubjectUpload }    from "@/components/subject/subject-upload";

import { errorToast, successToast } from "@/config/toast/toast.config";
import { CreateOfferSubject }       from '@/types/subject.model';
import { KEY_QUERYS }               from '@/consts/key-queries';
import { fetchApi, Method }         from '@/services/fetch';


type BulkOfferSubjectFormValues = z.infer<typeof bulkOfferSchema>;


const emptyOffer = {
	periodId			: "",
	professorId			: "",
	numberOfSections    : 1,
	startDate			: new Date(),
	endDate				: new Date(),
	subjectId			: "",
	spaceType			: "",
	spaceSizeId			: "",
	building			: null,
	workshop			: 0,
	lecture				: 0,
	tutoringSession		: 0,
	laboratory			: 0,
};

/**
 * API call to create bulk offer subjects
 */
const createBulkOfferSubjectApi = async ( dataFrom: CreateOfferSubject[] ): Promise<any[]> =>
	fetchApi<any[]>({
		url		: `${KEY_QUERYS.SECTIONS}/massive-offers`,
		method	: Method.POST,
		body	: dataFrom
	});


const validString = (
	value: string | undefined | null
): string | null => value ?? null;


const validBuilding = (
	value: string | undefined | null
): any => value ?? null;


/**
 * Extract unique groupIds from offers array
 */
const getUniqueGroupIds = ( offers: any[] ): string => {
	const uniqueIds = Array.from( new Set( offers.map( offer => offer.groupId )));
	return uniqueIds.join( ',' );
};


export default function OffersPage(): JSX.Element {
	const queryClient									= useQueryClient();
	const router										= useRouter();
	const { viewMode, onViewChange }					= useViewMode({ queryName: 'viewOffer', defaultMode: 'cards' });
	const [isUploadDialogOpen, setIsUploadDialogOpen]	= useState<boolean>( false );
	const [globalSubjectId, setGlobalSubjectId]			= useState<string | null>( null );
	const [globalPeriodId, setGlobalPeriodId]			= useState<string | null>( null );
	const form											= useForm<BulkOfferSubjectFormValues>({
		resolver		: zodResolver( bulkOfferSchema ),
		defaultValues	: {
			offers: [ emptyOffer ],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control	: form.control,
		name	: "offers",
	});

	/**
	 * Mutation to create bulk offer subjects
	 */
	const createBulkOfferSubjectMutation = useMutation<any[], Error, CreateOfferSubject[]>({
		mutationFn: createBulkOfferSubjectApi,
		onSuccess: ( createdOffers ) => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.SECTIONS ]});
			form.reset({
				offers: [ emptyOffer ],
			});

			const groupIds = getUniqueGroupIds( createdOffers );
			router.push(`/sections?groupId=${groupIds}`);

			toast( `${createdOffers.length} ofertas creadas exitosamente`, successToast );
		},
		onError: ( mutationError ) => {
			toast( `Error al crear ofertas: ${mutationError.message}`, errorToast );
		},
	});


	const handleSubmit = ( data: BulkOfferSubjectFormValues ) => {
		const transformedOffers: CreateOfferSubject[] = data.offers.map( offer => ({
			...offer,
			professorId	: validString( offer.professorId ),
			spaceType	: validString( offer.spaceType ),
			spaceSizeId : validString( offer.spaceSizeId ),
			building	: validBuilding( offer.building ),
		}));

		createBulkOfferSubjectMutation.mutate( transformedOffers );
	};


	const addOffer = () => {
		append({
			...emptyOffer,
			subjectId	: globalSubjectId || "",
			periodId	: globalPeriodId || "",
		});
	};


	const removeOffer = ( index: number ) => {
		if ( fields.length > 1 ) {
			remove( index );
		}
	};

	/**
	 * Calculate offers statistics
	 */
	const offersStats = useMemo(() => {
		const totalOffers = fields.length;
		
		let completedOffers = 0;
		let totalSectionsToCreate = 0;

		fields.forEach(( field, index ) => {
			const offer = form.getValues( `offers.${index}` );
			
			// Check if offer is completed
			const hasSubject		= !!offer.subjectId;
			const hasPeriod			= !!offer.periodId;
			const hasNumberOfSections = (offer.numberOfSections || 0) > 0;
			const hasAtLeastOneSession = 
				(offer.lecture || 0) > 0 ||
				(offer.workshop || 0) > 0 ||
				(offer.tutoringSession || 0) > 0 ||
				(offer.laboratory || 0) > 0;

			if ( hasSubject && hasPeriod && hasNumberOfSections && hasAtLeastOneSession ) {
				completedOffers++;
			}

			// Calculate total sections to create
			const numberOfSections = offer.numberOfSections || 0;
			totalSectionsToCreate += numberOfSections;
		});

		const incompleteOffers = totalOffers - completedOffers;

		return {
			totalOffers,
			completedOffers,
			incompleteOffers,
			totalSectionsToCreate,
		};
	}, [fields, form]);


	return (
		<PageLayout title="Ofertar Asignaturas">
			<Form {...form}>
				<form onSubmit={ form.handleSubmit( handleSubmit )} className="space-y-4">
					{/* Selectores globales para preseleccionar Subject y Period */}
                    <Card>
                        <CardContent className="mt-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <SubjectSelect
                                    label				= "Asignatura (Opcional)"
                                    placeholder			= "Seleccionar asignatura para todas las ofertas"
                                    onSelectionChange	= {( value ) => setGlobalSubjectId( value as string || null )}
                                    defaultValues		= { globalSubjectId ? [globalSubjectId] : [] }
                                    multiple			= { false }
                                />

                                <PeriodSelect
                                    label				= "Período (Opcional)"
                                    placeholder			= "Seleccionar período para todas las ofertas"
                                    onSelectionChange	= {( value ) => setGlobalPeriodId( value as string || null )}
                                    defaultValues		= { globalPeriodId ? [globalPeriodId] : [] }
                                    multiple			= { false }
                                />

                                <div className="flex items-center gap-2 justify-end">
                                    <ViewMode
                                        viewMode		= { viewMode }
                                        onViewChange	= { onViewChange }
                                    />

                                    <Button
                                        type		= "button"
                                        variant		= "outline"
                                        className	= "flex items-center gap-2"
                                        onClick		= {() => setIsUploadDialogOpen( true )}
                                    >
                                        <Upload className="h-4 w-4" />

                                        Subir Archivo
                                    </Button>

                                    {/* Botones para agregar ofertas */}
                                    <Button
                                        type		= "button"
                                        variant		= "outline"
                                        onClick		= { addOffer }
                                        className	= "flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />

                                        Agregar Oferta
                                    </Button>

                                </div>
                            </div>
                        </CardContent>
                    </Card>

					{/* Lista de ofertas */}
					{ viewMode === 'cards' ? (
						<OfferList
							fields				= { fields }
							form				= { form }
							removeOffer			= { removeOffer }
							globalSubjectId		= { globalSubjectId }
							globalPeriodId		= { globalPeriodId }
						/>
					) : (
						<OfferTable
							fields				= { fields }
							form				= { form }
							removeOffer			= { removeOffer }
							globalSubjectId		= { globalSubjectId }
							globalPeriodId		= { globalPeriodId }
						/>
					)}

					{/* Barra de estado sticky */}
					<div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border p-4 mt-4">
						<div className="flex flex-col md:flex-row items-center justify-between gap-4">
							{/* Estadísticas */}
							<div className="flex flex-wrap items-center gap-4 text-sm">
								{/* Total de ofertas */}
								<div className="flex items-center gap-2">
									<Hash className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Total:</span>
									<span className="text-muted-foreground">{ offersStats.totalOffers }</span>
								</div>

								{/* Ofertas completadas */}
								<div className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-green-500" />
									<span className="font-medium">Completadas:</span>
									<span className="text-green-600">{ offersStats.completedOffers }</span>
								</div>

								{/* Ofertas incompletas */}
								<div className="flex items-center gap-2">
									<AlertCircle className="h-4 w-4 text-orange-500" />
									<span className="font-medium">Incompletas:</span>
									<span className="text-orange-600">{ offersStats.incompleteOffers }</span>
								</div>

								{/* Total de secciones a crear */}
								<div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-md">
									<Save className="h-4 w-4 text-primary" />
									<span className="font-medium">Secciones a crear:</span>
									<span className="text-primary font-bold">{ offersStats.totalSectionsToCreate }</span>
								</div>
							</div>

							{/* Botones de acción */}
							<div className="flex items-center gap-2">
								{/* Botón de limpiar ofertas */}
								<Button
									type		= "button"
									variant		= "destructive"
									disabled	= { createBulkOfferSubjectMutation.isPending || fields.length === 0 }
									className	= "flex items-center gap-2"
									size		= "lg"
									onClick		= {() => {
										form.reset({ offers: [ emptyOffer ]});
									}}
								>
									<Trash2 className="h-5 w-5" />
									Limpiar Todo
								</Button>

								{/* Botón de crear ofertas */}
								<Button
									type		= "submit"
									disabled	= { createBulkOfferSubjectMutation.isPending || fields.length === 0 || offersStats.completedOffers === 0 }
									className	= "flex items-center gap-2 min-w-[200px]"
									size		= "lg"
								>
									<Save className="h-5 w-5" />
									{ createBulkOfferSubjectMutation.isPending
										? `Creando ${offersStats.totalSectionsToCreate} Secciones...`
										: `Crear ${offersStats.completedOffers} Oferta${offersStats.completedOffers !== 1 ? 's' : ''}`
									}
								</Button>
							</div>
						</div>
					</div>
				</form>
			</Form>

			{/* Dialog para subir archivo de ofertas */}
			<Dialog open={ isUploadDialogOpen } onOpenChange={ setIsUploadDialogOpen }>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Subir Archivo de Ofertas</DialogTitle>
					</DialogHeader>

					<SubjectUpload
						service		= "offer"
						isUploading	= { false }
						onSuccess	= {( offers ) => {
							setIsUploadDialogOpen( false );
							const groupIds = getUniqueGroupIds( offers );
							router.push(`/sections?groupId=${groupIds}`);
						}}
					/>
				</DialogContent>
			</Dialog>
		</PageLayout>
	);
}
