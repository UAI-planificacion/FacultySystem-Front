'use client'

import { JSX } from "react";
import { UseFormReturn, FieldArrayWithId } from "react-hook-form";

import { Trash2 } from "lucide-react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getBuildingName, getSpaceType, tempoFormat } from "@/lib/utils";


interface Props {
	fields				: FieldArrayWithId<any, "offers", "id">[];
	form				: UseFormReturn<any>;
	removeOffer			: ( index: number ) => void;
	globalSubjectId		: string | null;
	globalPeriodId		: string | null;
}


export function OfferTable({
	fields,
	form,
	removeOffer,
	globalSubjectId,
	globalPeriodId,
}: Props ): JSX.Element {
	return (
		<ScrollArea className="h-[calc(100vh-25rem)]">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Asignatura</TableHead>
						<TableHead>Período</TableHead>
						<TableHead>Profesor</TableHead>
						<TableHead>Edificio</TableHead>
						<TableHead>Tipo</TableHead>
						<TableHead>Tamaño</TableHead>
						<TableHead className="text-center">N° Secciones</TableHead>
						<TableHead>Sesiones</TableHead>
						<TableHead>Fecha Inicio</TableHead>
						<TableHead>Fecha Fin</TableHead>
						<TableHead></TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{fields.map(( field, index ) => {
						const offer = form.watch( `offers.${index}` );

						return (
							<TableRow key={ field.id }>
								{/* Asignatura */}
								<TableCell className="font-medium">
									{ offer.subjectId || "-" }
								</TableCell>

								{/* Período */}
								<TableCell>
									{ offer.periodId || "-" }
								</TableCell>

								{/* Profesor */}
								<TableCell>
									{ offer.professorId || "-" }
								</TableCell>

								{/* Edificio */}
								<TableCell>
									{ offer.building ? getBuildingName( offer.building ) : "-" }
								</TableCell>

								{/* Tipo */}
								<TableCell>
									{ offer.spaceType ? getSpaceType( offer.spaceType ) : "-" }
								</TableCell>

								{/* Tamaño */}
								<TableCell>
									{ offer.spaceSizeId || "-" }
								</TableCell>

								{/* N° Secciones */}
								<TableCell className="text-center">
									{ offer.numberOfSections || 0 }
								</TableCell>

								{/* Sesiones */}
								<TableCell>
									<div className="flex gap-1.5 flex-wrap">
										{ offer.lecture > 0 && (
											<Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500">
												C{ offer.lecture }
											</Badge>
										)}
										{ offer.tutoringSession > 0 && (
											<Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500">
												A{ offer.tutoringSession }
											</Badge>
										)}
										{ offer.workshop > 0 && (
											<Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500">
												T{ offer.workshop }
											</Badge>
										)}
										{ offer.laboratory > 0 && (
											<Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500">
												L{ offer.laboratory }
											</Badge>
										)}
										{ !offer.lecture && !offer.tutoringSession && !offer.workshop && !offer.laboratory && (
											<span className="text-muted-foreground text-sm">-</span>
										)}
									</div>
								</TableCell>

								{/* Fecha Inicio */}
								<TableCell>
									{ offer.startDate 
										? tempoFormat( offer.startDate )
										: "-"
									}
								</TableCell>

								{/* Fecha Fin */}
								<TableCell>
									{ offer.endDate 
										? tempoFormat( offer.endDate )
										: "-"
									}
								</TableCell>

								{/* Acciones */}
								<TableCell>
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
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</ScrollArea>
	);
}