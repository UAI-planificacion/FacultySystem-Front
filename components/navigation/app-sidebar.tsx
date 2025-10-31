'use client'

import { useRouter, usePathname }   from "next/navigation";
import Image                        from "next/image";

import { 
	Building, 
	Calendar, 
	CalendarClock, 
	Clock, 
	GraduationCap, 
	Grid2X2, 
	Home, 
	Ruler, 
	UsersRound,
	ChevronLeft,
    Album,
    BookOpen,
    CalendarCog
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
}                   from "@/components/ui/sidebar";
import { Button }   from "@/components/ui/button";

import { useSession } from "@/hooks/use-session";


interface NavigationItem {
	id      : string;
	title   : string;
	url     : string;
	icon    : any;
}


const navigationItems: NavigationItem[] = [
    {
		id      : 'home',
		title   : 'Inicio',
		url     : '/',
		icon    : Home,
	},
    {
		id      : 'periods',
		title   : 'Períodos',
		url     : '/periods',
		icon    : CalendarClock,
	},
    {
		id      : 'days',
		title   : 'Días',
		url     : '/days',
		icon    : Calendar,
	},
	{
		id      : 'modules',
		title   : 'Módulos',
		url     : '/modules',
		icon    : Clock,
	},
	{
		id      : 'sizes',
		title   : 'Tamaños',
		url     : '/sizes',
		icon    : Ruler,
	},
    {
		id      : 'subjects',
		title   : 'Asignaturas',
		url     : '/subjects',
		icon    : BookOpen,
	},
	{
		id      : 'professors',
		title   : 'Profesores',
		url     : '/professors',
		icon    : UsersRound,
	},
	{
		id      : 'grades',
		title   : 'Grados',
		url     : '/grades',
		icon    : GraduationCap,
	},
    {
		id      : 'faculties',
		title   : 'Facultades',
		url     : '/faculties',
		icon    : Building,
	},
	{
		id      : 'offers',
		title   : 'Ofertas',
		url     : '/offers',
		icon    : Album,
	},
	{
		id      : 'sections',
		title   : 'Secciones',
		url     : '/sections',
		icon    : Grid2X2,
	},
    {
        id : 'planning-change',
        title : 'Cambio de Plan',
        url : '/planning-change',
        icon : CalendarCog,
    }
];


/**
 * Application sidebar component with navigation menu
 */
export function AppSidebar() {
	const router            = useRouter();
	const pathname          = usePathname();
	const { staff }         = useSession();
	const { toggleSidebar } = useSidebar();


	function handleNavigation( url: string ): void {
		if ( staff || url === '/' ) {
			router.push( url );
		}
	};


	function isActive( url: string ): boolean {
		if ( url === '/' ) {
			return pathname === '/';
		}

        return pathname.startsWith( url );
	};


	return (
		<Sidebar 
			variant     = "sidebar" 
			collapsible = "icon"
			className   = "border-r border-zinc-800"
		>
			<SidebarHeader className="bg-black border-b border-zinc-800">
				<div className="flex items-center justify-between px-2 py-2 h-[3.75rem]">
					<div className="flex items-center gap-2">
						<Image
							src         = "https://mailing20s.s3.amazonaws.com/templtates/logosinescudo.png"
							alt         = "UAI Logo"
							width       = { 32 }
							height      = { 32 }
							className   = "rounded"
						/>

						<div className="flex flex-col group-data-[collapsible=icon]:hidden">
							<span className="text-sm font-semibold text-white">UAI</span>
							<span className="text-sm text-zinc-400">Adminitrador</span>
						</div>
					</div>

					<Button
						variant     = "ghost"
						size        = "icon"
						onClick     = { toggleSidebar }
						className   = "h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800 group-data-[collapsible=icon]:hidden"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
				</div>
			</SidebarHeader>

			<SidebarContent className="bg-black">
				<SidebarGroup>
					<SidebarGroupLabel className="text-sm text-zinc-400 group-data-[collapsible=icon]:hidden">
						Navegación
					</SidebarGroupLabel>

					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map( ( item ) => {
								const Icon = item.icon;
								const active = isActive( item.url );
								const disabled = !staff && item.url !== '/';

								return (
									<SidebarMenuItem key={ item.id }>
										<SidebarMenuButton
											onClick     = { () => handleNavigation( item.url ) }
											isActive    = { active }
											disabled    = { disabled }
											tooltip     = { disabled ? 'Requiere autenticación' : item.title }
											className   = {`
												${disabled ? 'opacity-50 cursor-not-allowed text-zinc-500' : 'cursor-pointer text-zinc-300 hover:text-white hover:bg-zinc-800'}
												${active ? 'bg-zinc-800 text-white font-medium' : ''}
												transition-colors duration-200
											`}
										>
											<Icon className="h-4 w-4" />
											<span>{ item.title }</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="bg-black border-t border-zinc-800 h-[4.6rem]">
				<div className="px-2 py-2">
					<p className="text-sm text-zinc-300 text-center group-data-[collapsible=icon]:hidden">
						Sistema Administrador
					</p>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
