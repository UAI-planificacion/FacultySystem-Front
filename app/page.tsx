import { Building2, BookOpen, Users } from 'lucide-react';

import { Login } from '@/components/auth/Login';


export default function Home() {
    return (
        <main className="flex flex-col min-h-[calc(100vh-74px)]">
            <section className="flex-1 container mx-auto py-12">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-4xl font-bold tracking-tight">
                        Gestión Integral de Facultades
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Gestiona eficientemente las facultades, materias, centros de costos y personal de tu institución educativa en un solo lugar.
                    </p>

                    <Login />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                        <div className="bg-card p-6 rounded-lg border border-border flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>

                            <h3 className="text-lg font-medium mb-2">Gestión de Facultades</h3>

                            <p className="text-muted-foreground">
                                Crea y gestiona facultades con información detallada y seguimiento.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>

                            <h3 className="text-lg font-medium mb-2">Asignación de Materias</h3>

                            <p className="text-muted-foreground">
                                Asigna materias a facultades con gestión de capacidad estudiantil.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-primary" />
                            </div>

                            <h3 className="text-lg font-medium mb-2">Gestión de Personal</h3>

                            <p className="text-muted-foreground">
                                Asigna personal a facultades con control de acceso basado en roles.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
