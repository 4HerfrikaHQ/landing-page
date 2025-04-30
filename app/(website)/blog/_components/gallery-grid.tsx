"use client";

import { cn } from "@/utils/cn";
import Image from "next/image";

type SpecialItems = {
	[key: string]: { rowSpan?: number; colSpan?: number };
};

const galleryItems = [
	{
		id: 1,
		imageUrl:
			"https://images.pexels.com/photos/6347720/pexels-photo-6347720.jpeg",
		alt: "Women supporting each other at a community event",
	},
	{
		id: 2,
		imageUrl:
			"https://images.pexels.com/photos/7282816/pexels-photo-7282816.jpeg",
		alt: "Planning session for community projects",
	},
	{
		id: 3,
		imageUrl:
			"https://images.pexels.com/photos/6347888/pexels-photo-6347888.jpeg",
		alt: "Educational outreach program",
	},
	{
		id: 4,
		imageUrl:
			"https://images.pexels.com/photos/6347919/pexels-photo-6347919.jpeg",
		alt: "Community education initiative",
	},
	{
		id: 5,
		imageUrl:
			"https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg",
		alt: "Woman speaking at an empowerment conference",
	},
	{
		id: 6,
		imageUrl:
			"https://images.pexels.com/photos/7433154/pexels-photo-7433154.jpeg",
		alt: "Skills training workshop",
	},
	{
		id: 7,
		imageUrl:
			"https://images.pexels.com/photos/6347927/pexels-photo-6347927.jpeg",
		alt: "Group planning session",
	},
	{
		id: 8,
		imageUrl:
			"https://images.pexels.com/photos/7648823/pexels-photo-7648823.jpeg",
		alt: "Women's leadership panel",
	},
	{
		id: 9,
		imageUrl:
			"https://images.pexels.com/photos/6347944/pexels-photo-6347944.jpeg",
		alt: "Shows",
	},
];

// Define the structure of the gallery with section names and items by index
const galleryLayout = [
	// Hero section with first image
	{
		sectionName: "hero",
		items: [0],
	},

	// Middle section with 2x3 grid layout
	{
		sectionName: "middle",
		// Start with 2 empty slots (null), then image 1 that spans 2 rows, then image 2,
		// then another empty slot (null), and finally images 3 and 4
		items: [null, null, 1, 2, null, 3, 4, 8],
		// Special layout info: span 2 rows for item at index 1
		specialItems: {
			"2": { rowSpan: 2 },
		} as SpecialItems,
		// Define grid structure for this section
		gridClass: "grid-cols-2 md:grid-cols-4 grid-rows-2",
		// Mark which item indexes are placeholders (not real images)
		placeholders: [0, 1, 4],
	},

	// Bottom section with last image spanning 2 columns
	{
		sectionName: "bottom",
		items: [5, 6, 7],
		// Special layout info: span 2 columns for last item
		specialItems: {
			"2": { colSpan: 2 },
		} as SpecialItems,
		gridClass: "grid-cols-2 md:grid-cols-4",
	},
];

// Type definitions
type GalleryItem = (typeof galleryItems)[number];
type SpecialLayout = {
	rowSpan?: number;
	colSpan?: number;
};

type RenderableItem = {
	item: GalleryItem | null;
	section: string;
	specialLayout: SpecialLayout;
	isPlaceholder?: boolean;
};

export function GalleryGrid() {
	const renderableItems: RenderableItem[] = [];

	// Process each section and its items
	for (const section of galleryLayout) {
		const placeholders = section.placeholders || [];

		// Process each item index in the section
		for (let i = 0; i < (section.items || []).length; i++) {
			const placeholderIndex = section.items[i];
			const isPlaceholder = placeholders.includes(i);

			// For placeholder items (null values or marked as placeholders)
			if (placeholderIndex === null || isPlaceholder) {
				renderableItems.push({
					item: null,
					section: section.sectionName,
					specialLayout: {},
					isPlaceholder: true,
				});
				continue;
			}

			// For real gallery items
			if (placeholderIndex < galleryItems.length) {
				renderableItems.push({
					item: galleryItems[placeholderIndex],
					section: section.sectionName,
					specialLayout: section.specialItems?.[i.toString()] || {},
				});
			}
		}
	}

	// Get items for each section
	const heroItems = renderableItems.filter((item) => item.section === "hero");
	const middleItems = renderableItems.filter(
		(item) => item.section === "middle",
	);
	const bottomItems = renderableItems.filter(
		(item) => item.section === "bottom",
	);

	// Find section configuration by name
	const getSection = (name: string) =>
		galleryLayout.find((s) => s.sectionName === name);

	const middleSection = getSection("middle");
	const bottomSection = getSection("bottom");

	return (
		<div className="bg-white py-8 md:py-12 lg:py-16 xl:py-20">
			<div className="mx-auto container px-4 sm:px-6 lg:px-8">
				{/* Hero section with first image */}
				<div className="flex flex-col md:flex-row justify-between items-start mb-10">
					<div className="w-full md:w-1/2 mb-6 md:mb-0">
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold max-w-sm text-gray-700">
							4HerFrika Impact Gallery
						</h2>
						<p className="text-base sm:text-lg md:text-xl text-gray-600 mt-3 max-w-md">
							Explore memorable moments and milestones captured through
							4HerFrika&apos;s journey.
						</p>
						<div className="mt-6">
							<button
								type="button"
								className="inline-flex items-center border border-pink-500 text-pink-500 rounded-full py-2 px-6 hover:bg-pink-50 transition-colors"
							>
								<span>View all Photos</span>
								<svg
									className="ml-2 w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<title>Arrow Right</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M14 5l7 7m0 0l-7 7m7-7H3"
									/>
								</svg>
							</button>
						</div>
					</div>

					{heroItems.length > 0 && heroItems[0].item && (
						<div className="w-full md:w-1/2 md:pl-8">
							<div className="rounded-lg overflow-hidden h-[200px] relative">
								<Image
									src={heroItems[0].item.imageUrl || "/placeholder.svg"}
									alt={heroItems[0].item.alt}
									fill
									sizes="(max-width: 768px) 100vw, 50vw"
									className="object-cover hover:scale-105 transition-transform duration-300"
								/>
							</div>
						</div>
					)}
				</div>

				{/* Middle section - 2x3 grid layout */}
				{middleItems.length > 0 && (
					<div className={cn("grid gap-4 mb-10", middleSection?.gridClass)}>
						{middleItems.map((item, idx) => {
							const rowSpan = item.specialLayout.rowSpan || 1;
							const colSpan = item.specialLayout.colSpan || 1;

							// For placeholder cells, render an empty div
							if (item.isPlaceholder) {
								return (
									<div
										key={`placeholder-${idx + 1}`}
										className={cn(
											"hidden md:block",
											colSpan > 1 && `md:col-span-${colSpan}`,
											rowSpan > 1 && `md:row-span-${rowSpan}`,
										)}
									/>
								);
							}

							// For actual image items
							return (
								<div
									key={item.item?.id || `middle-${idx}`}
									className={cn(
										"",
										colSpan > 1 && `md:col-span-${colSpan}`,
										rowSpan > 1 && `md:row-span-${rowSpan}`,
									)}
								>
									<div
										className={cn(
											"rounded-lg overflow-hidden relative",
											rowSpan > 1 ? "h-full" : "h-[200px]",
										)}
									>
										{item.item && (
											<Image
												src={item.item.imageUrl || "/placeholder.svg"}
												alt={item.item.alt}
												fill
												sizes={`(max-width: 768px) ${colSpan > 1 ? "100vw" : "50vw"}, ${25 * colSpan}vw`}
												className="object-cover hover:scale-105 transition-transform duration-300"
											/>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Bottom section with last image spanning 2 columns */}
				{bottomItems.length > 0 && (
					<div className={cn("grid gap-4", bottomSection?.gridClass)}>
						{bottomItems.map((item, idx) => {
							const colSpan = item.specialLayout.colSpan || 1;

							return (
								<div
									key={item.item?.id || `bottom-${idx}`}
									className={cn("", colSpan > 1 && `md:col-span-${colSpan}`)}
								>
									<div className="rounded-lg overflow-hidden h-[200px] relative">
										{item.item && (
											<Image
												src={item.item.imageUrl || "/placeholder.svg"}
												alt={item.item.alt}
												fill
												sizes={`(max-width: 768px) ${colSpan > 1 ? "100vw" : "50vw"}, ${25 * colSpan}vw`}
												className="object-cover hover:scale-105 transition-transform duration-300"
											/>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
