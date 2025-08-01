'use client'

import { useEffect, useState }  from "react";
import { useRouter }            from "next/navigation";

import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
}                                       from "@/components/ui/menubar";
import { Theme }                        from "@/components/header/Theme";
import { Login }                        from "@/components/auth/Login";
import { AlertMessage }                 from "@/components/dialog/Alert";
import { Notifications }                from "@/components/header/Notifications";
import { NotificationDialogManager }    from "@/components/header/NotificationDialogManager";

import { useSSE } from "@/hooks/use-sse";


export default function Header() {
    useSSE();
    const router = useRouter();
    const [showAuthMessage, setShowAuthMessage] = useState( false );

    useEffect(() => {
        const urlParams = new URLSearchParams( window.location.search );

        if ( urlParams.get( 'requireAuth' ) === 'true' ) {
            const newUrl = new URL( window.location.href );

            newUrl.searchParams.delete( 'requireAuth' );

            window.history.replaceState( {}, '', newUrl.toString() );
        }
    }, []);


    return (
        <>
            <header className="bg-black py-4 border-b border-gray-200 dark:border-gray-800 transition-colors">
                <div className="flex justify-between items-center container mx-auto gap-2 px-4">
                    <h1 className="text-xl xl:text-2xl font-bold text-white">Facultades académicas</h1>

                    <div className="flex items-center gap-2">
                        {/* *Hay que validar que el usuario esté autenticado */}
                        <Menubar className="hidden md:flex bg-black text-white border-zinc-700">
                            <MenubarMenu>
                                <MenubarTrigger
                                    onClick = {() => router.push( '/faculties' )}
                                    id      = "faculty"
                                >
                                    <span className="hidden xl:block">Facultades</span>
                                </MenubarTrigger>
                            </MenubarMenu>

                            <MenubarMenu>
                                <MenubarTrigger
                                    onClick = {() => router.push( '/professors' )}
                                    id      = "professor"
                                >
                                    <span className="hidden xl:block">Profesores</span>
                                </MenubarTrigger>
                            </MenubarMenu>
                        </Menubar>

                        <Login />

                        <NotificationDialogManager>
                            {({ onRequestClick, onRequestDetailClick }) => (
                                <Notifications
                                    onRequestClick          = { onRequestClick }
                                    onRequestDetailClick    = { onRequestDetailClick }
                                />
                            )}
                        </NotificationDialogManager>

                        <Theme />
                    </div>
                </div>
            </header>

            {showAuthMessage && (
                <AlertMessage
                    title="Debes iniciar sesión para acceder a esta página."
                    onClose={() => setShowAuthMessage(false)}
                />
            )}
        </>
    );
}
