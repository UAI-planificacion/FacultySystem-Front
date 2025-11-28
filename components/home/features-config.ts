import { 
    Album,
    BookCopy,
    BookOpen,
	Building, 
	Calendar, 
	CalendarClock, 
	CalendarCog, 
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
    titleShort  : string;
	description : string;
	url         : string;
}

/**
 * Configuration for all feature cards displayed on the home page
 */
export const featuresConfig: FeatureConfig[] = [
    {
		id          : 'periods',
		icon        : CalendarClock,
		title       : 'Gestión de Períodos',
        titleShort  : 'Períodos',
		description : 'Administra períodos académicos con fechas de inicio y fin.',
		url         : '/periods'
	},
    {
		id          : 'days',
		icon        : Calendar,
		title       : 'Gestión de Días',
        titleShort  : 'Días',
		description : 'Configura y edita los días de la semana académica.',
		url         : '/days'
	},
    {
		id          : 'modules',
		icon        : Clock,
		title       : 'Gestión de Módulos',
        titleShort  : 'Módulos',
		description : 'Administra módulos horarios y su disponibilidad por días.',
		url         : '/modules'
	},
    {
		id          : 'sizes',
		icon        : Ruler,
		title       : 'Gestión de Tamaños',
        titleShort  : 'Tamaños',
		description : 'Define tamaños de espacios y sus características.',
		url         : '/sizes'
	},
    {
        id          : 'subjects',
        icon        : BookOpen,
        title       : 'Gestión de Asignaturas',
        titleShort  : 'Asignaturas',
        description : 'Administra las asignaturas.',
        url         : '/subjects'
    },
    {
		id          : 'professors',
		icon        : UsersRound,
		title       : 'Gestión de Profesores',
        titleShort  : 'Profesores',
		description : 'Administra el personal docente y sus asignaciones.',
		url         : '/professors'
	},
    {
		id          : 'grades',
		icon        : GraduationCap,
		title       : 'Gestión de Unidades Académicas',
        titleShort  : 'Unidades Académicas',
		description : 'Configura unidades académicas y niveles educativos.',
		url         : '/grades'
	},
	{
		id          : 'faculties',
		icon        : Building,
		title       : 'Gestión de Facultades',
        titleShort  : 'Facultades',
		description : 'Crea y gestiona facultades con información detallada y seguimiento.',
		url         : '/faculties'
	},
	{
        id          : 'offers',
        icon        : Album,
        title       : 'Gestión de Ofertas',
        titleShort  : 'Ofertas',
        description : 'Administra las ofertas académicas.',
        url         : '/offers'
    },
	{
		id          : 'sections',
		icon        : Grid2X2,
		title       : 'Gestión de Secciones',
        titleShort  : 'Secciones',
		description : 'Organiza secciones de cursos y su distribución.',
		url         : '/sections'
	},
    {
        id          : 'requests',
        icon        : BookCopy,
        title       : 'Gestión de Solicitudes',
        titleShort  : 'Solicitudes',
        description : 'Administra las solicitudes de la facultad.',
        url         : '/requests'
    },
    {
        id          : 'planning-change',
        icon        : CalendarCog,
        title       : 'Gestión Cambio de planificación',
        titleShort  : 'Cambio de Plan.',
        description : 'Administra los cambios de planificación de la facultad.',
        url         : '/planning-change'
    },
];
