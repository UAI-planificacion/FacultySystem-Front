'use client'

import { JSX }          from "react";
import Image            from "next/image";
import { useRouter }    from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
}                   from "@/components/ui/dropdown-menu"
import { Button }   from "@/components/ui/button";

import { MicrosoftIcon }    from "@/icons/microsoft";
import LoaderMini           from "@/icons/LoaderMini";

import {
    signIn,
    signOut
}                       from "@/config/better-auth/auth-client";
import { useSession }   from "@/hooks/use-session";


export function Login(): JSX.Element {
    const router                = useRouter();
    const { data, isLoading }   = useSession();

    return (
        <>
            {isLoading ? (
                <Button
                    className   = "bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white gap-1.5"
                    variant     = "outline"
                    disabled    = { true }
                >
                    Cargando...
                    <LoaderMini />
                </Button>
            ) : (
                data?.user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant     = "outline"
                                className   = "px-1 md:px-3 gap-2 bg-black text-white border-zinc-700"
                            >
                                <Image
                                    src         = { data.user?.image || '' }
                                    alt         = { data.user?.name }
                                    width       = { 30 }
                                    height      = { 30 }
                                    loading     = "lazy"
                                    className   = "rounded-full"
                                />

                                <span className="hidden md:flex">{ data.user?.name }</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-64" align="end">
                            {/* Routes */}
                            <DropdownMenuItem className="p-0">
                                <Button
                                    size        = "sm"
                                    type        = "button"
                                    variant     = "ghost"
                                    onClick     = {() => router.push( '/faculties' )}
                                    className   = "w-full flex justify-start lg:hidden"
                                >
                                    Facultades
                                </Button>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="lg:hidden" />

                            <DropdownMenuItem className="p-0">
                                <Button
                                    size        = "sm"
                                    type        = "button"
                                    variant     = "ghost"
                                    onClick     = {() => router.push( '/professors' )}
                                    className   = "w-full flex justify-start lg:hidden"
                                >
                                    Profesores
                                </Button>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="lg:hidden" />

                            <DropdownMenuItem className="p-0">
                                <Button
                                    size        = "sm"
                                    type        = "button"
                                    variant     = "ghost"
                                    onClick     = {() => router.push( '/grades' )}
                                    className   = "w-full flex justify-start lg:hidden"
                                >
                                    Grados
                                </Button>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="lg:hidden" />

                            {/* Profile */}
                            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>{data.user?.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>{data.user?.email}</DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem>
                                <Button
                                    type        = "button"
                                    variant     = {'outline'}
                                    className   = "bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white gap-1.5 w-full"
                                    onClick     = { async () => await signOut() }
                                >
                                    <MicrosoftIcon />
                                    Cerrar sesión
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button
                        type        = "button"
                        variant     = {'outline'}
                        className   = "bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white gap-1.5"
                        onClick     = { async () => await signIn()}
                    >
                        <MicrosoftIcon />
                        <span className="hidden sm:block">Iniciar sesión</span>
                    </Button>
                )
            )}
        </>
    );
}
