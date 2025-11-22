"use client";

import type React from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';


interface Props {
    isOpen          : boolean;
    onClose         : () => void;
    onConfirm       : () => void;
    type            : string;
    name            : string;
    isDeleted?      : boolean;
    confirmText?    : string;
    secondText?     : string;
}


export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    type,
    name,
    isDeleted   = true,
    confirmText = "Eliminar",
    secondText  = ""
}: Props ): React.JSX.Element {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>

                    <AlertDialogDescription>
                        { isDeleted 
                            ? `Esta acción no se puede deshacer. Se eliminará permanentemente ${ type } `
                            : `Esta acción ${ secondText } `
                        }

                        <span className="font-semibold">"{ name }"</span> del sistema.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>

                    <AlertDialogAction
                        onClick     = { onConfirm }
                        className   = "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        { confirmText }
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
