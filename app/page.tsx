import { FeaturesGrid } from '@/components/home/features-grid';


export default function Home() {
	return (
		<div className="flex flex-col h-full">
			<section className="flex-1">
				<div className="max-w-7xl mx-auto text-center space-y-16 py-8">
					<div className="animate-in fade-in slide-in-from-top-4 duration-700">
						<h2 className="text-4xl font-bold tracking-tight">
							Gestión Integral de Facultades
						</h2>
					</div>

					<div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Gestiona eficientemente las facultades, materias, centros de costos y personal de tu institución educativa en un solo lugar.
						</p>
					</div>

                    <FeaturesGrid />
				</div>
			</section>
		</div>
	);
}
