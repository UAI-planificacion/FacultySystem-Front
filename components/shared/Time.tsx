"use client"

import { useRef, useState } from "react";

import { Clock, ChevronDown } from "lucide-react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger
}                   from "@/components/ui/popover";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";

import { cn } from "@/lib/utils";


interface TimeSelectorProps {
    hours?          : number[];
    minutes?        : number[];
    hourJump?       : number;
    minuteJump?     : number;
    startHour?      : number;
    startMinute?    : number;
    endHour?        : number;
    endMinute?      : number;
    value?          : string;
    onChange?       : ( time: string ) => void;
    placeholder?    : string;
}


export function Time({
    hours,
    minutes,
    hourJump    = 1,
    minuteJump  = 1,
    startHour   = 0,
    startMinute = 0,
    endHour     = 23,
    endMinute   = 59,
    value       = "",
    onChange,
    placeholder = "Seleccionar hora",
}: TimeSelectorProps) {
    const [h, m]                        = value ? value.split( ":" ) : [null, null];
    const [isOpen, setIsOpen]           = useState( false );
    const [hourInput, setHourInput]     = useState( h || "" );
    const [minuteInput, setMinuteInput] = useState( m || "" );
    const hourRef                       = useRef<HTMLInputElement>( null );
    const minuteRef                     = useRef<HTMLInputElement>( null );


    function generateHours(): number[] {
        if ( hours ) return hours;

        const hoursArray: number[] = [];
        const jump = hourJump || 1;

        for ( let i = startHour; i <= endHour; i += jump ) {
            hoursArray.push( i );
        }

        return hoursArray;
    }


    function generateMinutes(): number[] {
        if ( minutes ) return minutes;

        const minutesArray: number[] = [];
        const jump = minuteJump || 1;

        for ( let i = startMinute; i <= endMinute; i += jump ) {
            minutesArray.push( i );
        }

        return minutesArray;
    }


    const availableHours    = generateHours();
    const availableMinutes  = generateMinutes();
    const [currentHour, currentMinute] = value ? value.split(":").map(Number) : [null, null];
    const formatNumber = ( num: number ): string => num.toString().padStart( 2, "0" );


    function handleHourSelect( hour: number ): void {
        const minute = currentMinute !== null ? currentMinute : availableMinutes[0];
        const timeString = `${formatNumber(hour)}:${formatNumber(minute)}`;
        setHourInput(hour.toString());
        onChange?.(timeString);
    }


    function handleMinuteSelect( minute: number ): void {
        const hour = currentHour !== null ? currentHour : availableHours[0];
        const timeString = `${formatNumber(hour)}:${formatNumber(minute)}`;
        setMinuteInput(minute.toString())
        onChange?.(timeString)
    }


    function handleHourInputChange( e: React.ChangeEvent<HTMLInputElement> ): void {
        const inputValue = e.target.value;
        setHourInput( inputValue );

        const hourNumber = Number.parseInt( inputValue, 10 );

        if ( !isNaN( hourNumber ) && availableHours.includes( hourNumber )) {
            handleHourSelect( hourNumber );
        }
    }


    function handleMinuteInputChange( e: React.ChangeEvent<HTMLInputElement> ): void {
        const inputValue = e.target.value;
        setMinuteInput( inputValue );

        const minuteNumber = Number.parseInt( inputValue, 10 );

        if ( !isNaN( minuteNumber ) && availableMinutes.includes( minuteNumber )) {
            handleMinuteSelect( minuteNumber );
        }
    }


    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("w-full justify-between text-left font-normal", !value && "text-muted-foreground")}
                >
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{value || placeholder}</span>
                    </div>

                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-2 flex gap-2">
                    {/* Columna de Horas */}
                    <div className="space-y-3">
                        <Input
                            ref         = { hourRef }
                            placeholder = "Hora"
                            value       = { hourInput }
                            onChange    = { handleHourInputChange }
                            className   = "h-8 text-sm text-center"
                            onKeyDown   = {(e) => {
                                if (e.key === 'Tab' && !e.shiftKey) {
                                    e.preventDefault();
                                    minuteRef.current?.focus();
                                }
                            }}
                        />

                        <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                            {availableHours.map((hour) => (
                                <Button
                                    key         = { hour }
                                    variant     = { currentHour === hour ? "default" : "outline" }
                                    size        = "sm"
                                    className   = "h-8 text-xs font-mono"
                                    onClick     = { () => handleHourSelect( hour )}
                                >
                                    { formatNumber( hour )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <span className="flex items-center justify-center font-bold">:</span>

                    {/* Columna de Minutos */}
                    <div className="space-y-3">
                        <Input
                            ref         = { minuteRef }
                            placeholder = "Minutos"
                            value       = { minuteInput }
                            onChange    = { handleMinuteInputChange }
                            className   = "h-8 text-sm text-center"
                            onKeyDown   = {(e) => {
                                if (e.key === 'Tab' && !e.shiftKey) {
                                    e.preventDefault();
                                    hourRef.current?.focus();
                                }
                            }}
                        />

                        <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                            {availableMinutes.map((minute) => (
                                <Button
                                    key         = { minute }
                                    variant     = { currentMinute === minute ? "default" : "outline" }
                                    size        = "sm"
                                    className   = "h-8 text-xs font-mono"
                                    onClick     = { () => handleMinuteSelect( minute )}
                                >
                                    { formatNumber( minute )}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
