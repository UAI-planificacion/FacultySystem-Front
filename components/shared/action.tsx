'use client'

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

export function ActionButton(
    {
        editItem,
        deleteItem,
        item
    }: {
        editItem: (obj: any) => void;
        deleteItem: (obj: any) => void;
        item: any;
    }
) {
    return (
        <div className="flex justify-end gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editItem( item )}
            >
                <Pencil className="h-4 w-4 text-blue-500" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteItem( item )}
            >
                <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
        </div>
    );
}
