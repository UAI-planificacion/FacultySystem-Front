'use client'

import { useEffect, useState }  from "react";
import { useRouter }            from "next/navigation";
import Image                    from "next/image";

import { Building, Calendar, CalendarClock, Clock, GraduationCap, Grid2X2, Ruler, UsersRound } from "lucide-react";

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

import { useSSE }       from "@/hooks/use-sse";
import { useSession }   from "@/hooks/use-session";


export default function Header() {
    useSSE();
    const router                                = useRouter();
    const { staff }                             = useSession();
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
            <header className="bg-black py-2 border-b border-gray-200 dark:border-gray-800 transition-colors">
                <div className="flex justify-between items-center container mx-auto gap-2 px-5">

                    <div className="flex items-center gap-3">
                        <a href="#">
                            <span className="sr-only">Universidad Adolfo Ibáñez</span>

                            <Image
                                title       = "UAI"
                                src         = "https://mailing20s.s3.amazonaws.com/templtates/logosinescudo.png"
                                alt         = "logo uai"
                                width       = {137}
                                height      = {50}
                            />
                        </a>

                        <h1 className="hidden sm:flex text-2xl sm:text-xl lg:text-2xl xl:hidden 2xl:flex 2xl:text-3xl font-bold text-white">
                            Facultades Académicas
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {staff && (<>
                            <Menubar className="hidden lg:flex bg-black text-white border-zinc-700">
                                <MenubarMenu>
                                    <MenubarTrigger
                                        onClick     = {() => router.push( '/faculties' )}
                                        id          = "faculty"
                                        className   = "flex items-center gap-1.5"
                                        title       = "Facultades"
                                    >
                                        <Building className="h-5 w-5" /> 

                                        <span className="hidden xl:flex">Facultades</span>
                                    </MenubarTrigger>
                                </MenubarMenu>

                                <MenubarMenu>
                                    <MenubarTrigger
                                        onClick     = {() => router.push('/modules')}
                                        id          = "modules"
                                        title       = "Módulos"
                                        className   = "flex items-center gap-1.5"
                                    >
                                        <Clock className="h-5 w-5" />
                                        <span className="hidden xl:block">Módulos</span>
                                    </MenubarTrigger>
                                </MenubarMenu>

                                <MenubarMenu>
                                    <MenubarTrigger
                                        onClick     = {() => router.push('/days')}
                                        id          = "days"
                                        title       = "Días"
                                        className   = "flex items-center gap-1.5"
                                    >
                                        <Calendar className="h-5 w-5" />
                                        <span className="hidden xl:block">Días</span>
                                    </MenubarTrigger>
                                </MenubarMenu>

                                <MenubarMenu>
                                    <MenubarTrigger
                                        onClick     = {() => router.push( '/periods' )}
                                        id          = "periods"
                                        title       = "Periodos"
                                        className   = "flex items-center gap-1.5"
                                    >
                                        <CalendarClock className="h-5 w-5" />

                                        <span className="hidden xl:block">Periodos</span>
                                    </MenubarTrigger>
                                </MenubarMenu>

                                <MenubarMenu>
                                    <MenubarTrigger
                                        onClick     = {() => router.push('/sizes')}
                                        id          = "sizes"
                                        title       = "Tamaños"
                                        className   = "flex items-center gap-1.5"
                                    >
                                        <Ruler className="h-5 w-5" />
                                        <span className="hidden xl:block">Tamaños</span>
                                    </MenubarTrigger>
                                </MenubarMenu>

                                <MenubarMenu>
                                    <MenubarTrigger
                                        onClick     = {() => router.push( '/professors' )}
                                        id          = "professor"
                                        title       = "Profesores"
                                        className   = "flex items-center gap-1.5"
                                    >
                                        <UsersRound className="h-5 w-5" />

                                        <span className="hidden xl:block">Profesores</span>
                                    </MenubarTrigger>
                                </MenubarMenu>

                                <MenubarMenu>
                                    <MenubarTrigger
                                        onClick     = {() => router.push( '/grades' )}
                                        id          = "grade"
                                        title       = "Grados"
                                        className   = "flex items-center gap-1.5"
                                    >
                                        <GraduationCap className="h-5 w-5" />

                                        <span className="hidden xl:block">Grados</span>
                                    </MenubarTrigger>
                                </MenubarMenu>

                                <MenubarMenu>
                                    <MenubarTrigger
                                        onClick     = {() => router.push( '/sections' )}
                                        id          = "section"
                                        title       = "Secciones"
                                        className   = "flex items-center gap-1.5"
                                    >
                                        <Grid2X2 className="h-5 w-5" />

                                        <span className="hidden xl:block">Secciones</span>
                                    </MenubarTrigger>
                                </MenubarMenu>
                            </Menubar>

                            <NotificationDialogManager>
                                {({ onRequestClick, onRequestDetailClick }) => (
                                    <Notifications
                                        onRequestClick          = { onRequestClick }
                                        onRequestDetailClick    = { onRequestDetailClick }
                                    />
                                )}
                            </NotificationDialogManager>
                        </>)}

                        {/* <Theme /> */}

                        <Login />
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
