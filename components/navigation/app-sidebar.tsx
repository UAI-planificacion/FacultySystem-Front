'use client'

import { useRouter, usePathname }   from "next/navigation";
import Image                        from "next/image";

import { ChevronLeft } from "lucide-react";

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
}                           from "@/components/ui/sidebar";
import { Button }           from "@/components/ui/button";
import { featuresConfig }   from "@/components/home/features-config";

import { useSession } from "@/hooks/use-session";

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
							{featuresConfig.map( ( item ) => {
								const Icon      = item.icon;
								const active    = isActive( item.url );
								const disabled  = !staff && item.url !== '/';

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
											<span>{ item.titleShort }</span>
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
