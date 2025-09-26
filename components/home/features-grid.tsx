'use client'

import { FeatureCard } from "./feature-card";
import { featuresConfig } from "./features-config";


/**
 * Grid component that displays all feature cards with staggered animations
 */
export function FeaturesGrid() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-16">
			{featuresConfig.map( ( feature, index ) => (
				<div
					key         = { feature.id }
					className   = "animate-in fade-in slide-in-from-bottom-4"
					style       = {{ 
						animationDelay      : `${index * 100}ms`,
						animationDuration   : '600ms',
						animationFillMode   : 'both'
					}}
				>
					<FeatureCard
						icon        = { feature.icon }
						title       = { feature.title }
						description = { feature.description }
						href        = { feature.href }
					/>
				</div>
			))}
		</div>
	);
}
