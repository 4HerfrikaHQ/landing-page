"use client";
import { cn } from "@/utils/cn";
import React, { useEffect, useRef, useState } from "react";

/**
 * I moved this to it's own component to localize the logic within it and keep the client components
 * as low down the tree as possible
 * */
const TestimonialCarouselDots = ({ dotsCount }: { dotsCount: number }) => {
	const hasAddedListener = useRef<boolean>(false);
	const [activeDot, setActiveDot] = useState<number>(0);

	useEffect(() => {
		if (!hasAddedListener.current) {
			hasAddedListener.current = true;

			const testimonialCards = Array.from(
				document.querySelectorAll(".testimonial-card"),
			);

			const observer = new IntersectionObserver(
				(entries) => {
					const intersecting = entries.find((entry) => entry.isIntersecting);

					if (intersecting) {
						const index = testimonialCards.findIndex(
							(card) => card === entries[0].target,
						);
						setActiveDot(index);
					}
				},
				{
					threshold: 1,
				},
			);

			for (const card of testimonialCards) {
				observer.observe(card);
			}
		}
	}, []);

	return (
		<div className="mt-5 flex gap-x-2.5 justify-center md:hidden">
			{Array.from({ length: dotsCount }).map((_, index) => (
				<span
					key={`dot-${index + 1}`}
					className={cn("flex size-2.5 bg-primary-500 rounded-xl", {
						"opacity-20": activeDot !== index,
					})}
				/>
			))}
		</div>
	);
};

export default TestimonialCarouselDots;
