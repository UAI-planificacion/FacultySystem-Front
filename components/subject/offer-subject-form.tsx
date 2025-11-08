'use client'

import { JSX, useEffect }   from "react";
import { useForm }			from "react-hook-form";
import { useRouter }		from "next/navigation";

import {
	useMutation,
	useQueryClient
}						from "@tanstack/react-query";
import { toast }		from "sonner";
import { zodResolver }  from "@hookform/resolvers/zod";
import { z }			from "zod";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
}							from "@/components/ui/dialog";
import { Form }				from "@/components/ui/form";
import { Button }			from "@/components/ui/button";
import { OfferFormFields }  from "@/components/offer/offer-form-fields";
import { offerSchema }      from "@/components/offer/offer-schema";

import { CreateOfferSubject, Subject }	from "@/types/subject.model";
import { KEY_QUERYS }					from "@/consts/key-queries";
import { Method, fetchApi }				from "@/services/fetch";
import { errorToast, successToast }		from "@/config/toast/toast.config";


type OfferSubjectFormValues = z.infer<typeof offerSchema>;


interface Props {
	facultyId   : string;
	subject?    : Subject;
	isOpen	    : boolean;
	onClose	    : () => void;
}

/**
 * API call to create offer subjects
 */
const createOfferSubjectApi = async ( dataFrom: CreateOfferSubject ): Promise<any[]> =>
	fetchApi<any[]>({
		url		: 'sections/offer',
		method	: Method.POST,
		body	: dataFrom
	});


const emptyOfferSubject = ( subject: Subject | undefined ): OfferSubjectFormValues => {
	return {
		periodId			: "",
		professorId			: "",
		numberOfSections	: 1,
		startDate			: new Date(),
		endDate				: new Date(),
		subjectId			: subject?.id				|| "",
		spaceType			: subject?.spaceType		|| "",
		spaceSizeId			: subject?.spaceSizeId		|| "",
		building			: null,
		workshop			: subject?.workshop			|| 0,
		lecture				: subject?.lecture			|| 0,
		tutoringSession		: subject?.tutoringSession	|| 0,
		laboratory			: subject?.laboratory		|| 0,
        quota				: subject?.quota			|| 1,
	};
};


const validString = (
	value: string | undefined | null
): string | null  => value ?? null;


const validBuilding = (
	value: string | undefined | null
): any  => value ?? null;


export function OfferSubjectForm({
	facultyId,
	subject,
	isOpen,
	onClose,
}: Props): JSX.Element {
	const router		= useRouter();
	const queryClient	= useQueryClient();
	const form			= useForm<OfferSubjectFormValues>({
		resolver		: zodResolver( offerSchema ),
		defaultValues	: emptyOfferSubject( subject ),
	});


    useEffect(() => {
		form.reset( emptyOfferSubject( subject ));
	}, [ subject, form, isOpen ]);

	/**
	 * Mutation to create offer subjects
	 */
	const createOfferSubjectMutation = useMutation<any[], Error, CreateOfferSubject>({
		mutationFn: createOfferSubjectApi,
		onSuccess: ( createdOffers ) => {
			queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.SECTIONS ]});
			onClose();
			form.reset();
			router.push(`/sections?groupId=${createdOffers[0].groupId}`);

			toast( `${createdOffers.length} ofertas creadas exitosamente`, successToast );
		},
		onError: ( mutationError ) => {
			toast( `Error al crear ofertas: ${mutationError.message}`, errorToast );
		},
	});


	const handleSubmit = (data: OfferSubjectFormValues) => {
		const transformedData: CreateOfferSubject = {
			...data,
			professorId	: validString( data.professorId ),
			spaceType	: validString( data.spaceType ),
			spaceSizeId	: validString( data.spaceSizeId ),
			building	: validBuilding( data.building ),
		};

		createOfferSubjectMutation.mutate( transformedData );
	};


	const hasSelectedSubject	= !!form.watch( 'subjectId' );
	const hasSelectedPeriod		= !!form.watch( 'periodId' );
	const hasStartDate			= !!form.watch( 'startDate' );
	const hasEndDate			= !!form.watch( 'endDate' );


    return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Ofertar Asignatura</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={ form.handleSubmit( handleSubmit )} className="space-y-4">
						{/* Componente reutilizable de campos */}
						<OfferFormFields
							facultyId			= { facultyId }
							index				= { 0 }
							fieldPrefix			= ""
							control				= { form.control }
							watch				= { form.watch }
							setValue			= { form.setValue }
							getValues			= { form.getValues }
							isEnabled			= { isOpen }
						/>

						{/* Botones */}
						<DialogFooter className="flex justify-between gap-4 border-t pt-4">
							<Button
								type		= "button"
								variant		= "outline"
								onClick		= { onClose }
							>
								Cancelar
							</Button>

							<Button
								type		= "submit"
								disabled	= { !hasSelectedSubject || !hasSelectedPeriod || !hasStartDate || !hasEndDate || createOfferSubjectMutation.isPending }
							>
								{ createOfferSubjectMutation.isPending
									? 'Creando Ofertas...'
									: 'Crear Ofertas'
								}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
