'use client'

import { JSX, useEffect, useState } from "react";
import Image from "next/image";

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
    getSession,
    signIn,
    signOut
}                       from "@/config/better-auth/auth-client";
import { useSession }   from "@/hooks/use-session";


export function Login(): JSX.Element {
    const { session, isLoading } = useSession();

    return (
        <>
            {isLoading ? (
                <Button
                    className   = "bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white"
                    variant     = "outline"
                    disabled    = { true }
                >
                    Cargando...
                    <LoaderMini />
                </Button>
            ) : (
                session?.user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant     = "outline"
                                className   = "gap-2 bg-black text-white border-zinc-700"
                            >
                                <Image
                                    src     = { session?.user?.image }
                                    alt     = { session?.user?.name }
                                    width   = { 30 }
                                    height  = { 30 }
                                    loading = "lazy"
                                    className="rounded-full mr-2"
                                />

                                <span className="hidden md:flex">{session?.user?.name}</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>{session?.user?.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>{session?.user?.email}</DropdownMenuLabel>

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