'use client'

import { JSX }                          from "react";
import { useRouter, useSearchParams }   from "next/navigation";
import { useForm, useFieldArray }       from "react-hook-form";

import { useMutation, useQueryClient }  from "@tanstack/react-query";
import { Plus, Save, Trash2, Upload }   from "lucide-react";
import { toast }                        from "sonner";
import { zodResolver }                  from "@hookform/resolvers/zod";
import { z }                            from "zod";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                                   from "@/components/ui/card";
import { Form}                      from "@/components/ui/form";
import { Button }                   from "@/components/ui/button";
import { PageLayout }               from "@/components/layout/page-layout";
import { OfferFormFields }          from "@/components/offer/offer-form-fields";
import { bulkOfferSchema }   from "@/components/offer/offer-schema";
import { ScrollArea }               from "@/components/ui/scroll-area";

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

export default function OffersPage(): JSX.Element {
	const queryClient	= useQueryClient();
	const router		= useRouter();
	const searchParams	= useSearchParams();
	const form			= useForm<BulkOfferSubjectFormValues>({
		resolver		: zodResolver( bulkOfferSchema ),
		defaultValues	: {
			offers		: [ emptyOffer ],
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
				// facultyId	: form.getValues( 'facultyId' ),
				offers		: [ emptyOffer ],
			});
			// TODO: mejorar navegación
			// router.push(`/sections?subject=${createdOffers[0].subjectId}`);

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
		append( emptyOffer );
	};


	const removeOffer = ( index: number ) => {
		if ( fields.length > 1 ) {
			remove( index );
		}
	};


	// const facultyId = form.watch( 'facultyId' );


	return (
		<PageLayout title="Ofertar Asignaturas (Modo Masivo)">
			<Form {...form}>
				<form onSubmit={ form.handleSubmit( handleSubmit )} className="space-y-6">
					{/* Botones para agregar ofertas */}
					<div className="flex justify-between items-center">
						<Button
							type		= "button"
							variant		= "outline"
							onClick		= { addOffer }
							className	= "flex items-center gap-2"
						>
							<Plus className="h-4 w-4" />
							Agregar Oferta
						</Button>

                        <div className="flex gap-2">
                            <Button
                                type		= "button"
                                className	= "flex items-center gap-2"
                            >
                                <Upload className="h-4 w-4" />

                                Subir Archivo
                            </Button>

                            <Button
                                type		= "submit"
                                disabled	= { createBulkOfferSubjectMutation.isPending || fields.length === 0  }
                                className	= "flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                { createBulkOfferSubjectMutation.isPending
                                    ? `Creando ${fields.length} Ofertas...`
                                    : `Crear ${fields.length} Oferta${fields.length > 1 ? 's' : ''}`
                                }
                            </Button>
                        </div>
					</div>

					{/* Lista de ofertas */}
                    <ScrollArea className="h-[calc(100vh-25rem)]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {fields.map(( field, index ) => (
                                <Card key={ field.id } className="relative">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg">
                                                Oferta #{index + 1}
                                            </CardTitle>

                                            {fields.length > 1 && (
                                                <Button
                                                    type		= "button"
                                                    variant		= "ghost"
                                                    size		= "icon"
                                                    onClick		= {() => removeOffer( index )}
                                                    className	= "h-8 w-8 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <OfferFormFields
                                            facultyId			= { '' }
                                            index				= { index }
                                            fieldPrefix			= { `offers.${index}` }
                                            control				= { form.control }
                                            watch				= { form.watch }
                                            setValue			= { form.setValue }
                                            getValues			= { form.getValues }
                                            isEnabled			= { true }
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
				</form>
			</Form>
		</PageLayout>
	);
}
