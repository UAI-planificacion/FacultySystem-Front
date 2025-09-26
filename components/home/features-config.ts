import { 
	Building, 
	Calendar, 
	CalendarClock, 
	Clock, 
	GraduationCap, 
	Grid2X2, 
	Ruler, 
	UsersRound 
} from "lucide-react";


export interface FeatureConfig {
	id          : string;
	icon        : any;
	title       : string;
	description : string;
	href        : string;
}


/**
 * Configuration for all feature cards displayed on the home page
 */
export const featuresConfig: FeatureConfig[] = [
	{
		id          : 'faculties',
		icon        : Building,
		title       : 'Gestión de Facultades',
		description : 'Crea y gestiona facultades con información detallada y seguimiento.',
		href        : '/faculties'
	},
	{
		id          : 'modules',
		icon        : Clock,
		title       : 'Gestión de Módulos',
		description : 'Administra módulos horarios y su disponibilidad por días.',
		href        : '/modules'
	},
	{
		id          : 'days',
		icon        : Calendar,
		title       : 'Gestión de Días',
		description : 'Configura y edita los días de la semana académica.',
		href        : '/days'
	},
	{
		id          : 'periods',
		icon        : CalendarClock,
		title       : 'Gestión de Períodos',
		description : 'Administra períodos académicos con fechas de inicio y fin.',
		href        : '/periods'
	},
	{
		id          : 'sizes',
		icon        : Ruler,
		title       : 'Gestión de Tamaños',
		description : 'Define tamaños de espacios y sus características.',
		href        : '/sizes'
	},
	{
		id          : 'professors',
		icon        : UsersRound,
		title       : 'Gestión de Profesores',
		description : 'Administra el personal docente y sus asignaciones.',
		href        : '/professors'
	},
	{
		id          : 'grades',
		icon        : GraduationCap,
		title       : 'Gestión de Grados',
		description : 'Configura grados académicos y niveles educativos.',
		href        : '/grades'
	},
	{
		id          : 'sections',
		icon        : Grid2X2,
		title       : 'Gestión de Secciones',
		description : 'Organiza secciones de cursos y su distribución.',
		href        : '/sections'
	}
];
