"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatisticCardProps {
    title           : string
    value           : string | number
    description?    : string
    icon?           : React.ReactNode
    className?      : string
}


export function StatisticCard({
    title,
    value,
    description,
    icon,
    className,
}: StatisticCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
                <CardTitle className="text-sm font-medium text-white">
                    {title}
                </CardTitle>

                {icon && (
                    <div className="h-8 w-8 text-muted-foreground">{icon}</div>
                )}
            </CardHeader>

            <CardContent>
                <div className="text-2xl font-bold py-0">{value}</div>

                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}
