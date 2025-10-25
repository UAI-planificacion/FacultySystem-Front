import { z } from "zod";

export const offerSubjectSchema = z.object({
	subjectId       : z.string().min(1, "Debe seleccionar una asignatura"),
	periodId        : z.string().min(1, "Debe seleccionar un período"),
	professorId     : z.string().nullable().optional(),
	numberOfSections: z.number()
        .min(1, "El número de secciones debe ser mayor o igual a 1")
        .max(100, "El número de secciones no puede ser mayor a 100"),
	spaceType       : z.string().nullable().optional(),
	spaceSizeId     : z.string().nullable().optional(),
	building        : z.string().nullable().optional(),
	workshop        : z.number()
        .min(0, "El taller debe ser mayor o igual a 0")
        .max(100, "El taller no puede ser mayor a 100"),
	lecture: z.number()
        .min(0, "La conferencia debe ser mayor o igual a 0")
        .max(100, "La conferencia no puede ser mayor a 100"),
	tutoringSession : z.number()
        .min(0, "La sesión tutorial debe ser mayor o igual a 0")
        .max(100, "La sesión tutorial no puede ser mayor a 100"),
	laboratory: z.number()
        .min(0, "El laboratorio debe ser mayor o igual a 0")
        .max(100, "El laboratorio no puede ser mayor a 100"),
	startDate: z.date({ required_error: "La fecha de inicio es requerida" })
        .refine(( date ) => date !== null, {
            message: "La fecha de inicio es requerida"
        }),
	endDate: z.date({ required_error: "La fecha de fin es requerida" })
        .refine(( date ) => date !== null, {
            message: "La fecha de fin es requerida"
        }),
}).refine(( data ) => {
	if ( data.startDate && data.endDate ) {
		return data.endDate > data.startDate;
	}
	return true;
}, {
	message : "La fecha de fin debe ser posterior a la fecha de inicio",
	path    : ["endDate"]
}).refine(( data ) => {
    const { workshop, lecture, tutoringSession, laboratory } = data;

    return workshop > 0 || lecture > 0 || tutoringSession > 0 || laboratory > 0;
}, {
    message : "Al menos una sesión debe ser mayor que 0",
    path    : [ "workshop" ],
});
