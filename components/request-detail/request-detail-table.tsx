import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                       from "@/components/ui/table"
import { Checkbox }     from "@/components/ui/checkbox"
import { Day, Module }  from "@/types/request";
import { JSX } from "react";


interface RequestDetailModule {
    id          : string;
    day         : string;
    moduleId    : string;
}


interface RequestDetailTableProps {
    requestDetailModule : RequestDetailModule[];
    days                : Day[];
    modules             : Module[];
    onModuleToggle      : ( day: string, moduleId: string, isChecked: boolean ) => void;
}


export function RequestDetailTable({
    requestDetailModule,
    days,
    modules,
    onModuleToggle
}: RequestDetailTableProps ): JSX.Element {
    const isChecked = ( day: string, moduleId: string ): boolean =>
        requestDetailModule
            .some(( item ) => item.day === day && item.moduleId === moduleId );

    const handleCheckboxChange = ( day: string, moduleId: string, checked: boolean ): void => {
        onModuleToggle( day, moduleId, checked );
    };

    return (
        <div className="w-full">
            <div className="border rounded-lg bg-background relative">
                {/* Header fijo */}
                <div className="sticky top-0 z-30 bg-background border-b">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[12.2rem] px-3 border-r bg-background">
                                        Módulos
                                    </TableHead>

                                    {days.map((day) => (
                                        <TableHead key={day.id} className="text-center w-20 min-w-20 px-2 whitespace-nowrap bg-background">
                                            {day.name}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                        </Table>
                    </div>
                </div>

                {/* Contenido con scroll */}
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                    <Table>
                        <TableBody>
                            {modules.map((module) => (
                                <TableRow key={module.id}>
                                    <TableCell className="sticky left-0 bg-background z-10 w-32 min-w-32 p-3 border-r shadow-md">
                                        <div className="text-xs truncate" title={`${module.name} ${module.difference ?? ''} ${module.startHour}-${module.endHour}`}>
                                            {module.name} {module.difference ?? ''} {module.startHour}-{module.endHour}
                                        </div>
                                    </TableCell>
                                    {days.map( day => (
                                        <TableCell key={`${module.id}-${day.id}`} className="text-center w-20 min-w-20 p-2">
                                            <div className="flex justify-center">
                                                <Checkbox 
                                                    checked     = { isChecked( day.name, module.id.toString() ) }
                                                    onCheckedChange = { ( checked: boolean ) => 
                                                        handleCheckboxChange( day.name, module.id.toString(), checked )
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
