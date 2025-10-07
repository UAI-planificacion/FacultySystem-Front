'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLinkIcon } from 'lucide-react';


export function SessionInfoRequest() {
    return (
        <Card>
            <CardContent className="mt-4">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <div className="grid grid-cols-5 gap-4">
                                <span className="font-medium">Solicitud:</span>
                                <span className="font-medium">Nombre de la solicitud</span>
                                <span className="font-medium">Estado</span>
                                <span className="fonr-medium">Pendiente</span>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    title="Ver solicitud"
                                >
                                    <ExternalLinkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent>
                            <div className="grid grid-cols-4 gap-4">
                                <span>Espacio</span>
                                <span>XL</span>
                                <span>Edificio</span>
                                <span>B</span>
                            </div>

                            <hr className="my-2" />

                            <div className="grid grid-cols-4 gap-4">
                                <span>En la Tarde</span>
                                <span>SI</span>
                                <span>Es prioritario</span>
                                <span>NO</span>
                            </div>

                            <hr className="my-2" />

                            <div className="grid grid-cols-4 gap-4">
                                <span>Grado</span>
                                <span>Postgrado</span>
                                <span>Profesor</span>
                                <span>Juan Perez</span>
                            </div>

                            <hr className="my-2" />
                            <div className="grid grid-cols-2 gap-4">
                                <span>Descripción</span>
                                <span>Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque eos temporibus perferendis culpa quibusdam quas porro voluptas. Assumenda iure animi dicta, molestias aperiam aspernatur. Libero quas delectus soluta adipisci blanditiis?</span>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}
