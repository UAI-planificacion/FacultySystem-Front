'use client'

import { JSX } from "react";
import { UseFormReturn, FieldArrayWithId } from "react-hook-form";

import { Trash2 } from "lucide-react";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OfferFormFields } from "@/components/offer/offer-form-fields";


interface Props {
	fields				: FieldArrayWithId<any, "offers", "id">[];
	form				: UseFormReturn<any>;
	removeOffer			: ( index: number ) => void;
	globalSubjectId		: string | null;
	globalPeriodId		: string | null;
}


export function OfferList({
	fields,
	form,
	removeOffer,
	globalSubjectId,
	globalPeriodId,
}: Props ): JSX.Element {
	return (
		<ScrollArea className="h-[calc(100vh-25rem)]">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{fields.map(( field, index ) => (
					<Card key={ field.id } className="relative">
						<CardHeader className="pb-3">
							<div className="flex justify-between items-center">
								<CardTitle className="text-lg">
									Oferta #{index + 1}
								</CardTitle>

								{ fields.length > 1 && (
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
								facultyId			= { null }
								index				= { index }
								fieldPrefix			= { `offers.${index}` }
								control				= { form.control }
								watch				= { form.watch }
								setValue			= { form.setValue }
								getValues			= { form.getValues }
								isEnabled			= { true }
								subjectId			= { globalSubjectId }
								periodId			= { globalPeriodId }
							/>
						</CardContent>
					</Card>
				))}
			</div>
		</ScrollArea>
	);
}