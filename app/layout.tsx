import type { Metadata } from 'next';

import './globals.css';

import { QueryProvider }    from '@/app/query-provider';

import {
    SidebarProvider,
    SidebarInset
}                           from '@/components/ui/sidebar';
import { ThemeProvider }    from '@/components/theme-provider';
import Header               from '@/components/header/Header';
import { Footer }           from '@/components/footer';
import { Toaster }          from '@/components/ui/sonner';
import { AppSidebar }       from '@/components/navigation/app-sidebar';


export const metadata: Metadata = {
	title       : 'Sistema de Facultades',
	description : 'Sistema de Facultades',
	icons       : {
		icon        : '/favicon.ico',
		shortcut    : '/favicon.ico',
		apple       : '/favicon.ico',
	},
};


export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es" suppressHydrationWarning={ true }>
			<body>
				<QueryProvider>
					<ThemeProvider
						attribute       = "class"
						defaultTheme    = "system"
						enableSystem 
					>
						<SidebarProvider>
							<AppSidebar />
						
							<SidebarInset className="flex flex-col min-h-screen">
								<Header />

								<main className="flex-1 p-6">
									{ children }
								</main>

								<Footer />
							</SidebarInset>
						</SidebarProvider>

						<Toaster />
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
