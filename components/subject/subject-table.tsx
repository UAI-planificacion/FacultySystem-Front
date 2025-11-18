"use client"

import { Album } from "lucide-react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}                               from "@/components/ui/table";
import {
	SubjectTableSkeleton,
	SubjectErrorMessage
}                               from "@/components/subject/subject-table-skeleton";
import { Button }               from "@/components/ui/button";
import { ScrollArea }           from "@/components/ui/scroll-area";
import { Card, CardContent }    from "@/components/ui/card";
import { ActionButton }         from "@/components/shared/action";
import { ActiveBadge }          from "@/components/shared/active";
import { SpaceSizeType }        from "@/components/shared/space-size-type";
import { SessionShort }         from "@/components/session/session-short";


import { Subject } from "@/types/subject.model";


interface SubjectTableProps {
	subjects			: Subject[];
	isLoading			: boolean;
	isError				: boolean;
	searchQuery			: string;
	onEdit				: ( subject: Subject ) => void;
	onDelete			: ( subject: Subject ) => void;
	onOfferSubject		: ( subject: Subject ) => void;
	showFacultyColumn?	: boolean;
}


export function SubjectTable({
	subjects,
	isLoading,
	isError,
	searchQuery,
	onEdit,
	onDelete,
	onOfferSubject,
	showFacultyColumn = false
}: SubjectTableProps ) {
	return (
		<Card>
			<CardContent className="mt-5">
				{ subjects?.length === 0 && !isLoading && !isError ? (
					<div className="text-center p-8 text-muted-foreground">
						No se han agregado asignaturas.
					</div>
				) : (
					<div>
						<Table>
							<TableHeader className="sticky top-0 z-10 bg-background">
								<TableRow>
									<TableHead className="bg-background w-[120px]">Sigla</TableHead>
									<TableHead className="bg-background w-[370px]">Nombre</TableHead>
									{ showFacultyColumn && (
										<TableHead className="bg-background w-[200px] text-start">Facultad</TableHead>
									)}
									<TableHead className="bg-background w-[140px] text-start">Espacio</TableHead>
									<TableHead className="bg-background w-[170px] text-start">Sesiones</TableHead>
									<TableHead className="bg-background w-[100px] text-start">Grado</TableHead>
									<TableHead className="bg-background w-[100px] text-start">Cupo</TableHead>
									<TableHead className="bg-background w-[100px] text-start">Estado</TableHead>
									<TableHead className="bg-background w-[120px] text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>
						</Table>

						{ isError ? (
							<SubjectErrorMessage />
						) : isLoading ? (
							<SubjectTableSkeleton rows={ 10 } />
						) : (
							<ScrollArea className="h-[calc(100vh-555px)]">
								<Table>
									<TableBody>
										{ subjects.map(( subject ) => (
											<TableRow key={ subject.id }>
												{/* Sigla */}
												<TableCell className="font-medium w-[120px] truncate">
													{ subject.id }
												</TableCell>

												{/* Nombre */}
												<TableCell
													className	= "w-[400px] truncate"
													title		= { subject.name }
												>
													{ subject.name }
												</TableCell>

												{/* Facultad (solo si showFacultyColumn es true) */}
												{ showFacultyColumn && (
													<TableCell
														className	= "w-[200px] truncate"
														title		= { subject.facultyId }
													>
														{ subject.faculty.name || '-' }
													</TableCell>
												)}

												{/* Espacio */}
												<TableCell className="w-[140px]">
													<div className="flex justify-end">
														<SpaceSizeType
															spaceType	= { subject.spaceType }
															spaceSizeId	= { subject.spaceSizeId }
														/>
													</div>
												</TableCell>

												{/* Sesiones */}
												<TableCell className="w-[170px]">
													<div className="flex justify-center">
														<SessionShort
															showZero		= { true }
															sessionCounts	= {{
																C: subject.lecture,
																T: subject.workshop,
																A: subject.tutoringSession,
																L: subject.laboratory,
															}}
														/>
													</div>
												</TableCell>

												{/* Grado */}
												<TableCell className="w-[100px]">
													<div className="flex justify-center">
														{ subject.grade?.name }
													</div>
												</TableCell>

                                                {/* Cupo */}
                                                <TableCell className="w-[100px]">
                                                    <div className="flex justify-center">
                                                        { subject.quota ?? '-' }
                                                    </div>
                                                </TableCell>

												{/* Estado */}
												<TableCell className="w-[100px] text-end">
													<ActiveBadge isActive={ subject.isActive } />
												</TableCell>

												{/* Acciones */}
												<TableCell className="w-[120px] text-right">
													<div className="flex gap-2 items-center justify-end">
														<Button
															title		= "Ofertas"
															size		= "sm"
															variant		= "outline"
															className	= "flex items-center gap-1.5"
															onClick		= { () => onOfferSubject( subject ) }
														>
															{ subject.offersCount }
															<Album className="h-4 w-4" />
														</Button>

														<ActionButton
															editItem	= { () => onEdit( subject )}
															deleteItem	= { () => onDelete( subject )}
															item		= { subject }
														/>
													</div>
												</TableCell>
											</TableRow>
										))}

										{ subjects.length === 0 && searchQuery ? (
											<TableRow>
												<TableCell colSpan={ showFacultyColumn ? 8 : 7 } className="h-24 text-center">
													No se encontraron resultados para &quot;{ searchQuery }&quot;
												</TableCell>
											</TableRow>
										) : subjects.length === 0 && !searchQuery ? (
											<TableRow>
												<TableCell colSpan={ showFacultyColumn ? 8 : 7 } className="h-24 text-center">
													No hay asignaturas registradas
												</TableCell>
											</TableRow>
										) : null}
									</TableBody>
								</Table>
							</ScrollArea>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
