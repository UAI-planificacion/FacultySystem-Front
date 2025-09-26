'use client'

import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";

import { useSession } from "@/hooks/use-session";


interface FeatureCardProps {
	icon        : LucideIcon;
	title       : string;
	description : string;
	href        : string;
}


/**
 * Feature card component with hover animations and authentication validation
 */
export function FeatureCard( { icon: Icon, title, description, href }: FeatureCardProps ) {
	const router        = useRouter();
	const { staff }     = useSession();


	const handleClick = () => {
		if ( staff ) {
			router.push( href );
		}
	};


	return (
		<div 
			className={`
				group relative bg-card p-6 rounded-lg border border-border 
				flex flex-col items-center text-center cursor-pointer
				transition-all duration-300 ease-in-out
				hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30
				hover:-translate-y-1 hover:scale-[1.02]
				${staff ? 'hover:bg-card/80' : 'opacity-60 cursor-not-allowed'}
			`}
			onClick     = { handleClick }
			role        = "button"
			tabIndex    = { staff ? 0 : -1 }
			aria-label  = { staff ? `Ir a ${title}` : `${title} - Requiere autenticación` }
		>
			{/* Background gradient effect */}
			<div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			
			{/* Icon container with animation */}
			<div className="relative h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
				<Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
			</div>

			{/* Title with animation */}
			<h3 className="relative text-lg font-medium mb-2 group-hover:text-primary transition-colors duration-300">
				{ title }
			</h3>

			{/* Description */}
			<p className="relative text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
				{ description }
			</p>

			{/* Authentication indicator */}
			{!staff && (
				<div className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" 
					title="Requiere autenticación" 
				/>
			)}

			{/* Hover effect overlay */}
			<div className="absolute inset-0 rounded-lg border-2 border-primary/0 group-hover:border-primary/20 transition-colors duration-300" />
		</div>
	);
}
