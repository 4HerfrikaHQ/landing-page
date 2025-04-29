import type { Content } from "@prismicio/client";
import { PrismicImage } from "@prismicio/react";
import { FaStar } from "react-icons/fa6";

export function TestimonialCard({
	testimonial,
}: {
	testimonial: Content.HomepageDocument["data"]["testimonials"][number];
}) {
	return (
		<div
			className="testimonial-card min-h-36 snap-start relative w-[79vw] flex-shrink-0 md:w-full h-full bg-primary-500/70 rounded-2xl pl-8 md:pl-14 pr-5 lg:pr-10 py-4 lg:py-6 flex flex-col"
			style={{ boxShadow: "2.18px 10.91px 26.18px 0px rgba(0, 0, 0, 0.18)" }}
		>
			<PrismicImage
				className="size-11 lg:size-20 absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 object-cover rounded-full"
				field={testimonial.profile_picture}
			/>
			<div className="flex flex-col flex-grow h-full">
				<p className="text-[9px] lg:text-lg font-medium lg:leading-6 mb-auto lg:mb-6">
					{testimonial.testimonial}
				</p>
				<div className="flex items-center justify-between">
					<div>
						<h4 className="text-[10px] md:text-lg font-semibold lg:font-bold mb-1.5">
							{testimonial.name}
						</h4>
						<p className="text-[7px] lg:text-sm">
							{testimonial.role_and_location}
						</p>
					</div>
					<div className="flex items-center gap-0.5 md:gap-1">
						{Array.from({ length: Number(testimonial.rating) }).map((_, i) => (
							<FaStar
								key={`${testimonial.name}-${testimonial.rating}-${i}`}
								className="text-[9px] md:text-lg"
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
