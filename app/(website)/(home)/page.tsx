import { Button } from "@/components/Button";
import { TestimonialCard } from "@/components/TestimonialCard";
import { createClient } from "@/prismicio";
import type { Content } from "@prismicio/client";
import { PrismicImage } from "@prismicio/react";
import Sponsors from "../_components/sponsors";
import AfricaLogo from "../africa-logo.svg";
import { ExploreCommunity } from "./_components/explore-community";
import { Hero } from "./_components/hero";
import TestimonialCarouselDots from "./_components/testimonial-carousel-dots";

export default async function HomePage() {
	const client = createClient();
	const page = await client.getSingle<Content.HomepageDocument>("homepage");

	const {
		testimonials,
		ambassador_description,
		ambassador_image,
		ambassador_link,
		hero_image: heroImage,
		members,
		campuses,
		countries,
	} = page.data;

	return (
		<section className="bg-white">
			<Hero
				heroImage={heroImage}
				members={members}
				campuses={campuses}
				countries={countries}
			/>
			<Sponsors />
			<ExploreCommunity />

			{/* Words of the street */}
			{testimonials.length > 0 && (
				<section className="relative bg-neutral-400 px-4 py-12 lg:px-7 lg:pt-20 lg:pb-24 overflow-x-hidden">
					<AfricaLogo className="w-24 absolute -right-12 top-24 lg:w-[270px] lg:-right-8 lg:top-8" />
					<AfricaLogo className="hidden lg:block w-[270px] absolute left-4 bottom-0" />

					<h1 className="text-center text-gray-400 text-3xl lg:text-4xl font-semibold mb-4 lg:mb-8">
						<span className="text-primary-500">Words</span> on The{" "}
						<span className="text-primary-500">Street</span>
					</h1>

					<p className="text-center text-gray-400 text-lg mb-8 lg:text-xl">
						Take a look at what our members say!
					</p>

					<div className="container mx-auto px-2">
						<div className="flex gap-8 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-12 md:overflow-visible md:snap-none h-full">
							{/* Spacer for mobile snapping */}
							<div className="flex-shrink-0 w-4 md:hidden" />

							{testimonials.map((testimonial) => (
								<div className="flex-shrink-0 h-full " key={testimonial.name}>
									<TestimonialCard testimonial={testimonial} />
								</div>
							))}
						</div>
					</div>
					<TestimonialCarouselDots dotsCount={testimonials.length} />
				</section>
			)}

			<section className="px-4 sm:px-6 md:px-7 container mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 w-full lg:pt-20 py-12 lg:pb-28">
				<div>
					<h3 className="text-gray-400 text-center lg:text-left text-3xl lg:text-4xl font-bold capitalize tracking-wide mb-3 sm:mb-4 lg:mb-6">
						Become an ambassador{" "}
					</h3>
					<p className=" text-center lg:text-left text-lg lg:text-xl text-gray-300 mb-4 sm:mb-6 lg:mb-9">
						{ambassador_description}
					</p>
					<div className="lg:hidden relative w-full aspect-[1.16]">
						<PrismicImage
							field={ambassador_image}
							className="object-cover rounded-xl w-full h-full"
						/>
					</div>
					<div className="flex items-center gap-3 sm:gap-4 mt-8 lg:mt-0 lg:gap-6 flex-wrap justify-center lg:justify-start">
						<Button
							href="/"
							variant="outline"
							className="px-8 py-3 md:py-4 text-base md:text-xl"
						>
							View Projects
						</Button>

						<Button
							className=" px-8 py-3 md:py-4 text-base md:text-xl"
							href={ambassador_link.text || "/"}
							isExternal
						>
							Join Us
						</Button>
					</div>
				</div>
				<div className="hidden lg:block relative w-full aspect-[1.16]">
					<PrismicImage
						field={ambassador_image}
						className="object-cover rounded-xl w-full h-full"
					/>
				</div>
			</section>
		</section>
	);
}
