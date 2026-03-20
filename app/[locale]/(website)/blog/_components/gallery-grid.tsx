"use client";

import { StaggerContainer, StaggerItem, FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Gallery1 from "../assets/gallery/gallery--1.jpg";
import Gallery2 from "../assets/gallery/gallery--2.jpg";
import Gallery3 from "../assets/gallery/gallery--3.jpg";
import Gallery4 from "../assets/gallery/gallery--4.jpg";
import Gallery6 from "../assets/gallery/gallery--6.jpg";
import Gallery8 from "../assets/gallery/gallery--8.jpg";

type SpecialItems = {
	[key: string]: { rowSpan?: number; colSpan?: number };
};

const galleryItems = [
	{
		id: 1,
		imageUrl: Gallery1.src,
		alt: "bootcamp @lautech campus",
	},
	{
		id: 2,
		imageUrl: Gallery2.src,
		alt: "lady speaking at @lautech bootcamp",
	},
	{
		id: 3,
		imageUrl: Gallery3.src,
		alt: "Lady Speaking at @FUTA launch session",
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
		imageUrl: Gallery6.src,
		alt: "4Herfrika launch @lautech",
	},
	{
		id: 7,
		imageUrl:
			"https://images.pexels.com/photos/6347927/pexels-photo-6347927.jpeg",
		alt: "Group planning session",
	},
	{
		id: 8,
		imageUrl: Gallery8.src,
		alt: "4Herfrika launch @lautech group picture",
	},
	{
		id: 9,
		imageUrl: Gallery4.src,
		alt: "4herfrika launch @FUTA group picture",
	},
];

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
		<div className="bg-background py-8 md:py-12 lg:py-16 xl:py-20">
			<div className="mx-auto container px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col md:flex-row justify-between items-start mb-10">
					<FadeIn direction="left" className="w-full md:w-1/2 mb-6 md:mb-0">
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold max-w-sm text-foreground">
							4HerFrika Impact Gallery
						</h2>
						<p className="text-base sm:text-lg md:text-xl text-muted-foreground mt-3 max-w-md">
							Explore memorable moments and milestones captured through
							4HerFrika&apos;s journey.
						</p>
						<div className="mt-6">
							<Button
								href="https://drive.google.com/drive/folders/1T9pPsObVV-x7UxGu70cj2XcX5PZNcw3g"
								isExternal
								variant="outline"
								className="inline-flex items-center border border-pink-500 text-pink-500 rounded-full py-2 px-6"
							>
								<span>View all Photos</span>
								<ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
							</Button>
						</div>
					</FadeIn>

					{heroItems.length > 0 && heroItems[0].item && (
						<FadeIn direction="right" delay={0.15} className="w-full md:w-1/2 md:pl-8">
							<div className="rounded-lg overflow-hidden h-50 relative">
								<Image
									src={heroItems[0].item.imageUrl || "/placeholder.svg"}
									alt={heroItems[0].item.alt}
									fill
									sizes="(max-width: 768px) 100vw, 50vw"
									className="object-cover hover:scale-105 transition-transform duration-300"
								/>
							</div>
						</FadeIn>
					)}
				</div>

				{/* Middle section - 2x3 grid layout */}
				{middleItems.length > 0 && (
					<StaggerContainer className={cn("grid gap-4 mb-10", middleSection?.gridClass)}>
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
								<StaggerItem
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
											rowSpan > 1 ? "h-full" : "h-50",
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
								</StaggerItem>
							);
						})}
					</StaggerContainer>
				)}

				{/* Bottom section with last image spanning 2 columns */}
				{bottomItems.length > 0 && (
					<StaggerContainer className={cn("grid gap-4", bottomSection?.gridClass)}>
						{bottomItems.map((item, idx) => {
							const colSpan = item.specialLayout.colSpan || 1;

							return (
								<StaggerItem
									key={item.item?.id || `bottom-${idx}`}
									className={cn("", colSpan > 1 && `md:col-span-${colSpan}`)}
								>
									<div className="rounded-lg overflow-hidden h-50 relative">
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
								</StaggerItem>
							);
						})}
					</StaggerContainer>
				)}
			</div>
		</div>
	);
}
