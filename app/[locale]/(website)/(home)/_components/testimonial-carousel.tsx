"use client";

import type { Content } from "@prismicio/client";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
} from "@/components/ui/carousel";
import { TestimonialCard } from "./testimonial-card";

export function TestimonialCarousel({
	testimonials,
}: {
	testimonials: Content.HomepageDocument["data"]["testimonials"];
}) {
	return (
		<Carousel
			opts={{ align: "start", loop: true }}
			className="w-full"
		>
			<CarouselContent className="-ml-4">
				{testimonials.map((testimonial) => (
					<CarouselItem
						key={testimonial.name}
						className="pl-4 basis-[85%] md:basis-1/2"
					>
						<TestimonialCard testimonial={testimonial} />
					</CarouselItem>
				))}
			</CarouselContent>
			<div className="flex justify-center gap-2 mt-6">
				<CarouselPrevious className="static translate-y-0" />
				<CarouselNext className="static translate-y-0" />
			</div>
		</Carousel>
	);
}
