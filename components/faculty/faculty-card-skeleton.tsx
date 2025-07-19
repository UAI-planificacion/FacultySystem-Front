"use client"

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/components/ui/card";


/**
 * Skeleton component for FacultyCard loading state
 * Displays animated placeholders that match the structure of FacultyCard
 */
export function FacultyCardSkeleton() {
	return (
		<Card className="w-full transition-all duration-300 shadow-lg">
			<CardHeader className="pb-0">
				<div>
					{/* Title skeleton with icon placeholder */}
					<CardTitle className="text-xl font-bold flex items-center gap-2">
						<div className="h-5 w-5 bg-gray-300 rounded animate-pulse" />
						<div className="h-6 w-48 bg-gray-300 rounded animate-pulse" />
					</CardTitle>

					{/* Description skeleton */}
					<CardContent className="mt-3 ml-2">
						<div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
					</CardContent>
				</div>
			</CardHeader>

			<CardFooter className="flex flex-wrap gap-2 pt-2">
				{/* Statistics buttons skeleton */}
				<div className="flex items-center gap-1.5 px-3 py-1.5 border rounded-md">
					<div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
					<div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
				</div>

				<div className="flex items-center gap-1.5 px-3 py-1.5 border rounded-md">
					<div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
					<div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
				</div>

				<div className="flex items-center gap-1.5 px-3 py-1.5 border rounded-md">
					<div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
					<div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
				</div>

				{/* Action buttons skeleton */}
				<div className="flex gap-2 ml-auto">
					<div className="flex items-center gap-1 px-3 py-1.5 border rounded-md">
						<div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
						<div className="h-4 w-12 bg-gray-300 rounded animate-pulse hidden 2xl:block" />
					</div>

					<div className="flex items-center gap-1 px-3 py-1.5 border rounded-md bg-red-50">
						<div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
						<div className="h-4 w-16 bg-gray-300 rounded animate-pulse hidden 2xl:block" />
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}


/**
 * Component that renders multiple FacultyCardSkeleton components in a grid
 * @param count - Number of skeleton cards to display (default: 6)
 */
export function FacultyCardSkeletonGrid({ count = 6 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{Array.from({ length: count }).map((_, index) => (
				<FacultyCardSkeleton key={index} />
			))}
		</div>
	);
}